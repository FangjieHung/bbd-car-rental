import { describe, expect, it } from 'vitest';
import { signal } from '@angular/core';
import { DriverCredential, calculatePrice } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { connectOrderFormBehaviors, createOrderForm } from './order-form';
import { OrderFormData } from './order-form-data';
import { orderFormProblems } from './order-form-derived';
import { driverCredentialDraftOf, prefillDriver, sameDriverCredential, toDateOnly } from './order-driver';

const t = ZH_TW;

const credential: DriverCredential = {
  id: 'dc1',
  memberId: 'm1',
  type: 'foreign_idp_visa',
  documentNumber: 'IDP-JP-0004',
  issuingCountry: 'JP',
  expiryDate: '2027-03-01',
  originalVehicleClassText: 'Category B',
  standardizedVehicleClass: 'car',
  verification: { state: 'verified' },
  reciprocityStatus: 'manual_review',
  version: 1,
  createdAt: '',
  updatedAt: '',
};

function noProblemsDerived() {
  return {
    conflicts: signal([]),
    quoteUnavailable: signal(false),
    depositCap: signal(0),
    depositExceedsCap: signal(false),
    insuranceUnreconciled: signal(false),
  };
}

describe('driverCredentialDraftOf（第 2 步填的駕駛資格）', () => {
  it('沒填駕照號碼＝整組留空（undefined），其他欄位填了也一樣', () => {
    const form = createOrderForm();
    form.controls.driver.patchValue({ licenseExpiryDate: '2030-01-01', standardizedVehicleClass: 'car' });
    expect(driverCredentialDraftOf(form.getRawValue())).toBeUndefined();
  });

  it('本國人：台灣駕照、發照國家 TW', () => {
    const form = createOrderForm();
    form.controls.driver.patchValue({
      licenseNumber: ' TL-1 ',
      licenseExpiryDate: '2030-01-01',
      originalVehicleClassText: '普通小型車',
      standardizedVehicleClass: 'car',
    });
    expect(driverCredentialDraftOf(form.getRawValue())).toEqual({
      type: 'taiwan_license',
      documentNumber: 'TL-1',
      issuingCountry: 'TW',
      expiryDate: '2030-01-01',
      originalVehicleClassText: '普通小型車',
      standardizedVehicleClass: 'car',
    });
  });

  it('外國旅客：外國駕照；發照國家沒填就用國籍，都沒有記 UNKNOWN（同會員視窗）', () => {
    const form = createOrderForm();
    form.controls.renter.patchValue({ kind: 'foreign_visitor', nationality: 'JP' });
    form.controls.driver.patchValue({ licenseNumber: 'JP-1', standardizedVehicleClass: 'car' });
    expect(driverCredentialDraftOf(form.getRawValue())).toMatchObject({ type: 'foreign_license', issuingCountry: 'JP' });

    form.controls.renter.patchValue({ nationality: '' });
    expect(driverCredentialDraftOf(form.getRawValue())?.issuingCountry).toBe('UNKNOWN');
  });

  it('持居留證者看所選的駕照路徑', () => {
    const form = createOrderForm();
    form.controls.renter.patchValue({ kind: 'resident' });
    form.controls.driver.patchValue({ licenseNumber: 'R-1', standardizedVehicleClass: 'scooter' });
    expect(driverCredentialDraftOf(form.getRawValue())?.type).toBe('taiwan_license');
    form.controls.driver.patchValue({ licensePath: 'foreign', licenseIssuingCountry: 'VN' });
    expect(driverCredentialDraftOf(form.getRawValue())).toMatchObject({ type: 'foreign_license', issuingCountry: 'VN' });
  });
});

describe('既有駕駛資格的預填與比對', () => {
  it('prefillDriver 帶入最新一版（持居留證者的外國駕照會切到外國路徑），沒有紀錄就清空', () => {
    const form = createOrderForm();
    prefillDriver(form, credential, 'resident');
    expect(form.getRawValue().driver).toEqual({
      licensePath: 'foreign',
      licenseNumber: 'IDP-JP-0004',
      licenseIssuingCountry: 'JP',
      licenseExpiryDate: '2027-03-01',
      originalVehicleClassText: 'Category B',
      standardizedVehicleClass: 'car',
      reciprocityStatus: null,
    });

    prefillDriver(form, undefined, 'resident');
    expect(form.getRawValue().driver).toMatchObject({ licenseNumber: '', standardizedVehicleClass: null, licensePath: 'taiwan' });
  });

  it('帶入後沒改＝同一份（沿用既有紀錄）；改了任何一個看得到的欄位就不同', () => {
    const form = createOrderForm();
    form.controls.renter.patchValue({ kind: 'foreign_visitor', nationality: 'JP' });
    prefillDriver(form, credential, 'foreign_visitor');
    const draft = () => {
      const d = driverCredentialDraftOf(form.getRawValue());
      if (!d) throw new Error('draft missing');
      return d;
    };
    expect(sameDriverCredential(credential, draft())).toBe(true);

    form.controls.driver.patchValue({ licenseExpiryDate: '2027-03-02' });
    expect(sameDriverCredential(credential, draft())).toBe(false);
  });

  it('日期只比日期：ISO 日期時間（種子資料）與 YYYY-MM-DD 視為同一天', () => {
    const iso = new Date(2027, 2, 1, 0, 0).toISOString();
    expect(toDateOnly(iso)).toBe('2027-03-01');
    expect(toDateOnly('2027-03-01')).toBe('2027-03-01');
    expect(toDateOnly(undefined)).toBe('');
  });
});

describe('填了駕照號碼時標準化車種必填', () => {
  it('送出前的檢查：留空不擋；填了號碼沒選車種＝承租人步驟的問題', () => {
    const form = createOrderForm();
    expect(orderFormProblems(form.getRawValue(), noProblemsDerived()).renter).not.toContain(
      t.orderForm.problems.driverClassRequired,
    );
    form.controls.driver.patchValue({ licenseNumber: 'TL-1' });
    expect(orderFormProblems(form.getRawValue(), noProblemsDerived()).renter).toContain(
      t.orderForm.problems.driverClassRequired,
    );
    form.controls.driver.patchValue({ standardizedVehicleClass: 'car' });
    expect(orderFormProblems(form.getRawValue(), noProblemsDerived()).renter).not.toContain(
      t.orderForm.problems.driverClassRequired,
    );
  });

  it('欄位錯誤：駕照號碼一填，標準化車種就變成必填（欄位連動重新驗證）', () => {
    const form = createOrderForm();
    const data: OrderFormData = {
      vehicles: signal([]),
      addOns: signal([]),
      searchMembers: () => [],
      memberById: () => undefined,
      quote: (input) =>
        calculatePrice({
          plan: { id: 'p', name: 'p', appliesToCategory: input.vehicle.category, dayTypeRates: { weekday: 1, weekend: 1, holiday: 1, peak: 1 }, tiers: [] },
          calendar: { id: 'c', holidays: [], peakSeasons: [] },
          startDate: input.startDate,
          endDate: input.endDate,
          addOns: [],
        }),
      findConflicts: () => [],
      depositCap: () => 0,
      identityDocumentsOf: () => [],
      driverCredentialsOf: () => [],
    };
    const sub = connectOrderFormBehaviors(form, data, { autoDeposit: false });
    const vehicleClass = form.controls.driver.controls.standardizedVehicleClass;
    expect(vehicleClass.valid).toBe(true);

    form.controls.driver.controls.licenseNumber.setValue('TL-1');
    expect(vehicleClass.hasError('required')).toBe(true);

    form.controls.driver.controls.licenseNumber.setValue('');
    expect(vehicleClass.valid).toBe(true);
    sub.unsubscribe();
  });
});
