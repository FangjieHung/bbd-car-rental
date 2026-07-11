import { Vehicle, Customer, RentalBooking, MaintenanceRecord } from '../models';
import { isoAt } from '../date-utils';

export function seedVehicles(): Vehicle[] {
  return [
    { id: 'v1', plateNumber: 'ABC-123', type: 'scooter', model: 'Gogoro 3', status: 'available', mileage: 4800, createdAt: isoAt(-90, 9) },
    { id: 'v2', plateNumber: 'DEF-456', type: 'scooter', model: '勁戰六代', status: 'rented', mileage: 12100, createdAt: isoAt(-80, 9) },
    { id: 'v3', plateNumber: 'GHI-789', type: 'car', model: 'Yaris', status: 'available', mileage: 30500, createdAt: isoAt(-70, 9) },
    { id: 'v4', plateNumber: 'JKL-012', type: 'car', model: 'Sienta', status: 'maintenance', mileage: 45200, createdAt: isoAt(-60, 9) },
    { id: 'v5', plateNumber: 'MNO-345', type: 'scooter', model: 'SYM 4MICA', status: 'reserved', mileage: 800, createdAt: isoAt(-30, 9) },
    { id: 'v6', plateNumber: 'PQR-678', type: 'car', model: 'Corolla Cross', status: 'available', mileage: 15900, createdAt: isoAt(-20, 9) },
  ];
}

export function seedCustomers(): Customer[] {
  return [
    { id: 'c1', name: '王小明', phone: '0912-345-678' },
    { id: 'c2', name: '林美惠', phone: '0922-111-222', idNumber: 'A123456789' },
    { id: 'c3', name: '陳大同', phone: '0933-333-444', note: '常客' },
    { id: 'c4', name: '佐藤健', phone: '+81-90-1234-5678', note: '日本旅客' },
  ];
}

export function seedBookings(): RentalBooking[] {
  return [
    { id: 'b1', vehicleId: 'v2', customerId: 'c1', startTime: isoAt(-1, 9), endTime: isoAt(1, 18), pickupLocation: '馬公門市', returnLocation: '馬公門市', status: 'in_progress' },
    { id: 'b2', vehicleId: 'v5', customerId: 'c2', startTime: isoAt(0, 10), endTime: isoAt(2, 17), pickupLocation: '機場', returnLocation: '馬公門市', status: 'confirmed' },
    { id: 'b3', vehicleId: 'v1', customerId: 'c3', startTime: isoAt(2, 9), endTime: isoAt(4, 18), pickupLocation: '馬公門市', returnLocation: '馬公門市', status: 'confirmed' },
    { id: 'b4', vehicleId: 'v3', customerId: 'c4', startTime: isoAt(3, 9), endTime: isoAt(6, 12), pickupLocation: '機場', returnLocation: '機場', status: 'confirmed' },
    { id: 'b5', vehicleId: 'v1', customerId: 'c2', startTime: isoAt(-5, 9), endTime: isoAt(-3, 18), pickupLocation: '馬公門市', returnLocation: '馬公門市', status: 'completed' },
    { id: 'b6', vehicleId: 'v6', customerId: 'c1', startTime: isoAt(0, 14), endTime: isoAt(0, 18), pickupLocation: '馬公門市', returnLocation: '馬公門市', status: 'confirmed' },
    { id: 'b7', vehicleId: 'v3', customerId: 'c3', startTime: isoAt(-10, 9), endTime: isoAt(-8, 18), pickupLocation: '馬公門市', returnLocation: '馬公門市', status: 'cancelled' },
    { id: 'b8', vehicleId: 'v6', customerId: 'c4', startTime: isoAt(7, 9), endTime: isoAt(9, 18), pickupLocation: '機場', returnLocation: '機場', status: 'confirmed' },
  ];
}

export function seedMaintenanceRecords(): MaintenanceRecord[] {
  return [
    // v2 里程 12100，門檻 12000 → overdue（里程）
    { id: 'm1', vehicleId: 'v2', type: 'oil_change', performedAt: isoAt(-40, 9), mileageAtService: 9000, nextDueMileage: 12000, cost: 350, notes: '' },
    // v3 里程 30500，門檻 30700 → upcoming（30700-300=30400 ≤ 30500）
    { id: 'm2', vehicleId: 'v3', type: 'oil_change', performedAt: isoAt(-30, 9), mileageAtService: 27700, nextDueMileage: 30700, cost: 1200, notes: '' },
    // v6 日期規則：5 天後到期 → upcoming（7 天內）
    { id: 'm3', vehicleId: 'v6', type: 'inspection', performedAt: isoAt(-175, 9), mileageAtService: 14000, nextDueDate: isoAt(5, 9), cost: 2500, notes: '半年定檢' },
    { id: 'm4', vehicleId: 'v4', type: 'brake', performedAt: isoAt(-2, 9), mileageAtService: 45200, nextDueMileage: 55000, cost: 1800, notes: '前煞車皮更換，維修中' },
  ];
}
