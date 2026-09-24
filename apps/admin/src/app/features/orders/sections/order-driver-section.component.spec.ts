import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DriverCredential, Member } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { DriverEligibilityPanelComponent } from '../../bookings/components/driver-eligibility-panel.component';
import { ORDER_FORM_DATA } from '../order-form/order-form-data';
import { OrderForm, createOrderForm, lockRenterToMember, unlockRenter } from '../order-form/order-form';
import { AdminOrderFormData } from '../data/admin-order-form-data';
import { createOrderRepos } from '../testing';
import { OrderDriverSectionComponent } from './order-driver-section.component';

const t = ZH_TW;

const member: Member = { id: 'm1', name: '王小明', phone: '0912', kind: 'local' };
const credential: DriverCredential = {
  id: 'dc1',
  memberId: 'm1',
  type: 'taiwan_license',
  documentNumber: 'TL-0001',
  issuingCountry: 'TW',
  originalVehicleClassText: '普通重型機車',
  standardizedVehicleClass: 'scooter',
  verification: { state: 'verified' },
  reciprocityStatus: 'pending',
  version: 1,
  createdAt: '',
  updatedAt: '',
};

function setup(form: OrderForm = createOrderForm(), vehicleCategory?: 'car' | 'scooter') {
  const repos = createOrderRepos({ members: [member], driverCredentials: [credential] });
  TestBed.configureTestingModule({
    providers: [...repos.providers, { provide: ORDER_FORM_DATA, useClass: AdminOrderFormData }],
  });
  const fixture = TestBed.createComponent(OrderDriverSectionComponent);
  fixture.componentRef.setInput('form', form);
  if (vehicleCategory) fixture.componentRef.setInput('vehicleCategory', vehicleCategory);
  fixture.detectChanges();
  return { fixture, form, el: fixture.nativeElement as HTMLElement };
}

describe('OrderDriverSectionComponent（建立訂單第 2 步的駕駛資格）', () => {
  it('新承租人：欄位空白、提示可以留空（留空會列入待補）；本國人不顯示互惠資格查核', () => {
    const { el } = setup();
    expect(el.textContent).toContain(t.member.licenseSectionTitle);
    expect(el.textContent).toContain(t.orderForm.driver.optionalHint);
    expect(el.querySelector('app-driver-eligibility-panel')).toBeNull();
    expect(el.textContent).not.toContain(t.member.licensePath);
  });

  it('選了既有會員：帶入他最新一版的駕駛資格（仍可修改）；換一位就清空', () => {
    const { fixture, form, el } = setup();
    lockRenterToMember(form, member);
    fixture.detectChanges();

    expect(form.getRawValue().driver).toMatchObject({
      licenseNumber: 'TL-0001',
      originalVehicleClassText: '普通重型機車',
      standardizedVehicleClass: 'scooter',
    });
    expect(form.controls.driver.controls.licenseNumber.enabled).toBe(true);
    expect(el.textContent).toContain(t.orderForm.driver.prefilledHint);

    unlockRenter(form);
    fixture.detectChanges();
    expect(form.getRawValue().driver).toMatchObject({ licenseNumber: '', standardizedVehicleClass: null });
  });

  it('元件重新建立（例如換成直式步驟）不會把已填的駕照清掉', () => {
    const form = createOrderForm();
    form.controls.driver.patchValue({ licenseNumber: 'TL-9', standardizedVehicleClass: 'car' });
    setup(form);
    expect(form.getRawValue().driver.licenseNumber).toBe('TL-9');
  });

  it('外國旅客：顯示互惠資格查核；查核結果寫回表單，改了發照國家就作廢', async () => {
    const form = createOrderForm();
    form.controls.renter.patchValue({ kind: 'foreign_visitor', nationality: 'JP' });
    const { fixture, el } = setup(form);
    expect(el.textContent).toContain(t.member.licenseIssuingCountry);

    const panel = fixture.debugElement.query(By.directive(DriverEligibilityPanelComponent));
    expect(panel).toBeTruthy();
    expect(panel.componentInstance.issuingCountry()).toBe('JP');

    await (panel.componentInstance as DriverEligibilityPanelComponent).check();
    expect(form.getRawValue().driver.reciprocityStatus).toBe('manual_review');

    form.controls.driver.controls.licenseIssuingCountry.setValue('KR');
    expect(form.getRawValue().driver.reciprocityStatus).toBeNull();
  });

  it('持居留證者可以選駕照路徑', () => {
    const form = createOrderForm();
    form.controls.renter.patchValue({ kind: 'resident' });
    const { el } = setup(form);
    expect(el.textContent).toContain(t.member.licensePath);
  });

  it('標準化車種和本次車輛不同時提醒（取車時會被擋下）', () => {
    const form = createOrderForm();
    const { fixture, el } = setup(form, 'car');
    expect(el.querySelector('.driver-class-mismatch')).toBeNull();

    form.controls.driver.patchValue({ standardizedVehicleClass: 'scooter' });
    fixture.detectChanges();
    expect(el.querySelector('.driver-class-mismatch')?.textContent).toContain(t.vehicle.typeLabels['car']);

    form.controls.driver.patchValue({ standardizedVehicleClass: 'car' });
    fixture.detectChanges();
    expect(el.querySelector('.driver-class-mismatch')).toBeNull();
  });
});
