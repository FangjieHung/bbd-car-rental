import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { BookingFormDialogComponent } from './booking-form-dialog.component';
import {
  VEHICLE_REPO,
  MEMBER_REPO,
  BOOKING_REPO,
  MAINTENANCE_REPO,
} from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { Vehicle, Member, RentalBooking, MaintenanceRecord } from '../../../core/models';

function makeVehicle(partial: Partial<Vehicle> = {}): Vehicle {
  return {
    id: 'v1',
    plateNumber: 'ABC-123',
    category: 'scooter',
    model: 'Gogoro',
    brand: 'Gogoro',
    year: 2022,
    status: 'available',
    mileage: 100,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

function selectedEvent(value: string): MatAutocompleteSelectedEvent {
  return { option: { value } } as unknown as MatAutocompleteSelectedEvent;
}

describe('BookingFormDialogComponent 會員挑選', () => {
  let closeSpy: ReturnType<typeof vi.fn>;

  function createFixture(members: Member[] = [], data: unknown = null) {
    closeSpy = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: VEHICLE_REPO, useValue: createInMemoryRepo<Vehicle>([makeVehicle()]) },
        { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>(members) },
        { provide: BOOKING_REPO, useValue: createInMemoryRepo<RentalBooking>([]) },
        { provide: MAINTENANCE_REPO, useValue: createInMemoryRepo<MaintenanceRecord>([]) },
      ],
    });
    return TestBed.createComponent(BookingFormDialogComponent).componentInstance;
  }

  function fillCommonFields(component: BookingFormDialogComponent): void {
    component.form.patchValue({
      vehicleId: 'v1',
      startLocal: '2026-01-01T09:00',
      endLocal: '2026-01-02T09:00',
      pickupLocation: '機場',
      returnLocation: '機場',
    });
  }

  it('選到既有會員後鎖定姓名/電話/證件號三欄，送出直接沿用該會員 id', () => {
    const component = createFixture([
      { id: 'm1', name: '王小明', phone: '0912345678', idNumber: 'A123456789', kind: 'local' },
    ]);

    component.onMemberSelected(selectedEvent('m1'));

    expect(component.lockedMemberId()).toBe('m1');
    expect(component.form.controls.name.disabled).toBe(true);
    expect(component.form.controls.phone.disabled).toBe(true);
    expect(component.form.controls.idNumber.disabled).toBe(true);
    expect(component.form.getRawValue().name).toBe('王小明');
    expect(component.form.getRawValue().phone).toBe('0912345678');
    expect(component.form.getRawValue().idNumber).toBe('A123456789');

    fillCommonFields(component);
    component.save();

    expect(component.memberStore.members()).toHaveLength(1); // 沒有新建會員
    expect(closeSpy).toHaveBeenCalledWith(expect.objectContaining({ memberId: 'm1' }));
  });

  it('純打字輸入新資料時三欄維持可編輯，送出前會先呼叫 MemberStore.create 建立新會員', () => {
    const component = createFixture([]);

    component.form.patchValue({ name: '新客人', phone: '0900000000' });

    expect(component.lockedMemberId()).toBeNull();
    expect(component.form.controls.name.disabled).toBe(false);

    fillCommonFields(component);
    component.save();

    const members = component.memberStore.members();
    expect(members).toHaveLength(1);
    expect(members[0]).toMatchObject({ name: '新客人', phone: '0900000000' });
    expect(closeSpy).toHaveBeenCalledWith(expect.objectContaining({ memberId: members[0].id }));
  });

  it('鎖定後點「換一位」會清空三欄並解除鎖定，回到新會員狀態', () => {
    const component = createFixture([{ id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' }]);

    component.onMemberSelected(selectedEvent('m1'));
    component.changeMember();

    expect(component.lockedMemberId()).toBeNull();
    expect(component.form.controls.name.disabled).toBe(false);
    expect(component.form.controls.phone.disabled).toBe(false);
    expect(component.form.controls.idNumber.disabled).toBe(false);
    expect(component.form.getRawValue().name).toBe('');
    expect(component.form.getRawValue().phone).toBe('');
  });

  it('編輯既有訂單時預設鎖定原本的會員', () => {
    const component = createFixture(
      [{ id: 'm1', name: '王小明', phone: '0912345678', kind: 'local' }],
      { id: 'b1', vehicleId: 'v1', memberId: 'm1', startTime: '2026-01-01T01:00:00.000Z', endTime: '2026-01-02T01:00:00.000Z', pickupLocation: '機場', returnLocation: '機場' },
    );

    expect(component.lockedMemberId()).toBe('m1');
    expect(component.form.controls.name.disabled).toBe(true);
    expect(component.form.getRawValue().name).toBe('王小明');
  });
});
