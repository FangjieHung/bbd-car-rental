import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { toSignal } from '@angular/core/rxjs-interop';
import { RentalBooking } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { MemberStore } from '../../../stores/member/member.store';

export interface BookingFormResult {
  vehicleId: string;
  memberId: string;
  startTime: string; // ISO
  endTime: string; // ISO
  pickupLocation: string;
  returnLocation: string;
  // TODO(Task 9): 目前先固定 0，待訂金試算/上限規則的完整表單進來後改用真正算出的值。
  depositRequired: number;
}

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

@Component({
  selector: 'app-booking-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
  templateUrl: './booking-form-dialog.component.html',
  styleUrls: ['../../../app.scss'],
})
export class BookingFormDialogComponent {
  protected readonly t = ZH_TW;
  readonly ref = inject(MatDialogRef<BookingFormDialogComponent>);
  readonly data = inject<Partial<RentalBooking> | null>(MAT_DIALOG_DATA);
  readonly vehicleStore = inject(VehicleStore);
  readonly memberStore = inject(MemberStore);
  private fb = inject(NonNullableFormBuilder);
  readonly error = signal('');

  /**
   * 選到既有會員後鎖定其 id；姓名/電話/證件號三欄唯讀，送出直接沿用此 id 當 memberId。
   * 未鎖定（純手動輸入）代表要新增會員，送出時才呼叫 MemberStore.create()。
   */
  readonly lockedMemberId = signal<string | null>(null);

  form = this.fb.group({
    vehicleId: [this.data?.vehicleId ?? '', Validators.required],
    name: ['', Validators.required],
    phone: ['', Validators.required],
    idNumber: [''],
    startLocal: [
      this.data?.startTime ? toLocalInputValue(this.data.startTime) : '',
      Validators.required,
    ],
    endLocal: [
      this.data?.endTime ? toLocalInputValue(this.data.endTime) : '',
      Validators.required,
    ],
    pickupLocation: [this.data?.pickupLocation ?? '', Validators.required],
    returnLocation: [this.data?.returnLocation ?? '', Validators.required],
  });

  private readonly nameInput = toSignal(this.form.controls.name.valueChanges, {
    initialValue: this.form.controls.name.value,
  });

  readonly memberSuggestions = computed(() => {
    if (this.lockedMemberId()) return [];
    const query = this.nameInput().trim().toLowerCase();
    if (!query) return [];
    return this.memberStore
      .members()
      .filter((m) => m.name.toLowerCase().includes(query) || m.phone.toLowerCase().includes(query));
  });

  constructor() {
    // 編輯既有訂單時，預設鎖定原本的會員；使用者仍可點「換一位」重新選擇。
    const existingMemberId = this.data?.memberId;
    if (existingMemberId) {
      const member = this.memberStore.members().find((m) => m.id === existingMemberId);
      if (member) this.lockToMember(member.id, member.name, member.phone, member.idNumber ?? '');
    }
  }

  private lockToMember(id: string, name: string, phone: string, idNumber: string): void {
    this.lockedMemberId.set(id);
    this.form.patchValue({ name, phone, idNumber });
    this.form.controls.name.disable();
    this.form.controls.phone.disable();
    this.form.controls.idNumber.disable();
  }

  onMemberSelected(event: MatAutocompleteSelectedEvent): void {
    const member = this.memberStore.members().find((m) => m.id === event.option.value);
    if (!member) return;
    this.lockToMember(member.id, member.name, member.phone, member.idNumber ?? '');
  }

  changeMember(): void {
    this.lockedMemberId.set(null);
    this.form.controls.name.enable();
    this.form.controls.phone.enable();
    this.form.controls.idNumber.enable();
    this.form.patchValue({ name: '', phone: '', idNumber: '' });
  }

  save(): void {
    if (!this.form.valid) return;
    const v = this.form.getRawValue();
    const memberId =
      this.lockedMemberId() ??
      this.memberStore.create({
        name: v.name,
        phone: v.phone,
        idNumber: v.idNumber || undefined,
      }).id;
    const result: BookingFormResult = {
      vehicleId: v.vehicleId,
      memberId,
      startTime: new Date(v.startLocal).toISOString(),
      endTime: new Date(v.endLocal).toISOString(),
      pickupLocation: v.pickupLocation,
      returnLocation: v.returnLocation,
      depositRequired: this.data?.depositRequired ?? 0,
    };
    this.ref.close(result);
  }

  showError(message: string): void {
    this.error.set(message);
  }
}
