import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  DriverCredential,
  DriverCredentialType,
  IdentityDocument,
  IdentityDocumentType,
  Member,
  MemberKind,
  VehicleCategory,
} from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { MemberStore } from '../../../stores/member/member.store';
import { DocumentStore } from '../../../stores/document/document.store';
import { DocumentAssetGateway, StoredDocumentAsset } from '../../../core/services/document-asset.gateway';
import { DocumentCaptureComponent, DocumentCaptureFieldValues } from '../components/document-capture.component';
import { DriverEligibilityPanelComponent } from '../components/driver-eligibility-panel.component';

/** 這次拍照/選檔對應到哪一張照片欄位；同一個 key 在切換承租人類型時共用，資料不會被清空。 */
export type DocumentSlotKey = 'identityFront' | 'licenseFront' | 'licenseBack' | 'licenseIdp' | 'licenseVisa';

const LICENSE_PATHS = ['taiwan', 'foreign'] as const;
type LicensePath = (typeof LICENSE_PATHS)[number];

/** 同一位會員底下最新的一筆（依 updatedAt）；DocumentStore 沒有「目前生效版本」的概念，先用時間排序近似。 */
function latestByUpdatedAt<T extends { updatedAt: string }>(records: T[]): T | undefined {
  return records.reduce<T | undefined>(
    (latest, record) => (!latest || record.updatedAt > latest.updatedAt ? record : latest),
    undefined,
  );
}

/**
 * 新增／編輯會員 + 證件與駕駛資格拍照上傳。設計文件第 4.3 節（依身分類型顯示動態欄位）
 * 與第 5 節（相機／OCR UX）。
 *
 * 刻意的範圍界線：
 * - 「本次已核對正本」是 HandoverRecord（取車紀錄）的欄位，屬於取車工作流程（Task 13），
 *   這個 dialog 只負責會員與可跨訂單重用的證件資料，不在這裡加那顆控制項。
 * - entryDate（入境日期）目前只是表單欄位、尚未有對應的 domain 欄位可以持久化
 *   （Member／IdentityDocument 在 Task 1-6 就已定案，不在本任務異動範圍），先讓使用者
 *   看得到欄位並留在畫面上，暫不寫回任何 store——待未來任務擴充 domain 再補。
 *
 * 編輯既有會員與重複儲存：
 * DocumentStore.uploadIdentityDocument／uploadDriverCredential（Task 7）每次呼叫都會
 * create() 一筆全新記錄，沒有「找到既有同類文件就建立新版本」的邏輯（那是 document.store.ts
 * 的範圍，不在本任務檔案清單內）。若每次儲存只要證件號碼欄位非空就呼叫它們，編輯既有會員時
 * （identityNumber 一開始就從 data.idNumber 帶入）幾乎每次存檔都會誤建一筆重複文件，即使
 * 這次只是改了電話號碼、完全沒碰證件。為了不越界去改 document.store.ts，這裡改用「本地留存
 * 已載入的既有文件快照＋比對是否真的有變動（欄位或新照片）」的方式在呼叫端擋掉 no-op 儲存：
 * 開啟 dialog 時會先呼叫 identityDocumentsFor／driverCredentialsFor 載入既有文件、回填表單
 * 與 capturedAssets（含用 DocumentAssetGateway.resolveUrl 還原照片預覽），儲存時只有欄位值
 * 或照片 asset 真的跟已載入的快照不同才會呼叫 upload；否則略過，避免誤建。
 */
@Component({
  selector: 'app-member-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DocumentCaptureComponent,
    DriverEligibilityPanelComponent,
  ],
  templateUrl: './member-form-dialog.component.html',
  styleUrls: ['../../../app.scss'],
})
export class MemberFormDialogComponent {
  protected readonly t = ZH_TW;
  readonly ref = inject(MatDialogRef<MemberFormDialogComponent>);
  readonly data = inject<Member | null>(MAT_DIALOG_DATA);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly memberStore = inject(MemberStore);
  private readonly documentStore = inject(DocumentStore);
  private readonly assetGateway = inject(DocumentAssetGateway);

  form = this.fb.group({
    name: [this.data?.name ?? '', Validators.required],
    phone: [this.data?.phone ?? '', Validators.required],
    email: [this.data?.email ?? ''],
    kind: [this.data?.kind ?? ('local' as MemberKind), Validators.required],
    note: [this.data?.note ?? ''],
    nationality: [this.data?.nationality ?? ''],
    entryDate: [''],
    identityNumber: [this.data?.idNumber ?? ''],
    identityExpiryDate: [''],
    licensePath: ['taiwan' as LicensePath],
    licenseNumber: [''],
    licenseIssuingCountry: [''],
    licenseExpiryDate: [''],
    originalVehicleClassText: [''],
    standardizedVehicleClass: ['car' as VehicleCategory],
  });

  private readonly kindValue = toSignal(this.form.controls.kind.valueChanges, {
    initialValue: this.form.controls.kind.value,
  });
  private readonly licensePathValue = toSignal(this.form.controls.licensePath.valueChanges, {
    initialValue: this.form.controls.licensePath.value,
  });
  protected readonly licenseIssuingCountryValue = toSignal(this.form.controls.licenseIssuingCountry.valueChanges, {
    initialValue: this.form.controls.licenseIssuingCountry.value,
  });

  protected readonly isForeignVisitor = computed(() => this.kindValue() === 'foreign_visitor');
  protected readonly isResident = computed(() => this.kindValue() === 'resident');
  protected readonly isForeignLicensePath = computed(
    () => this.isForeignVisitor() || (this.isResident() && this.licensePathValue() === 'foreign'),
  );

  protected readonly identityDocumentType = computed<IdentityDocumentType>(() => {
    if (this.isForeignVisitor()) return 'passport';
    if (this.isResident()) return 'resident_permit';
    return 'taiwan_id';
  });
  protected readonly driverCredentialType = computed<DriverCredentialType>(() =>
    this.isForeignLicensePath() ? 'foreign_license' : 'taiwan_license',
  );
  protected readonly identitySectionTitle = computed(() => this.t.member.identitySectionTitle[this.kindValue()]);
  protected readonly identityNumberLabel = computed(() => this.t.member.identityNumberLabel[this.kindValue()]);

  /** 各張照片欄位目前已存好的 asset；用同一個 key 跨身分類型切換保留，不因換分頁清空。 */
  readonly capturedAssets = signal<Partial<Record<DocumentSlotKey, StoredDocumentAsset>>>({});

  /**
   * 編輯既有會員時，dialog 一開就載入到的既有文件快照——儲存時拿來跟目前表單值比對，
   * 判斷「這次到底有沒有真的改動證件內容」（見類別註解）。新增會員時維持 undefined。
   */
  private readonly existingIdentityDocument = signal<IdentityDocument | undefined>(undefined);
  private readonly existingDriverCredential = signal<DriverCredential | undefined>(undefined);

  /**
   * save() 會先 await 這個，避免「dialog 剛開、既有文件還沒非同步載入完成就按下儲存」
   * 的極窄時間窗內，loadExistingDocuments 尚未寫入 existingIdentityDocument/
   * existingDriverCredential，導致 no-op 判斷誤判成「沒有既有文件」而建立重複記錄。
   */
  private readonly existingDocumentsLoaded: Promise<void>;

  constructor() {
    this.existingDocumentsLoaded = this.data ? this.loadExistingDocuments(this.data.id) : Promise.resolve();
  }

  private async loadExistingDocuments(memberId: string): Promise<void> {
    const identityDoc = latestByUpdatedAt(this.documentStore.identityDocumentsFor(memberId));
    if (identityDoc) {
      this.existingIdentityDocument.set(identityDoc);
      this.form.patchValue({
        identityNumber: identityDoc.documentNumber,
        identityExpiryDate: identityDoc.expiryDate ?? '',
        ...(this.isForeignVisitor() ? { nationality: identityDoc.issuingCountry } : {}),
      });
      if (identityDoc.frontImageAssetId) {
        await this.hydrateAssetSlot('identityFront', identityDoc.frontImageAssetId);
      }
    }

    const credential = latestByUpdatedAt(this.documentStore.driverCredentialsFor(memberId));
    if (credential) {
      this.existingDriverCredential.set(credential);
      this.form.patchValue({
        licenseNumber: credential.documentNumber,
        licenseIssuingCountry: credential.issuingCountry === 'TW' ? '' : credential.issuingCountry,
        licenseExpiryDate: credential.expiryDate ?? '',
        originalVehicleClassText: credential.originalVehicleClassText,
        standardizedVehicleClass: credential.standardizedVehicleClass,
      });
      if (credential.frontImageAssetId) await this.hydrateAssetSlot('licenseFront', credential.frontImageAssetId);
      if (credential.backImageAssetId) await this.hydrateAssetSlot('licenseBack', credential.backImageAssetId);
      if (credential.internationalPermitImageAssetId) {
        await this.hydrateAssetSlot('licenseIdp', credential.internationalPermitImageAssetId);
      }
      if (credential.visaPageImageAssetId) {
        await this.hydrateAssetSlot('licenseVisa', credential.visaPageImageAssetId);
      }
    }
  }

  private async hydrateAssetSlot(slot: DocumentSlotKey, assetId: string): Promise<void> {
    const url = await this.assetGateway.resolveUrl(assetId);
    if (!url) return;
    this.capturedAssets.update((current) => ({ ...current, [slot]: { assetId, url } }));
  }

  handleAssetCaptured(slot: DocumentSlotKey, asset: StoredDocumentAsset): void {
    this.capturedAssets.update((current) => ({ ...current, [slot]: asset }));
  }

  /** OCR 元件已經完成逐欄衝突確認才會呼叫這裡；只套用有回傳的欄位，其餘欄位維持原值。 */
  handleIdentityFieldsResolved(fields: DocumentCaptureFieldValues): void {
    this.form.patchValue({
      ...(fields.documentNumber !== undefined ? { identityNumber: fields.documentNumber } : {}),
      ...(fields.expiryDate !== undefined ? { identityExpiryDate: fields.expiryDate } : {}),
      ...(fields.issuingCountry !== undefined && this.isForeignVisitor()
        ? { nationality: fields.issuingCountry }
        : {}),
    });
  }

  handleLicenseFieldsResolved(fields: DocumentCaptureFieldValues): void {
    this.form.patchValue({
      ...(fields.documentNumber !== undefined ? { licenseNumber: fields.documentNumber } : {}),
      ...(fields.expiryDate !== undefined ? { licenseExpiryDate: fields.expiryDate } : {}),
      ...(fields.issuingCountry !== undefined ? { licenseIssuingCountry: fields.issuingCountry } : {}),
    });
  }

  protected identityCurrentValues(): DocumentCaptureFieldValues {
    const v = this.form.getRawValue();
    return {
      documentNumber: v.identityNumber || undefined,
      issuingCountry: this.isForeignVisitor() ? v.nationality || undefined : undefined,
      expiryDate: v.identityExpiryDate || undefined,
    };
  }

  protected licenseCurrentValues(): DocumentCaptureFieldValues {
    const v = this.form.getRawValue();
    return {
      documentNumber: v.licenseNumber || undefined,
      issuingCountry: v.licenseIssuingCountry || undefined,
      expiryDate: v.licenseExpiryDate || undefined,
    };
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;
    await this.existingDocumentsLoaded;
    const v = this.form.getRawValue();

    const memberPatch: Omit<Member, 'id'> = {
      name: v.name,
      phone: v.phone,
      kind: v.kind,
      ...(v.email ? { email: v.email } : {}),
      ...(v.note ? { note: v.note } : {}),
      ...(v.kind !== 'local' && v.nationality ? { nationality: v.nationality } : {}),
      ...(v.identityNumber ? { idNumber: v.identityNumber } : {}),
    };
    const memberId = this.data ? (this.memberStore.update(this.data.id, memberPatch).id) : this.memberStore.create(memberPatch).id;

    await this.persistIdentityDocument(memberId, v);
    await this.persistDriverCredential(memberId, v);

    this.ref.close(true);
  }

  private async persistIdentityDocument(memberId: string, v: ReturnType<typeof this.form.getRawValue>): Promise<void> {
    if (!v.identityNumber) return;
    const asset = this.capturedAssets().identityFront;
    const issuingCountry = this.isForeignVisitor() ? v.nationality || 'UNKNOWN' : 'TW';
    const existing = this.existingIdentityDocument();

    const hasNewAsset = asset !== undefined && asset.assetId !== existing?.frontImageAssetId;
    const fieldsChanged =
      !existing ||
      existing.type !== this.identityDocumentType() ||
      existing.documentNumber !== v.identityNumber ||
      existing.issuingCountry !== issuingCountry ||
      (existing.expiryDate ?? '') !== (v.identityExpiryDate || '');

    // no-op 編輯（例如只改了電話）：欄位跟照片都跟已載入的既有文件一致，不建立重複記錄。
    if (existing && !hasNewAsset && !fieldsChanged) return;

    const created = await this.documentStore.uploadIdentityDocument({
      memberId,
      type: this.identityDocumentType(),
      documentNumber: v.identityNumber,
      issuingCountry,
      ...(v.identityExpiryDate ? { expiryDate: v.identityExpiryDate } : {}),
      ...(asset ? { frontImageAssetId: asset.assetId } : {}),
    });

    // 上傳本身會觸發 DocumentStore 內建的 OCR 再次比對（見 document.store.ts），
    // 這裡立刻用畫面上「人員已核對過」的值 confirm，確保最終落地的資料一定是
    // 使用者在 document-capture 逐欄確認過的版本，不會被 OCR 靜默覆寫。
    const confirmed = this.documentStore.confirmIdentityDocument(created.id, this.t.layout.adminUser, {
      documentNumber: v.identityNumber,
      issuingCountry,
      ...(v.identityExpiryDate ? { expiryDate: v.identityExpiryDate } : {}),
    });
    // 同一次 dialog session 若使用者再按一次儲存，比對基準要換成剛建立的這筆，
    // 而不是舊快照——否則第二次儲存會誤判成「又變動了」而再建一筆。
    this.existingIdentityDocument.set(confirmed);
  }

  private async persistDriverCredential(memberId: string, v: ReturnType<typeof this.form.getRawValue>): Promise<void> {
    if (!v.licenseNumber || !v.originalVehicleClassText) return;
    const assets = this.capturedAssets();
    const foreign = this.isForeignLicensePath();
    const issuingCountry = foreign ? v.licenseIssuingCountry || v.nationality || 'UNKNOWN' : 'TW';
    const existing = this.existingDriverCredential();

    const hasNewAsset =
      (assets.licenseFront !== undefined && assets.licenseFront.assetId !== existing?.frontImageAssetId) ||
      (assets.licenseBack !== undefined && assets.licenseBack.assetId !== existing?.backImageAssetId) ||
      (assets.licenseIdp !== undefined &&
        assets.licenseIdp.assetId !== existing?.internationalPermitImageAssetId) ||
      (assets.licenseVisa !== undefined && assets.licenseVisa.assetId !== existing?.visaPageImageAssetId);
    const fieldsChanged =
      !existing ||
      existing.type !== this.driverCredentialType() ||
      existing.documentNumber !== v.licenseNumber ||
      existing.issuingCountry !== issuingCountry ||
      existing.originalVehicleClassText !== v.originalVehicleClassText ||
      existing.standardizedVehicleClass !== v.standardizedVehicleClass ||
      (existing.expiryDate ?? '') !== (v.licenseExpiryDate || '');

    // no-op 編輯：不建立重複記錄，理由同 persistIdentityDocument。
    if (existing && !hasNewAsset && !fieldsChanged) return;

    const created = await this.documentStore.uploadDriverCredential({
      memberId,
      type: this.driverCredentialType(),
      documentNumber: v.licenseNumber,
      issuingCountry,
      originalVehicleClassText: v.originalVehicleClassText,
      standardizedVehicleClass: v.standardizedVehicleClass,
      ...(v.licenseExpiryDate ? { expiryDate: v.licenseExpiryDate } : {}),
      ...(assets.licenseFront ? { frontImageAssetId: assets.licenseFront.assetId } : {}),
      ...(assets.licenseBack ? { backImageAssetId: assets.licenseBack.assetId } : {}),
      ...(assets.licenseIdp ? { internationalPermitImageAssetId: assets.licenseIdp.assetId } : {}),
      ...(assets.licenseVisa ? { visaPageImageAssetId: assets.licenseVisa.assetId } : {}),
    });

    const confirmed = this.documentStore.confirmDriverCredential(created.id, this.t.layout.adminUser, {
      documentNumber: v.licenseNumber,
      issuingCountry,
      standardizedVehicleClass: v.standardizedVehicleClass,
      ...(v.licenseExpiryDate ? { expiryDate: v.licenseExpiryDate } : {}),
    });
    this.existingDriverCredential.set(confirmed);

    if (this.isForeignVisitor()) {
      const eligibilityChecked = await this.documentStore.checkDriverEligibility(created.id);
      this.existingDriverCredential.set(eligibilityChecked);
    }
  }
}
