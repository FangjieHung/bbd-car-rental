import type { BookingFlowErrorCode } from './i18n/booking-flow-messages';

/**
 * CatalogStore 丟給畫面的業務錯誤。畫面依 `code` 查目前語言的文案（BookingFlowI18n.errorMessage），
 * `message` 只保留繁中預設文字給 log 與既有斷言用，不直接顯示給客人。
 */
export class BookingFlowError extends Error {
  constructor(
    readonly code: BookingFlowErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'BookingFlowError';
  }
}
