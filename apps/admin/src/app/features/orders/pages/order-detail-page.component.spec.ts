import { describe, expect, it, vi } from 'vitest';
import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, of } from 'rxjs';
import { Member, RentalBooking } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { ContractStore } from '../../../stores/contract/contract.store';
import { BookingStore } from '../../../stores/booking/booking.store';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog.component';
import { PaymentPanelComponent } from '../../bookings/components/payment-panel.component';
import { ContractPanelComponent } from '../../bookings/components/contract-panel.component';
import { HandoverPanelComponent } from '../../bookings/components/handover-panel.component';
import { CancellationPanelComponent } from '../../bookings/components/cancellation-panel.component';
import { CustomerCreditPanelComponent } from '../../bookings/components/customer-credit-panel.component';
import { OperatorRecoveryPanelComponent } from '../../bookings/components/operator-recovery-panel.component';
import { ActivityTimelineComponent } from '../../bookings/components/activity-timeline.component';
import { ORDER_FORM_DATA } from '../order-form/order-form-data';
import { ORDER_SUBMIT_GATEWAY, OrderSubmitGateway, OrderSubmitInput } from '../order-form/order-submit-gateway';
import { createOrderForm } from '../order-form/order-form';
import { AdminOrderFormData } from '../data/admin-order-form-data';
import { AdminOrderSubmitGateway } from '../data/admin-order-submit.gateway';
import { confirmLeaveGuard } from '../navigation/confirm-leave.guard';
import { ORDER_ROUTES } from '../orders.routes';
import { createOrderRepos, makeVehicle } from '../testing';
import { OrderDetailPageComponent } from './order-detail-page.component';

// 各分頁的 panel 元件有自己的測試；這裡只驗證詳情頁的殼（分頁、網址、編輯訂單），用同 selector 的替身避開它們的相依。
@Component({ selector: 'app-payment-panel', template: '' })
class PaymentPanelStub { readonly bookingId = input<string>(); }
@Component({ selector: 'app-contract-panel', template: '' })
class ContractPanelStub { readonly bookingId = input<string>(); }
@Component({ selector: 'app-handover-panel', template: '' })
class HandoverPanelStub { readonly bookingId = input<string>(); }
@Component({ selector: 'app-cancellation-panel', template: '' })
class CancellationPanelStub { readonly bookingId = input<string>(); }
@Component({ selector: 'app-customer-credit-panel', template: '' })
class CustomerCreditPanelStub { readonly bookingId = input<string>(); }
@Component({ selector: 'app-operator-recovery-panel', template: '' })
class OperatorRecoveryPanelStub { readonly bookingId = input<string>(); }
@Component({ selector: 'app-activity-timeline', template: '' })
class ActivityTimelineStub { readonly bookingId = input<string>(); }

@Component({ template: '' })
class BlankComponent {}

const member: Member = { id: 'm1', name: '王小明', phone: '0912345678', kind: 'local', email: 'wang@example.com' };

function makeBooking(partial: Partial<RentalBooking> = {}): RentalBooking {
  return {
    id: 'b1',
    vehicleId: 'v1',
    memberId: 'm1',
    startTime: new Date('2026-01-05T09:00').toISOString(),
    endTime: new Date('2026-01-07T09:00').toISOString(),
    pickupLocation: 'mzg-airport',
    returnLocation: 'mzg-airport',
    status: 'reserved',
    depositRequired: 500,
    ...partial,
  };
}

interface SetupOptions {
  bookings?: RentalBooking[];
  /** 'real'：用 admin 的送出實作（寫入 in-memory repo）；預設為 spy。 */
  gateway?: 'real' | 'spy';
  confirmResult?: boolean;
}

async function setup(url: string, options: SetupOptions = {}) {
  const repos = createOrderRepos({
    vehicles: [makeVehicle({ id: 'v1', location: 'mzg-airport' }), makeVehicle({ id: 'v2', plateNumber: 'XYZ-999', location: 'mzg-port' })],
    members: [member],
    bookings: options.bookings ?? [makeBooking()],
  });
  const update = vi.fn<OrderSubmitGateway['update']>(async (id: string) => id);
  const spyGateway: OrderSubmitGateway = { create: vi.fn(async () => 'x'), update };
  const dialogOpen = vi.fn(() => ({ afterClosed: () => of(options.confirmResult ?? false) }));
  const snackAction = new Subject<void>();
  const snackOpen = vi.fn(() => ({ onAction: () => snackAction }));

  TestBed.configureTestingModule({
    providers: [
      ...repos.providers,
      provideRouter([
        { path: 'orders/:id', component: OrderDetailPageComponent, canDeactivate: [confirmLeaveGuard] },
        { path: 'bookings', component: BlankComponent },
      ]),
      { provide: ORDER_FORM_DATA, useClass: AdminOrderFormData },
      options.gateway === 'real'
        ? { provide: ORDER_SUBMIT_GATEWAY, useClass: AdminOrderSubmitGateway }
        : { provide: ORDER_SUBMIT_GATEWAY, useValue: spyGateway },
      { provide: MatDialog, useValue: { open: dialogOpen } },
      { provide: MatSnackBar, useValue: { open: snackOpen } },
    ],
  });
  TestBed.overrideComponent(OrderDetailPageComponent, {
    remove: {
      imports: [
        PaymentPanelComponent,
        ContractPanelComponent,
        HandoverPanelComponent,
        CancellationPanelComponent,
        CustomerCreditPanelComponent,
        OperatorRecoveryPanelComponent,
        ActivityTimelineComponent,
      ],
    },
    add: {
      imports: [
        PaymentPanelStub,
        ContractPanelStub,
        HandoverPanelStub,
        CancellationPanelStub,
        CustomerCreditPanelStub,
        OperatorRecoveryPanelStub,
        ActivityTimelineStub,
      ],
    },
  });

  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(url, OrderDetailPageComponent);
  await settle(harness);
  const router = TestBed.inject(Router);
  return { harness, component, router, update, dialogOpen, snackOpen, snackAction, repos };
}

async function settle(harness: RouterTestingHarness): Promise<void> {
  await harness.fixture.whenStable();
  harness.detectChanges();
}

function el(harness: RouterTestingHarness): HTMLElement {
  return harness.routeNativeElement as HTMLElement;
}

function navButton(harness: RouterTestingHarness, section: string): HTMLButtonElement {
  return el(harness).querySelector(`.order-detail__nav-item[data-section="${section}"]`) as HTMLButtonElement;
}

describe('OrderDetailPageComponent 分頁與網址', () => {
  it('沒帶 section 時停在總覽；頁首顯示客人、車牌／車型與狀態', async () => {
    const { component, harness } = await setup('/orders/b1');
    expect(component.activeSection()).toBe('overview');
    expect(navButton(harness, 'overview').classList).toContain('is-active');
    const header = el(harness).querySelector('.order-detail__header')?.textContent ?? '';
    expect(header).toContain('王小明');
    expect(header).toContain('ABC-123');
    expect(header).toContain(ZH_TW.booking.statusLabels['reserved']);
    expect(el(harness).querySelector('.order-detail__eyebrow')?.textContent?.trim()).toBe(ZH_TW.orderDetail.title);
  });

  it('網址 → 分頁：?section=handover 直接開在交還車分頁', async () => {
    const { component, harness } = await setup('/orders/b1?section=handover');
    expect(component.activeSection()).toBe('handover');
    expect(navButton(harness, 'handover').getAttribute('aria-current')).toBe('page');
    expect(el(harness).querySelector('app-handover-panel')).not.toBeNull();
  });

  it('分頁 → 網址：點分頁會以 replaceUrl 更新 section；回到總覽時拿掉參數', async () => {
    const { component, harness, router } = await setup('/orders/b1');
    const navigate = vi.spyOn(router, 'navigate');

    navButton(harness, 'payments').click();
    await settle(harness);
    expect(router.url).toBe('/orders/b1?section=payments');
    expect(navigate.mock.calls[0][1]).toMatchObject({ replaceUrl: true });
    expect(component.activeSection()).toBe('payments');
    expect(el(harness).querySelector('app-payment-panel')).not.toBeNull();

    navButton(harness, 'overview').click();
    await settle(harness);
    expect(router.url).toBe('/orders/b1');
  });

  it('找不到訂單時顯示空狀態', async () => {
    const { harness } = await setup('/orders/nope');
    expect(el(harness).textContent).toContain(ZH_TW.orderDetail.notFound);
  });
});

describe('OrderDetailPageComponent 編輯訂單（總覽）', () => {
  it('預設唯讀：顯示分組資訊與「編輯」，不渲染表單', async () => {
    const { harness, component } = await setup('/orders/b1');
    expect(component.editing()).toBe(false);
    expect(el(harness).querySelector('app-order-rental-section')).toBeNull();
    const groups = Array.from(el(harness).querySelectorAll('.order-detail__group-title')).map((h) => h.textContent?.trim());
    expect(groups).toEqual([
      ZH_TW.orderDetail.groups.rental,
      ZH_TW.orderDetail.groups.renter,
      ZH_TW.orderDetail.groups.pricing,
    ]);
    expect(el(harness).querySelector('.order-detail__edit')).not.toBeNull();
  });

  it('按「編輯」切換成表單（租期與車輛／承租人／費用），以訂單內容帶入，不含款項登記', async () => {
    const { harness, component } = await setup('/orders/b1');
    (el(harness).querySelector('.order-detail__edit') as HTMLButtonElement).click();
    await settle(harness);

    expect(component.editing()).toBe(true);
    expect(el(harness).querySelector('app-order-rental-section')).not.toBeNull();
    expect(el(harness).querySelector('app-order-renter-section')).not.toBeNull();
    expect(el(harness).querySelector('app-order-pricing-section')).not.toBeNull();
    expect(el(harness).querySelector('app-order-payment-drafts-section')).toBeNull();
    const value = component.form().getRawValue();
    expect(value.rental.vehicleId).toBe('v1');
    expect(value.renter.memberId).toBe('m1');
    expect(value.pricing.depositRequired).toBe(500);
  });

  it('編輯中其他分頁停用，也無法透過 selectSection 切走', async () => {
    const { harness, component, router } = await setup('/orders/b1');
    component.startEdit();
    await settle(harness);

    for (const s of ['documents', 'payments', 'contract', 'handover', 'cancellation', 'activity']) {
      expect(navButton(harness, s).disabled).toBe(true);
    }
    expect(navButton(harness, 'overview').disabled).toBe(false);
    component.selectSection('contract');
    await settle(harness);
    expect(router.url).toBe('/orders/b1');
    expect(component.activeSection()).toBe('overview');
  });

  it('從其他分頁按編輯（例如程式呼叫）會回到總覽', async () => {
    const { harness, component, router } = await setup('/orders/b1?section=payments');
    component.startEdit();
    await settle(harness);
    expect(component.activeSection()).toBe('overview');
    expect(router.url).toBe('/orders/b1');
  });

  it('取消：還原所有改動並回到唯讀，訂單不變', async () => {
    const { harness, component, update } = await setup('/orders/b1');
    component.startEdit();
    const original = component.form().getRawValue().rental.endLocal;
    component.form().controls.rental.controls.endLocal.setValue('2026-01-08T09:00');
    component.form().controls.rental.controls.endLocal.markAsDirty();
    await settle(harness);

    (el(harness).querySelector('.order-detail__cancel') as HTMLButtonElement).click();
    await settle(harness);

    expect(component.editing()).toBe(false);
    expect(update).not.toHaveBeenCalled();
    expect(TestBed.inject(BookingStore).bookings()[0].endTime).toBe(makeBooking().endTime);
    component.startEdit();
    expect(component.form().getRawValue().rental.endLocal).toBe(original);
  });

  it('儲存：呼叫 gateway.update（不帶款項草稿），成功後回到唯讀並顯示 snackbar', async () => {
    const { harness, component, update, snackOpen } = await setup('/orders/b1');
    component.startEdit();
    component.form().controls.rental.controls.endLocal.setValue('2026-01-08T09:00');
    component.form().controls.payments.controls.drafts.setValue([{ method: 'cash', amount: 100, purpose: 'deposit' }]);
    await settle(harness);

    await component.save();

    expect(update).toHaveBeenCalledTimes(1);
    const [id, input] = update.mock.calls[0] as [string, OrderSubmitInput];
    expect(id).toBe('b1');
    expect(input.value.rental.endLocal).toBe('2026-01-08T09:00');
    expect(input.value.payments.drafts).toEqual([]);
    expect(input.presignature).toBeUndefined();
    expect(component.editing()).toBe(false);
    expect(snackOpen).toHaveBeenCalledWith(ZH_TW.orderDetail.saved, undefined, expect.anything());
  });

  it('儲存失敗：留在編輯狀態並顯示錯誤', async () => {
    const { harness, component, update } = await setup('/orders/b1');
    update.mockRejectedValueOnce(new Error('寫入失敗'));
    component.startEdit();
    await component.save();
    await settle(harness);

    expect(component.editing()).toBe(true);
    expect(component.error()).toBe('寫入失敗');
    expect(el(harness).querySelector('[role="alert"]')?.textContent).toContain('寫入失敗');
  });

  it('送出前檢查沒過（還車早於取車）：不呼叫 gateway，顯示問題', async () => {
    const { component, update } = await setup('/orders/b1');
    component.startEdit();
    component.form().controls.rental.controls.endLocal.setValue('2026-01-04T09:00');
    await component.save();
    expect(update).not.toHaveBeenCalled();
    expect(component.editing()).toBe(true);
    expect(component.error()).toContain(ZH_TW.orderForm.problems.endBeforeStart);
  });

  it('?edit=1 直接進入總覽的編輯狀態，並把 edit 參數從網址拿掉', async () => {
    const { component, router } = await setup('/orders/b1?edit=1');
    expect(component.editing()).toBe(true);
    expect(router.url).toBe('/orders/b1');
  });

  it('不可編輯（已取車）的訂單不顯示「編輯」，?edit=1 也不會進入編輯', async () => {
    const { harness, component, router } = await setup('/orders/b1?edit=1', {
      bookings: [makeBooking({ status: 'in_progress' })],
    });
    expect(component.editing()).toBe(false);
    expect(el(harness).querySelector('.order-detail__edit')).toBeNull();
    expect(router.url).toBe('/orders/b1');
  });

  it('需調度（取車據點與車輛所在據點不同、尚未取車）時在取車據點旁標示', async () => {
    const { harness } = await setup('/orders/b1', {
      bookings: [makeBooking({ vehicleId: 'v2', pickupLocation: 'mzg-airport' })],
    });
    const chip = el(harness).querySelector('.order-detail__branch .ui-chip');
    expect(chip?.textContent).toContain(ZH_TW.dispatch.workList.needsDispatch);
    expect(chip?.textContent).toContain('swap_horiz');
  });
});

describe('OrderDetailPageComponent 合約需重新簽署提醒', () => {
  it('已簽署訂單改租期並儲存：產生新合約版本、snackbar 提醒需重新簽署，動作前往合約分頁', async () => {
    const { component, harness, router, snackOpen, snackAction } = await setup('/orders/b1', {
      bookings: [],
      gateway: 'real',
    });
    // 以真正的送出實作建立一筆訂單並簽署第 1 版合約。
    const gateway = TestBed.inject(ORDER_SUBMIT_GATEWAY);
    const form = createOrderForm({
      vehicleId: 'v1',
      startTime: new Date('2026-01-05T09:00').toISOString(),
      endTime: new Date('2026-01-07T09:00').toISOString(),
      pickupLocation: 'mzg-airport',
      returnLocation: 'mzg-airport',
      member,
    });
    const id = await gateway.create({ value: form.getRawValue() });
    const contracts = TestBed.inject(ContractStore);
    const first = contracts.latestFor(id);
    if (!first) throw new Error('contract not created');
    contracts.sign(first.id, ['asset-1']);

    await harness.navigateByUrl(`/orders/${id}`, OrderDetailPageComponent);
    await settle(harness);
    component.startEdit();
    component.form().controls.rental.controls.endLocal.setValue('2026-01-08T09:00');
    await component.save();

    expect(contracts.versionsFor(id).map((v) => v.status)).toEqual(['superseded', 'draft']);
    expect(component.editing()).toBe(false);
    expect(snackOpen).toHaveBeenCalledWith(ZH_TW.orderDetail.needsResign, ZH_TW.orderDetail.goToContract, expect.anything());

    snackAction.next();
    await settle(harness);
    expect(router.url).toBe(`/orders/${id}?section=contract`);
    expect(component.activeSection()).toBe('contract');
  });

  it('沒有產生新合約版本時只顯示一般的儲存成功', async () => {
    const { component, harness, snackOpen } = await setup('/orders/b1', { bookings: [], gateway: 'real' });
    const gateway = TestBed.inject(ORDER_SUBMIT_GATEWAY);
    const id = await gateway.create({
      value: createOrderForm({
        vehicleId: 'v1',
        startTime: new Date('2026-01-05T09:00').toISOString(),
        endTime: new Date('2026-01-07T09:00').toISOString(),
        pickupLocation: 'mzg-airport',
        returnLocation: 'mzg-airport',
        member,
      }).getRawValue(),
    });
    await harness.navigateByUrl(`/orders/${id}`, OrderDetailPageComponent);
    await settle(harness);
    component.startEdit();
    await component.save();
    expect(snackOpen).toHaveBeenCalledWith(ZH_TW.orderDetail.saved, undefined, expect.anything());
  });
});

describe('OrderDetailPageComponent 離開確認（confirmLeaveGuard）', () => {
  it('路由有掛上離開確認', () => {
    const route = ORDER_ROUTES[0].children?.find((r) => r.path === ':id');
    expect(route?.canDeactivate).toContain(confirmLeaveGuard);
  });

  it('編輯中但沒有改動：直接放行，不跳確認', async () => {
    const { component, router, dialogOpen } = await setup('/orders/b1');
    component.startEdit();
    expect(await router.navigateByUrl('/bookings')).toBe(true);
    expect(dialogOpen).not.toHaveBeenCalled();
  });

  it('有未儲存改動：離開前要求確認，不確認就留在頁面', async () => {
    const { component, router, dialogOpen } = await setup('/orders/b1', { confirmResult: false });
    component.startEdit();
    component.form().controls.rental.controls.endLocal.markAsDirty();

    expect(await router.navigateByUrl('/bookings')).toBe(false);
    expect(dialogOpen).toHaveBeenCalledWith(ConfirmDialogComponent, expect.objectContaining({
      data: ZH_TW.orderDetail.discardChangesConfirm,
    }));
    expect(router.url).toBe('/orders/b1');
    expect(component.editing()).toBe(true);
  });

  it('有未儲存改動且確認放棄：放行', async () => {
    const { component, router } = await setup('/orders/b1', { confirmResult: true });
    component.startEdit();
    component.form().controls.rental.controls.endLocal.markAsDirty();
    expect(await router.navigateByUrl('/bookings')).toBe(true);
  });
});
