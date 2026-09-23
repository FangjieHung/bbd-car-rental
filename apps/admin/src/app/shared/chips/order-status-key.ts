import { StatusKey } from '@car-rental/theme-pack';
import { OrderStatus } from '../../core/models';

/** 訂單狀態對應的狀態 chip 色調；訂單列表與訂單詳情共用。 */
export const ORDER_STATUS_KEY: Record<OrderStatus, StatusKey> = {
  reserved: 'warning',
  in_progress: 'processing',
  completed: 'completed',
  cancelled: 'archived',
};
