import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  DriverCredentialType,
  IdentityDocumentType,
  Member,
  MemberKind,
  VehicleCategory,
} from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { MemberStore } from '../../../stores/member/member.store';
import { DocumentStore } from '../../../stores/document/document.store';
import { StoredDocumentAsset } from '../../../core/services/document-asset.gateway';
import { DocumentCaptureComponent, DocumentCaptureFieldValues } from '../components/document-capture.component';
import { DriverEligibilityPanelComponent } from '../components/driver-eligibility-panel.component';

/** 這次拍照/選檔對應到哪一張照片欄位；同一個 key 在切換承租人類型時共用，資料不會被清空。 */
export type DocumentSlotKey = 'identityFront' | 'licenseFront' | 'licenseBack' | 'licenseIdp' | 'licenseVisa';

const LICENSE_PATHS = ['taiwan', 'foreign'] as const;
type LicensePath = (typeof LICENSE_PATHS)[number];

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
 * - 每次儲存只要對應的證件號碼欄位非空就會呼叫 DocumentStore 建立一筆新的
 *   IdentityDocument／DriverCredential；DocumentStore 目前沒有「找到既有同類文件才建立新版本」
 *   的邏輯（那是 document.store.ts 的範圍，不在本任務檔案清單內），重複儲存同一位會員會
 *   建立多筆記錄，這是已知限制，留在報告的 concerns 說明。
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
    this.documentStore.confirmIdentityDocument(created.id, this.t.layout.adminUser, {
      documentNumber: v.identityNumber,
      issuingCountry,
      ...(v.identityExpiryDate ? { expiryDate: v.identityExpiryDate } : {}),
    });
  }

  private async persistDriverCredential(memberId: string, v: ReturnType<typeof this.form.getRawValue>): Promise<void> {
    if (!v.licenseNumber || !v.originalVehicleClassText) return;
    const assets = this.capturedAssets();
    const foreign = this.isForeignLicensePath();
    const issuingCountry = foreign ? v.licenseIssuingCountry || v.nationality || 'UNKNOWN' : 'TW';

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

    this.documentStore.confirmDriverCredential(created.id, this.t.layout.adminUser, {
      documentNumber: v.licenseNumber,
      issuingCountry,
      standardizedVehicleClass: v.standardizedVehicleClass,
      ...(v.licenseExpiryDate ? { expiryDate: v.licenseExpiryDate } : {}),
    });

    if (this.isForeignVisitor()) {
      await this.documentStore.checkDriverEligibility(created.id);
    }
  }
}
