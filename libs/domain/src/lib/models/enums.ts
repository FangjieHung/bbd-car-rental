export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'reserved';
export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';
export type PaymentMethod = 'credit_card' | 'line_pay' | 'on_site' | 'bank_transfer';
