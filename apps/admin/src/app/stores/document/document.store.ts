import { Injectable, Signal, inject, signal } from '@angular/core';
import { DocumentVerificationState, DriverCredential, IdentityDocument } from '@car-rental/domain';
import { DRIVER_CREDENTIAL_REPO, IDENTITY_DOCUMENT_REPO } from '../../core/repositories/tokens';
import { DriverEligibilityGateway } from '../../core/services/driver-eligibility.gateway';
import { OcrExtractionResult, OcrGateway } from '../../core/services/ocr.gateway';

type UploadIdentityDocumentInput = Pick<
  IdentityDocument,
  'memberId' | 'type' | 'documentNumber' | 'issuingCountry' | 'expiryDate' | 'frontImageAssetId' | 'backImageAssetId'
>;

type UploadDriverCredentialInput = Pick<
  DriverCredential,
  | 'memberId'
  | 'type'
  | 'documentNumber'
  | 'issuingCountry'
  | 'expiryDate'
  | 'originalVehicleClassText'
  | 'standardizedVehicleClass'
  | 'frontImageAssetId'
  | 'backImageAssetId'
  | 'internationalPermitImageAssetId'
  | 'visaPageImageAssetId'
>;

/** 同一組紀錄裡版本號最大的一筆（新上傳的紀錄接在它後面）。 */
function latestVersionOf<T extends { version: number }>(items: T[]): T | undefined {
  return items.reduce<T | undefined>((latest, item) => (!latest || item.version > latest.version ? item : latest), undefined);
}

/**
 * 身分證明文件與駕駛資格的薄封裝：CRUD 寫入兩個 repository，
 * 上傳後若帶有圖檔參照會呼叫 OcrGateway 取得初步辨識結果（狀態推進到 ocr_extracted），
 * 實際核對／訂正仍要靠人員呼叫 confirm 方法才會推進到 verified —— OCR 本身不算完成驗證。
 *
 * 版本：模型約定「每次更新以新版本追加（version 遞增、supersededId 指回前一版）」，取車判斷與
 * 待補都取版本號最大的一筆。所以同一位會員再上傳時接在前一版後面——身分證明文件依種類各自一條版本線
 * （換了承租人類型、改交居留證，不算取代身分證）；駕駛資格整位會員一條（取車時看的是最新的那一張）。
 */
@Injectable({ providedIn: 'root' })
export class DocumentStore {
  private readonly identityRepo = inject(IDENTITY_DOCUMENT_REPO);
  private readonly credentialRepo = inject(DRIVER_CREDENTIAL_REPO);
  private readonly ocrGateway = inject(OcrGateway);
  private readonly eligibilityGateway = inject(DriverEligibilityGateway);

  private readonly _identityDocuments = signal<IdentityDocument[]>(this.identityRepo.getAll());
  readonly identityDocuments: Signal<IdentityDocument[]> = this._identityDocuments.asReadonly();

  private readonly _driverCredentials = signal<DriverCredential[]>(this.credentialRepo.getAll());
  readonly driverCredentials: Signal<DriverCredential[]> = this._driverCredentials.asReadonly();

  identityDocumentsFor(memberId: string): IdentityDocument[] {
    return this._identityDocuments().filter((d) => d.memberId === memberId);
  }

  driverCredentialsFor(memberId: string): DriverCredential[] {
    return this._driverCredentials().filter((d) => d.memberId === memberId);
  }

  async uploadIdentityDocument(input: UploadIdentityDocumentInput): Promise<IdentityDocument> {
    const now = new Date().toISOString();
    const previous = latestVersionOf(
      this.identityRepo.getAll().filter((d) => d.memberId === input.memberId && d.type === input.type),
    );
    const document: IdentityDocument = {
      id: crypto.randomUUID(),
      ...input,
      verification: { state: 'unverified' },
      version: previous ? previous.version + 1 : 1,
      ...(previous ? { supersededId: previous.id } : {}),
      createdAt: now,
      updatedAt: now,
    };
    this.identityRepo.create(document);
    this.reloadIdentityDocuments();

    if (input.frontImageAssetId) {
      const ocr = await this.ocrGateway.extract(input.frontImageAssetId, 'identity_document');
      // 回傳 OCR 寫回後的最新狀態，不是上面剛建立、還沒套用 OCR 結果的舊物件——
      // 呼叫端拿到的值必須跟 repository 裡實際存的一致。
      return this.applyIdentityOcrResult(document.id, ocr);
    }
    return document;
  }

  /** 人員核對（必要時訂正 OCR 誤判欄位）後確認證件為有效，推進為 verified。 */
  confirmIdentityDocument(
    id: string,
    verifiedBy: string,
    corrections?: Partial<Pick<IdentityDocument, 'documentNumber' | 'issuingCountry' | 'expiryDate'>>,
  ): IdentityDocument {
    const now = new Date().toISOString();
    const updated = this.identityRepo.update(id, {
      ...corrections,
      verification: { state: 'verified', verifiedAt: now, verifiedBy },
      updatedAt: now,
    });
    this.reloadIdentityDocuments();
    return updated;
  }

  rejectIdentityDocument(id: string, verifiedBy: string): IdentityDocument {
    const now = new Date().toISOString();
    const updated = this.identityRepo.update(id, {
      verification: { state: 'rejected', verifiedAt: now, verifiedBy },
      updatedAt: now,
    });
    this.reloadIdentityDocuments();
    return updated;
  }

  async uploadDriverCredential(input: UploadDriverCredentialInput): Promise<DriverCredential> {
    const now = new Date().toISOString();
    const previous = latestVersionOf(this.credentialRepo.getAll().filter((d) => d.memberId === input.memberId));
    const credential: DriverCredential = {
      id: crypto.randomUUID(),
      ...input,
      verification: { state: 'unverified' },
      // 是否適用互惠資格查核由呼叫端另外用 checkDriverEligibility 觸發；
      // 本國籍與居留證者本來就不會呼叫那個方法，這裡先給一個中性初始值。
      reciprocityStatus: 'pending',
      version: previous ? previous.version + 1 : 1,
      ...(previous ? { supersededId: previous.id } : {}),
      createdAt: now,
      updatedAt: now,
    };
    this.credentialRepo.create(credential);
    this.reloadDriverCredentials();

    if (input.frontImageAssetId) {
      const ocr = await this.ocrGateway.extract(input.frontImageAssetId, 'driver_credential');
      // 回傳 OCR 寫回後的最新狀態，理由同 uploadIdentityDocument。
      return this.applyCredentialOcrResult(credential.id, ocr);
    }
    return credential;
  }

  confirmDriverCredential(
    id: string,
    verifiedBy: string,
    corrections?: Partial<
      Pick<DriverCredential, 'documentNumber' | 'issuingCountry' | 'expiryDate' | 'standardizedVehicleClass'>
    >,
  ): DriverCredential {
    const now = new Date().toISOString();
    const updated = this.credentialRepo.update(id, {
      ...corrections,
      verification: { state: 'verified', verifiedAt: now, verifiedBy },
      updatedAt: now,
    });
    this.reloadDriverCredentials();
    return updated;
  }

  rejectDriverCredential(id: string, verifiedBy: string): DriverCredential {
    const now = new Date().toISOString();
    const updated = this.credentialRepo.update(id, {
      verification: { state: 'rejected', verifiedAt: now, verifiedBy },
      updatedAt: now,
    });
    this.reloadDriverCredentials();
    return updated;
  }

  /** 外國旅客駕照互惠資格查核；查核結果直接寫回 reciprocityStatus（與必要時的合法使用截止日）。 */
  async checkDriverEligibility(id: string): Promise<DriverCredential> {
    const credential = this.credentialRepo.getById(id);
    if (!credential) throw new Error(`not found: ${id}`);
    const result = await this.eligibilityGateway.checkReciprocity({
      issuingCountry: credential.issuingCountry,
      credentialType: credential.type,
    });
    const updated = this.credentialRepo.update(id, {
      reciprocityStatus: result.reciprocityStatus,
      legalUseThroughDate: result.legalUseThroughDate,
      updatedAt: new Date().toISOString(),
    });
    this.reloadDriverCredentials();
    return updated;
  }

  /**
   * 只供「建立訂單失敗、補償清除這次新建的紀錄」使用（admin-order-submit.gateway 的 compensate）。
   * 已經存在、核對過的證件不應刪除——要更新就上傳新版本。
   */
  removeIdentityDocument(id: string): void {
    this.identityRepo.remove(id);
    this.reloadIdentityDocuments();
  }

  /** 同 removeIdentityDocument：只供建立訂單失敗時補償清除。 */
  removeDriverCredential(id: string): void {
    this.credentialRepo.remove(id);
    this.reloadDriverCredentials();
  }

  private applyIdentityOcrResult(id: string, ocr: OcrExtractionResult): IdentityDocument {
    const state: DocumentVerificationState = ocr.status === 'failed' ? 'unverified' : 'ocr_extracted';
    const updated = this.identityRepo.update(id, {
      verification: { state, ocrConfidence: ocr.confidence },
      ...(ocr.documentNumber ? { documentNumber: ocr.documentNumber } : {}),
      ...(ocr.issuingCountry ? { issuingCountry: ocr.issuingCountry } : {}),
      ...(ocr.expiryDate ? { expiryDate: ocr.expiryDate } : {}),
      updatedAt: new Date().toISOString(),
    });
    this.reloadIdentityDocuments();
    return updated;
  }

  private applyCredentialOcrResult(id: string, ocr: OcrExtractionResult): DriverCredential {
    const state: DocumentVerificationState = ocr.status === 'failed' ? 'unverified' : 'ocr_extracted';
    const updated = this.credentialRepo.update(id, {
      verification: { state, ocrConfidence: ocr.confidence },
      ...(ocr.documentNumber ? { documentNumber: ocr.documentNumber } : {}),
      ...(ocr.issuingCountry ? { issuingCountry: ocr.issuingCountry } : {}),
      ...(ocr.expiryDate ? { expiryDate: ocr.expiryDate } : {}),
      updatedAt: new Date().toISOString(),
    });
    this.reloadDriverCredentials();
    return updated;
  }

  private reloadIdentityDocuments(): void {
    this._identityDocuments.set(this.identityRepo.getAll());
  }

  private reloadDriverCredentials(): void {
    this._driverCredentials.set(this.credentialRepo.getAll());
  }
}
