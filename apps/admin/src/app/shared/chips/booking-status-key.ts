import { StatusKey } from '@car-rental/theme-pack';
import { BookingStatus } from '../../core/models';

/** 訂單狀態對應的狀態 chip 色調；訂單列表與訂單詳情共用。 */
export const BOOKING_STATUS_KEY: Record<BookingStatus, StatusKey> = {
  reserved: 'warning',
  in_progress: 'processing',
  completed: 'completed',
  cancelled: 'archived',
};
