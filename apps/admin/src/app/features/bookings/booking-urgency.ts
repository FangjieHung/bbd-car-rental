import { RentalBooking } from '../../core/models';
import { PaymentStore } from '../../stores/payment/payment.store';
import { OperatorRecoveryStore } from '../../stores/operator-recovery/operator-recovery.store';

/**
 * 急迫狀態的共用判斷（逾時未還、退款待處理、業者復原處理中）。訂單列表與訂單詳情標題旁
 * 顯示的是同一套狀態，因此判斷邏輯只在這裡寫一次——兩邊都只是「顯示」與「點了去哪裡」不同。
 */

export function isOverdueReturn(booking: RentalBooking): boolean {
  return booking.status === 'in_progress' && new Date(booking.endTime).getTime() < Date.now();
}

export function hasRefundPending(booking: RentalBooking, paymentStore: PaymentStore): boolean {
  return paymentStore.refundsFor(booking.id).some((r) => r.status === 'pending');
}

export function hasUrgentOperatorRecovery(booking: RentalBooking, operatorRecoveryStore: OperatorRecoveryStore): boolean {
  return operatorRecoveryStore.casesFor(booking.id).some((c) => c.status === 'in_progress');
}

export function isUrgent(
  booking: RentalBooking,
  paymentStore: PaymentStore,
  operatorRecoveryStore: OperatorRecoveryStore,
): boolean {
  return (
    isOverdueReturn(booking) ||
    hasRefundPending(booking, paymentStore) ||
    hasUrgentOperatorRecovery(booking, operatorRecoveryStore)
  );
}
