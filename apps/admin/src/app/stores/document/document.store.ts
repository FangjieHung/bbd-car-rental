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

/**
 * 身分證明文件與駕駛資格的薄封裝：CRUD 寫入兩個 repository，
 * 上傳後若帶有圖檔參照會呼叫 OcrGateway 取得初步辨識結果（狀態推進到 ocr_extracted），
 * 實際核對／訂正仍要靠人員呼叫 confirm 方法才會推進到 verified —— OCR 本身不算完成驗證。
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
    const document: IdentityDocument = {
      id: crypto.randomUUID(),
      ...input,
      verification: { state: 'unverified' },
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.identityRepo.create(document);
    this.reloadIdentityDocuments();

    if (input.frontImageAssetId) {
      const ocr = await this.ocrGateway.extract(input.frontImageAssetId, 'identity_document');
      this.applyIdentityOcrResult(document.id, ocr);
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
    const credential: DriverCredential = {
      id: crypto.randomUUID(),
      ...input,
      verification: { state: 'unverified' },
      // 是否適用互惠資格查核由呼叫端另外用 checkDriverEligibility 觸發；
      // 本國籍與居留證者本來就不會呼叫那個方法，這裡先給一個中性初始值。
      reciprocityStatus: 'pending',
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.credentialRepo.create(credential);
    this.reloadDriverCredentials();

    if (input.frontImageAssetId) {
      const ocr = await this.ocrGateway.extract(input.frontImageAssetId, 'driver_credential');
      this.applyCredentialOcrResult(credential.id, ocr);
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

  private applyIdentityOcrResult(id: string, ocr: OcrExtractionResult): void {
    const state: DocumentVerificationState = ocr.status === 'failed' ? 'unverified' : 'ocr_extracted';
    this.identityRepo.update(id, {
      verification: { state, ocrConfidence: ocr.confidence },
      ...(ocr.documentNumber ? { documentNumber: ocr.documentNumber } : {}),
      ...(ocr.issuingCountry ? { issuingCountry: ocr.issuingCountry } : {}),
      ...(ocr.expiryDate ? { expiryDate: ocr.expiryDate } : {}),
      updatedAt: new Date().toISOString(),
    });
    this.reloadIdentityDocuments();
  }

  private applyCredentialOcrResult(id: string, ocr: OcrExtractionResult): void {
    const state: DocumentVerificationState = ocr.status === 'failed' ? 'unverified' : 'ocr_extracted';
    this.credentialRepo.update(id, {
      verification: { state, ocrConfidence: ocr.confidence },
      ...(ocr.documentNumber ? { documentNumber: ocr.documentNumber } : {}),
      ...(ocr.issuingCountry ? { issuingCountry: ocr.issuingCountry } : {}),
      ...(ocr.expiryDate ? { expiryDate: ocr.expiryDate } : {}),
      updatedAt: new Date().toISOString(),
    });
    this.reloadDriverCredentials();
  }

  private reloadIdentityDocuments(): void {
    this._identityDocuments.set(this.identityRepo.getAll());
  }

  private reloadDriverCredentials(): void {
    this._driverCredentials.set(this.credentialRepo.getAll());
  }
}
