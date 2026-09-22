import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { of } from 'rxjs';
import { ContractSigningDialogComponent } from '@car-rental/contract-signing';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog.component';
import { ORDER_FORM_DATA } from '../order-form/order-form-data';
import { ORDER_SUBMIT_GATEWAY, OrderSubmitGateway, OrderSubmitInput } from '../order-form/order-submit-gateway';
import { AdminOrderFormData } from '../data/admin-order-form-data';
import { createOrderRepos, makeVehicle } from '../testing';
import { ORDER_CREATE_STEPS, OrderCreatePageComponent } from './order-create-page.component';
import { ORDER_ROUTES } from '../orders.routes';
import { confirmLeaveGuard } from '../navigation/confirm-leave.guard';
import { ZH_TW } from '../../../core/i18n/zh-tw';

interface SetupOptions {
  query?: Record<string, string>;
  /** 簽署 dialog 關閉時回傳的簽名資產；confirm dialog 的結果。 */
  signingResult?: { assetId: string; url: string } | undefined;
  confirmResult?: boolean;
}

function setup(options: SetupOptions = {}) {
  const repos = createOrderRepos({
    vehicles: [makeVehicle({ id: 'v1', location: 'mzg-port' }), makeVehicle({ id: 'v2', plateNumber: 'XYZ-999' })],
  });
  const create = vi.fn<OrderSubmitGateway['create']>(async () => 'new-booking-id');
  const gateway: OrderSubmitGateway = { create, update: vi.fn(async (id: string) => id) };
  const dialogOpen = vi.fn((component: unknown) => {
    if (component === ContractSigningDialogComponent) return { afterClosed: () => of(options.signingResult) };
    if (component === ConfirmDialogComponent) return { afterClosed: () => of(options.confirmResult ?? false) };
    return { afterClosed: () => of(undefined) };
  });

  TestBed.configureTestingModule({
    providers: [
      ...repos.providers,
      provideRouter([]),
      { provide: ORDER_FORM_DATA, useClass: AdminOrderFormData },
      { provide: ORDER_SUBMIT_GATEWAY, useValue: gateway },
      { provide: MatDialog, useValue: { open: dialogOpen } },
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap(options.query ?? {}) } },
      },
    ],
  });
  const router = TestBed.inject(Router);
  const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  const navigateByUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  const fixture = TestBed.createComponent(OrderCreatePageComponent);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, create, dialogOpen, navigate, navigateByUrl };
}

function steps(fixture: ReturnType<typeof setup>['fixture']): MatStep[] {
  const stepper = fixture.debugElement.query(By.directive(MatStepper)).injector.get(MatStepper);
  return stepper.steps.toArray();
}

function fillBaseline(component: OrderCreatePageComponent): void {
  component.form.controls.rental.patchValue({
    vehicleId: 'v1',
    startLocal: '2026-01-05T09:00',
    endLocal: '2026-01-07T09:00',
  });
  component.form.controls.renter.patchValue({ name: '新客人', phone: '0900000000' });
}

describe('OrderCreatePageComponent 建立訂單按鈕與步驟錯誤', () => {
  it('五個步驟依序為租期與車輛→承租人→費用與付款→合約→確認建立', () => {
    const { fixture } = setup();
    expect(ORDER_CREATE_STEPS).toEqual(['vehicle', 'renter', 'payment', 'contract', 'review']);
    expect(steps(fixture)).toHaveLength(5);
  });

  it('按下建立前，所有步驟 hasError 都是 false（保持中性）', () => {
    const { fixture } = setup();
    expect(steps(fixture).map((s) => s.hasError)).toEqual([false, false, false, false, false]);
  });

  it('每一步都看得到「建立訂單」按鈕', () => {
    const { fixture, component } = setup();
    for (let i = 0; i < ORDER_CREATE_STEPS.length; i++) {
      component.selectedIndex.set(i);
      fixture.detectChanges();
      const submit = fixture.nativeElement.querySelector('.order-create__submit') as HTMLButtonElement;
      expect(submit).toBeTruthy();
      expect(submit.disabled).toBe(false);
    }
  });

  it('底線不齊時按建立：不送出、有問題的步驟亮錯誤、欄位標為 touched、跳到第一個有錯的步驟', async () => {
    const { fixture, component, create } = setup();
    component.selectedIndex.set(3);

    await component.submit();
    fixture.detectChanges();

    expect(create).not.toHaveBeenCalled();
    expect(steps(fixture).map((s) => s.hasError)).toEqual([true, true, false, false, false]);
    expect(component.selectedIndex()).toBe(0);
    expect(component.form.controls.renter.controls.name.touched).toBe(true);
    expect(fixture.nativeElement.querySelector('.order-create__errors')).toBeTruthy();
  });

  it('只缺承租人時跳到第二步；補齊後該步錯誤即時消失', async () => {
    const { fixture, component, create } = setup();
    component.form.controls.rental.patchValue({
      vehicleId: 'v1',
      startLocal: '2026-01-05T09:00',
      endLocal: '2026-01-07T09:00',
    });

    await component.submit();
    fixture.detectChanges();
    expect(create).not.toHaveBeenCalled();
    expect(component.selectedIndex()).toBe(1);
    expect(steps(fixture).map((s) => s.hasError)).toEqual([false, true, false, false, false]);

    component.form.controls.renter.patchValue({ name: '新客人', phone: '0900000000' });
    fixture.detectChanges();
    expect(steps(fixture)[1].hasError).toBe(false);
  });

  it('底線齊了、其餘未填也可以建立：呼叫 gateway.create，成功後導向新訂單的訂單詳情', async () => {
    const { component, create, navigate } = setup();
    fillBaseline(component);

    await component.submit();

    expect(create).toHaveBeenCalledTimes(1);
    const input = create.mock.calls[0][0] as OrderSubmitInput;
    expect(input.value.rental.vehicleId).toBe('v1');
    expect(input.value.renter.email).toBe('');
    expect(input.presignature).toBeUndefined();
    expect(navigate).toHaveBeenCalledWith(['/orders', 'new-booking-id']);
    expect(component.unsavedChangesMessage()).toBeNull(); // 已建立，導頁不再被離開確認擋下
    expect(component.incompleteItems().length).toBeGreaterThan(0); // 未填的部分成為待補項目
  });

  it('gateway 失敗時顯示錯誤訊息、不導頁', async () => {
    const { component, create, navigate } = setup();
    create.mockRejectedValueOnce(new Error('寫入失敗'));
    fillBaseline(component);

    await component.submit();

    expect(component.error()).toBe('寫入失敗');
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe('OrderCreatePageComponent 合約預簽', () => {
  const asset = { assetId: 'asset-1', url: 'blob:signature' };

  it('簽署後未改動：狀態為已簽署，送出時帶上該 assetId 與簽署當下快照', async () => {
    const { component, create, dialogOpen } = setup({ signingResult: asset });
    fillBaseline(component);

    component.openSigning();
    expect(dialogOpen).toHaveBeenCalledWith(
      ContractSigningDialogComponent,
      expect.objectContaining({ data: expect.objectContaining({ needsResign: false }) }),
    );
    expect(component.contractSigning()).toBe('signed');

    await component.submit();
    const input = create.mock.calls[0][0] as OrderSubmitInput;
    expect(input.presignature?.assetId).toBe('asset-1');
    expect(input.presignature?.snapshot).toEqual(component.previewSnapshot());
  });

  it('簽署後改了租期：狀態變「需重新簽署」，再開 dialog 帶 needsResign，送出不套用舊簽名', async () => {
    const { component, create, dialogOpen } = setup({ signingResult: asset });
    fillBaseline(component);
    component.openSigning();

    component.form.controls.rental.controls.endLocal.setValue('2026-01-08T09:00');
    expect(component.contractSigning()).toBe('needs_resign');
    expect(component.incompleteItems()).toContain('合約條款已變更，需重新簽署');

    await component.submit();
    expect((create.mock.calls[0][0] as OrderSubmitInput).presignature).toBeUndefined();

    component.openSigning();
    expect(dialogOpen).toHaveBeenLastCalledWith(
      ContractSigningDialogComponent,
      expect.objectContaining({ data: expect.objectContaining({ needsResign: true }) }),
    );
  });

  it('只改內部備註不影響簽署狀態', () => {
    const { component } = setup({ signingResult: asset });
    fillBaseline(component);
    component.openSigning();
    component.form.controls.contract.controls.internalNote.setValue('VIP');
    expect(component.contractSigning()).toBe('signed');
  });

  it('客人取消簽署 dialog：維持未簽署', () => {
    const { component } = setup({ signingResult: undefined });
    fillBaseline(component);
    component.openSigning();
    expect(component.contractSigning()).toBe('unsigned');
  });
});

describe('OrderCreatePageComponent query params 預填與取消', () => {
  it('以 vehicleId/start/end 預填，並預帶車輛所在據點為取／還車據點', () => {
    const start = new Date('2026-08-20T10:00').toISOString();
    const end = new Date('2026-08-21T10:00').toISOString();
    const { component } = setup({ query: { vehicleId: 'v1', start, end } });
    const rental = component.form.getRawValue().rental;
    expect(rental).toEqual({
      vehicleId: 'v1',
      startLocal: '2026-08-20T10:00',
      endLocal: '2026-08-21T10:00',
      pickupLocation: 'mzg-port',
      returnLocation: 'mzg-port',
    });
    expect(component.form.dirty).toBe(false);
  });

  it('不存在的車輛與無法解析的時間會被忽略', () => {
    const { component } = setup({ query: { vehicleId: 'nope', start: 'not-a-date' } });
    expect(component.form.getRawValue().rental).toMatchObject({ vehicleId: '', startLocal: '' });
  });

  it('沒有改動時取消直接回來源頁（直接進入時為訂單列表），不跳確認', async () => {
    const { component, dialogOpen, navigateByUrl } = setup();
    await component.cancel();
    expect(dialogOpen).not.toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalledWith('/bookings');
  });

  it('表單有改動時取消會先確認；不確認就留在頁面', async () => {
    const { component, dialogOpen, navigateByUrl } = setup({ confirmResult: false });
    component.form.controls.renter.controls.name.markAsDirty();
    await component.cancel();
    expect(dialogOpen).toHaveBeenCalledWith(ConfirmDialogComponent, expect.anything());
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});

describe('OrderCreatePageComponent 離開確認（confirmLeaveGuard）', () => {
  it('路由有掛上離開確認', () => {
    const route = ORDER_ROUTES[0].children?.find((r) => r.path === 'new');
    expect(route?.canDeactivate).toContain(confirmLeaveGuard);
  });

  it('沒有改動時直接放行', () => {
    const { component } = setup();
    expect(component.unsavedChangesMessage()).toBeNull();
  });

  it('有未建立的內容時要求確認', () => {
    const { component } = setup();
    component.form.controls.renter.controls.name.markAsDirty();
    expect(component.unsavedChangesMessage()).toBe(ZH_TW.orderForm.discardConfirm);
  });

  it('按取消並確認放棄後，接下來的導頁不再重複詢問', async () => {
    const { component, navigateByUrl } = setup({ confirmResult: true });
    component.form.controls.renter.controls.name.markAsDirty();
    await component.cancel();
    expect(navigateByUrl).toHaveBeenCalledWith('/bookings');
    expect(component.unsavedChangesMessage()).toBeNull();
  });
});
