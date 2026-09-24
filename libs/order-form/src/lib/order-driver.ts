import { AbstractControl, ValidationErrors } from '@angular/forms';
import { DriverCredential, DriverCredentialType, MemberKind, VehicleCategory } from '@car-rental/domain';
import type { OrderForm, OrderFormValue } from './order-form';

/**
 * 建立訂單第 2 步「駕駛資格」（4.2）的表單規則：欄位與規則沿用會員視窗（member-form-dialog）。
 *
 * 資料存放沿用既有模型：駕駛資格存在「會員層」的 DriverCredential（`memberId` 指向駕駛人），
 * 可跨訂單重用；訂單本身不另存一份。CONTEXT.md 把「承租人」與「駕駛人」分成兩個詞，這次先不做
 * 「駕駛人≠承租人」——表單的 `driver` 群組目前一律是承租人本人的駕駛資格，但刻意跟 `renter`
 * 分開成兩個群組：日後要支援另一位駕駛人時，在 `driver` 加上駕駛人的會員 id 即可，不必拆 `renter`。
 */

/** 持居留證者可選的駕照路徑（同會員視窗）：台灣駕照，或外國駕照＋國際駕照。 */
export const LICENSE_PATHS = ['taiwan', 'foreign'] as const;
export type LicensePath = (typeof LICENSE_PATHS)[number];

/** 外國旅客一律走外國駕照；持居留證者看所選路徑；本國人一律台灣駕照（同會員視窗）。 */
export function isForeignLicensePath(kind: MemberKind, licensePath: LicensePath): boolean {
  return kind === 'foreign_visitor' || (kind === 'resident' && licensePath === 'foreign');
}

/** 表單上填的駕駛資格，整理成要寫入 DriverCredential 的內容。 */
export interface DriverCredentialDraft {
  type: DriverCredentialType;
  documentNumber: string;
  issuingCountry: string;
  /** 純日期（YYYY-MM-DD）；沒填時省略。 */
  expiryDate?: string;
  originalVehicleClassText: string;
  /** 還沒選時為 null——送出前的檢查會擋下（見 order-form-derived 的 driverClassRequired）。 */
  standardizedVehicleClass: VehicleCategory | null;
}

/** 日期欄位只比日期：ISO 日期時間（種子資料）與 `<input type="date">` 的 YYYY-MM-DD 都轉成本地的 YYYY-MM-DD。 */
export function toDateOnly(value: string | undefined | null): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * 表單目前填的駕駛資格；沒填駕照號碼時為 undefined（整個區塊留空＝之後再補，會列入待補）。
 * 發照國家的推導與會員視窗相同：外國駕照用填寫的發照國家，沒填就用國籍，都沒有記為 UNKNOWN。
 */
export function driverCredentialDraftOf(value: OrderFormValue): DriverCredentialDraft | undefined {
  const { driver, renter } = value;
  const documentNumber = driver.licenseNumber.trim();
  if (!documentNumber) return undefined;
  const foreign = isForeignLicensePath(renter.kind, driver.licensePath);
  const expiryDate = toDateOnly(driver.licenseExpiryDate);
  return {
    type: foreign ? 'foreign_license' : 'taiwan_license',
    documentNumber,
    issuingCountry: foreign ? driver.licenseIssuingCountry.trim() || renter.nationality.trim() || 'UNKNOWN' : 'TW',
    ...(expiryDate ? { expiryDate } : {}),
    originalVehicleClassText: driver.originalVehicleClassText.trim(),
    standardizedVehicleClass: driver.standardizedVehicleClass,
  };
}

/**
 * 表單內容與既有的駕駛資格是否相同（只比人員看得到、改得到的欄位）。相同就沿用既有紀錄、不重複建立，
 * 查核狀態也沿用既有紀錄的——選了既有會員、沒改駕照時，不能因為「送出了訂單」就把它當成剛核對過。
 */
export function sameDriverCredential(existing: DriverCredential, draft: DriverCredentialDraft): boolean {
  return (
    existing.documentNumber === draft.documentNumber &&
    existing.issuingCountry === draft.issuingCountry &&
    toDateOnly(existing.expiryDate) === (draft.expiryDate ?? '') &&
    existing.originalVehicleClassText === draft.originalVehicleClassText &&
    existing.standardizedVehicleClass === draft.standardizedVehicleClass
  );
}

/**
 * 選了既有會員：帶入他最新一版的駕駛資格（欄位仍可修改）；沒有紀錄、或換回新承租人時清空。
 * 互惠資格查核結果不帶入表單——沿用既有紀錄時直接讀那筆紀錄的狀態（見 sameDriverCredential）。
 */
export function prefillDriver(form: OrderForm, credential: DriverCredential | undefined, kind: MemberKind): void {
  const driver = form.controls.driver;
  if (!credential) {
    driver.reset();
    return;
  }
  const foreignIssued = credential.issuingCountry !== 'TW';
  driver.reset({
    licensePath: kind === 'resident' && foreignIssued ? 'foreign' : 'taiwan',
    licenseNumber: credential.documentNumber,
    licenseIssuingCountry: foreignIssued ? credential.issuingCountry : '',
    licenseExpiryDate: toDateOnly(credential.expiryDate),
    originalVehicleClassText: credential.originalVehicleClassText,
    standardizedVehicleClass: credential.standardizedVehicleClass,
    reciprocityStatus: null,
  });
}

/**
 * 填了駕照號碼時標準化車種必填：駕駛資格紀錄一定要有車種，取車時才比對得出准駕車種是否相符。
 * 讀同一個群組的駕照號碼（跨欄位），所以駕照號碼改變時要重新驗證這一欄（見 connectOrderFormBehaviors）。
 */
export function driverClassRequiredValidator(control: AbstractControl): ValidationErrors | null {
  const licenseNumber = control.parent?.get('licenseNumber')?.value;
  return typeof licenseNumber === 'string' && licenseNumber.trim() && !control.value ? { required: true } : null;
}
