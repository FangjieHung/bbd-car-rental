import { describe, expect, it, vi } from 'vitest';
import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, of } from 'rxjs';
import {
  ContractVersion,
  DriverCredential,
  IdentityDocument,
  Member,
  OperatorRecoveryCase,
  PaymentRecord,
  RefundRecord,
  RentalBooking,
} from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { ContractStore } from '../../../stores/contract/contract.store';
import { BookingStore } from '../../../stores/booking/booking.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog.component';
import { PaymentPanelComponent } from '../../bookings/components/payment-panel.component';
import { ContractPanelComponent } from '../../bookings/components/contract-panel.component';
import { HandoverPanelComponent } from '../../bookings/components/handover-panel.component';
import { ActivityTimelineComponent } from '../../bookings/components/activity-timeline.component';
import { OrderCancellationTabComponent } from '../detail/order-cancellation-tab.component';
import { MemberFormDialogComponent } from '../../bookings/dialogs/member-form-dialog.component';
import { ORDER_FORM_DATA } from '../order-form/order-form-data';
import { ORDER_SUBMIT_GATEWAY, OrderSubmitGateway, OrderSubmitInput } from '../order-form/order-submit-gateway';
import { createOrderForm, setPaymentDrafts } from '../order-form/order-form';
import { AdminOrderFormData } from '../data/admin-order-form-data';
import { AdminOrderSubmitGateway } from '../data/admin-order-submit.gateway';
import { confirmLeaveGuard } from '../navigation/confirm-leave.guard';
import { ORDER_ROUTES } from '../orders.routes';
import { createOrderRepos, makeVehicle } from '../testing';
import { HeaderTitleSlot } from '../../../layout/header/header-title';
import { HeaderTitleExtraSlot } from '../../../layout/header/header-title-extra-slot';
import { OrderDetailPageComponent } from './order-detail-page.component';

// 各分頁的 panel 元件有自己的測試；這裡只驗證詳情頁的殼（分頁、網址、編輯訂單），用同 selector 的替身避開它們的相依。
@Component({ selector: 'app-payment-panel', template: '' })
class PaymentPanelStub { readonly bookingId = input<string>(); }
@Component({ selector: 'app-contract-panel', template: '' })
class ContractPanelStub { readonly bookingId = input<string>(); }
@Component({ selector: 'app-handover-panel', template: '' })
class HandoverPanelStub { readonly bookingId = input<string>(); }
@Component({ selector: 'app-order-cancellation-tab', template: '' })
class CancellationTabStub { readonly bookingId = input<string>(); }
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
  payments?: PaymentRecord[];
  refunds?: RefundRecord[];
  operatorRecoveryCases?: OperatorRecoveryCase[];
  contracts?: ContractVersion[];
  identityDocuments?: IdentityDocument[];
  driverCredentials?: DriverCredential[];
}

async function setup(url: string, options: SetupOptions = {}) {
  const repos = createOrderRepos({
    vehicles: [makeVehicle({ id: 'v1', location: 'mzg-airport' }), makeVehicle({ id: 'v2', plateNumber: 'XYZ-999', location: 'mzg-port' })],
    members: [member],
    bookings: options.bookings ?? [makeBooking()],
    refunds: options.refunds,
    operatorRecoveryCases: options.operatorRecoveryCases,
    contracts: options.contracts,
    identityDocuments: options.identityDocuments,
    driverCredentials: options.driverCredentials,
  });
  if (options.payments) for (const p of options.payments) repos.paymentRepo.create(p);
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
        OrderCancellationTabComponent,
        ActivityTimelineComponent,
      ],
    },
    add: {
      imports: [PaymentPanelStub, ContractPanelStub, HandoverPanelStub, CancellationTabStub, ActivityTimelineStub],
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
  it('沒帶 section 時停在總覽；頁內卡片顯示車牌／車型（客人姓名與狀態改由頁首顯示，見下方頁首標題測試）', async () => {
    const { component, harness } = await setup('/orders/b1');
    expect(component.activeSection()).toBe('overview');
    expect(navButton(harness, 'overview').classList).toContain('is-active');
    const header = el(harness).querySelector('.order-detail__header')?.textContent ?? '';
    expect(header).toContain('ABC-123');
    // 2.1：姓名不再重複顯示在頁內卡片，只在頁首的大標題（h1）。
    expect(header).not.toContain('王小明');
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

  it('「文件」分頁實作前先隱藏；網址帶 section=documents 時落回總覽（4.6）', async () => {
    const { component, harness } = await setup('/orders/b1?section=documents');
    expect(navButton(harness, 'documents')).toBeNull();
    const tabs = Array.from(el(harness).querySelectorAll('.order-detail__nav-item')).map((b) => b.getAttribute('data-section'));
    expect(tabs).toEqual(['overview', 'payments', 'contract', 'handover', 'cancellation', 'activity']);
    expect(component.activeSection()).toBe('overview');
    expect(navButton(harness, 'overview').classList).toContain('is-active');
  });

  it('「取消/退款」分頁交給分三段的分頁元件（4.6）', async () => {
    const { harness } = await setup('/orders/b1?section=cancellation');
    expect(el(harness).querySelector('app-order-cancellation-tab')).not.toBeNull();
  });

  it('找不到訂單時顯示空狀態', async () => {
    const { harness } = await setup('/orders/nope');
    expect(el(harness).textContent).toContain(ZH_TW.orderDetail.notFound);
  });
});

// 2.1：狀態 chip／急迫徽章改在頁首（appHeaderTitleExtra 登記到 HeaderTitleExtraSlot，由
// HeaderComponent 渲染），不在這個頁面元件自己的 fixture DOM 裡（跟 vehicles-page.component.spec.ts
// 對 HeaderToolbarSlot 內容的驗證方式一樣）。所以這裡驗證驅動 @if 顯示的判斷式本身，
// 以及點擊會呼叫的 selectSection 確實把分頁切過去；樣板的 (click) 只是呼叫它，不必重複驗證。
describe('OrderDetailPageComponent 標題旁的急迫狀態（與訂單列表同一套判斷）', () => {
  it('逾時未還：出租中且還車時間已過，isOverdueReturn() 成立；selectSection 能跳到交還車分頁', async () => {
    // makeBooking() 預設 endTime 是 2026-01-07（相對「現在」已過去），只要狀態是出租中就成立。
    const { component, harness } = await setup('/orders/b1', { bookings: [makeBooking({ status: 'in_progress' })] });
    expect(component['isOverdueReturn']()).toBe(true);

    component.selectSection('handover');
    await settle(harness);
    expect(component.activeSection()).toBe('handover');
  });

  it('退款待處理：hasRefundPending() 成立；selectSection 能跳到取消/退款分頁', async () => {
    const { component, harness } = await setup('/orders/b1', {
      bookings: [makeBooking({ status: 'cancelled' })],
      refunds: [{ id: 'r1', bookingId: 'b1', amount: 500, method: 'cash', status: 'pending', handledBy: '' }],
    });
    expect(component['hasRefundPending']()).toBe(true);

    component.selectSection('cancellation');
    await settle(harness);
    expect(component.activeSection()).toBe('cancellation');
  });

  it('業者復原處理中：hasUrgentOperatorRecovery() 成立', async () => {
    const { component } = await setup('/orders/b1', {
      operatorRecoveryCases: [
        {
          id: 'orc1',
          bookingId: 'b1',
          reason: 'vehicle_breakdown',
          discoveredAt: '',
          notifiedAt: '',
          status: 'in_progress',
          remedyAttempts: [],
          taxiReimbursements: [],
          goodwillCompensations: [],
          createdBy: '',
          createdAt: '',
          updatedAt: '',
        },
      ],
    });
    expect(component['hasUrgentOperatorRecovery']()).toBe(true);
  });

  it('一般訂單（無急迫狀態）三個判斷都不成立', async () => {
    const { component } = await setup('/orders/b1');
    expect(component['isOverdueReturn']()).toBe(false);
    expect(component['hasRefundPending']()).toBe(false);
    expect(component['hasUrgentOperatorRecovery']()).toBe(false);
  });
});

describe('OrderDetailPageComponent 頁首標題（2.1：麵包屑「訂單管理」› 大標題＝承租人姓名）', () => {
  it('登記到 HeaderTitleSlot：標題是承租人姓名、麵包屑指回訂單列表、backTo 帶 returnUrl', async () => {
    const { component } = await setup('/orders/b1');
    const slot = TestBed.inject(HeaderTitleSlot);

    expect(slot.entry()?.value).toEqual({
      title: '王小明',
      breadcrumbs: [{ label: ZH_TW.nav.bookings, route: '/bookings' }],
      backTo: component['returnUrl'],
    });
  });

  it('找不到會員時標題退回 em dash，不是空字串或例外', async () => {
    const { component } = await setup('/orders/b1', { bookings: [makeBooking({ memberId: 'no-such-member' })] });
    const slot = TestBed.inject(HeaderTitleSlot);
    expect(slot.entry()?.value.title).toBe('—');
    expect(component['member']()).toBeUndefined();
  });

  it('appHeaderTitleExtra 已登記模板（狀態 chip／急迫徽章的渲染位置）', async () => {
    await setup('/orders/b1');
    expect(TestBed.inject(HeaderTitleExtraSlot).template()).not.toBeNull();
  });

  it('頁面本身不再渲染 h1（頁面唯一的 h1 在頁首）', async () => {
    const { harness } = await setup('/orders/b1');
    expect(el(harness).querySelectorAll('h1')).toHaveLength(0);
  });
});

describe('OrderDetailPageComponent 總覽「費用」卡的已收／待收（與款項分頁同一套計算）', () => {
  it('有報價快照：已收＝已確認付款總額，待收＝報價合計−已收', async () => {
    const priceBreakdown = {
      dailyLines: [{ date: '2026-01-05', dayType: 'weekday' as const, price: 1000 }],
      rentalRaw: 1000,
      tierDiscountPercent: 0,
      tierDiscountAmount: 0,
      rentalSubtotal: 1000,
      partnerDiscountPercent: 0,
      partnerDiscount: 0,
      addOnLines: [],
      addOnSubtotal: 0,
      insuranceSubtotal: 0,
      couponDiscount: 0,
      total: 1000,
    };
    const { harness } = await setup('/orders/b1', {
      bookings: [makeBooking({ priceBreakdown })],
      payments: [{ id: 'p1', bookingId: 'b1', amount: 700, method: 'cash', purpose: 'deposit', status: 'confirmed', receivedAt: '2026-01-01T00:00:00.000Z', handledBy: 'staff' }],
    });
    const pricingCard = Array.from(el(harness).querySelectorAll('.order-detail__group')).find((g) =>
      g.querySelector('.order-detail__group-title')?.textContent?.includes(ZH_TW.orderDetail.groups.pricing),
    ) as HTMLElement;
    const text = pricingCard.textContent ?? '';
    expect(text).toContain(ZH_TW.orderDetail.netPaid);
    expect(text).toContain('700');
    expect(text).toContain(ZH_TW.orderDetail.balanceDue);
  });

  it('沒有報價快照時仍顯示已收（種子訂單 b9 情境：出租中＋逾時未還、已收 700）', async () => {
    const b9 = makeBooking({ id: 'b1', status: 'in_progress', priceBreakdown: undefined });
    const { harness } = await setup('/orders/b1', {
      bookings: [b9],
      payments: [{ id: 'p1', bookingId: 'b1', amount: 700, method: 'line_pay', purpose: 'balance', status: 'confirmed', receivedAt: '2026-01-01T00:00:00.000Z', handledBy: 'staff' }],
    });
    const pricingCard = Array.from(el(harness).querySelectorAll('.order-detail__group')).find((g) =>
      g.querySelector('.order-detail__group-title')?.textContent?.includes(ZH_TW.orderDetail.groups.pricing),
    ) as HTMLElement;
    const text = pricingCard.textContent ?? '';
    expect(text).toContain(ZH_TW.orderDetail.noQuote);
    expect(text).toContain(ZH_TW.orderDetail.netPaid);
    expect(text).toContain('700');
  });
});

describe('OrderDetailPageComponent 費用卡的溢收與沒有報價（前批驗收發現的顯示問題）', () => {
  const quote1000 = {
    dailyLines: [{ date: '2026-01-05', dayType: 'weekday' as const, price: 1000 }],
    rentalRaw: 1000,
    tierDiscountPercent: 0,
    tierDiscountAmount: 0,
    rentalSubtotal: 1000,
    partnerDiscountPercent: 0,
    partnerDiscount: 0,
    addOnLines: [],
    addOnSubtotal: 0,
    insuranceSubtotal: 0,
    couponDiscount: 0,
    total: 1000,
  };
  const paid = (amount: number): PaymentRecord => ({
    id: `p${amount}`, bookingId: 'b1', amount, method: 'cash', purpose: 'balance', status: 'confirmed',
    receivedAt: '2026-01-01T00:00:00.000Z', handledBy: 'staff',
  });

  function pricingCard(harness: RouterTestingHarness): HTMLElement {
    return Array.from(el(harness).querySelectorAll('.order-detail__group')).find((g) =>
      g.querySelector('.order-detail__group-title')?.textContent?.includes(ZH_TW.orderDetail.groups.pricing),
    ) as HTMLElement;
  }

  it('待收為負：改寫「溢收 NT$X」並用警示色，不顯示「−NT$」', async () => {
    const { harness } = await setup('/orders/b1', {
      bookings: [makeBooking({ priceBreakdown: quote1000 })],
      payments: [paid(1200)],
    });
    const card = pricingCard(harness);
    const balance = card.querySelector('.order-detail__balance') as HTMLElement;
    expect(balance.textContent?.trim()).toBe('NT$200');
    expect(balance.classList).toContain('is-overpaid');
    expect(balance.previousElementSibling?.textContent?.trim()).toBe(ZH_TW.orderDetail.overpaid);
    expect(card.textContent).not.toContain('−NT$');
  });

  it('待收為正：照舊顯示「待收」', async () => {
    const { harness } = await setup('/orders/b1', {
      bookings: [makeBooking({ priceBreakdown: quote1000 })],
      payments: [paid(300)],
    });
    const balance = pricingCard(harness).querySelector('.order-detail__balance') as HTMLElement;
    expect(balance.textContent?.trim()).toBe('NT$700');
    expect(balance.classList).not.toContain('is-overpaid');
    expect(balance.previousElementSibling?.textContent?.trim()).toBe(ZH_TW.orderDetail.balanceDue);
  });

  it('沒有報價快照（種子 b9：已收 700）：待收顯示「—」加說明，不再是「−NT$700」', async () => {
    const { harness } = await setup('/orders/b1', {
      bookings: [makeBooking({ status: 'in_progress', priceBreakdown: undefined })],
      payments: [paid(700)],
    });
    const card = pricingCard(harness);
    const balance = card.querySelector('.order-detail__balance') as HTMLElement;
    expect(balance.textContent).toContain('—');
    expect(balance.querySelector('.order-detail__balance-note')?.textContent?.trim()).toBe(ZH_TW.orderDetail.noQuoteBalance);
    expect(card.textContent).not.toContain('−NT$700');
    expect(card.textContent).not.toContain(ZH_TW.orderDetail.overpaid);
  });
});

describe('OrderDetailPageComponent 總覽的待補卡（4.1：與建單摘要欄同一套規則）', () => {
  const verifiedIdentity: IdentityDocument = {
    id: 'id1', memberId: 'm1', type: 'taiwan_id', documentNumber: 'A1', issuingCountry: 'TW',
    verification: { state: 'verified' }, version: 1, createdAt: '', updatedAt: '',
  };
  const verifiedLicense: DriverCredential = {
    id: 'dc1', memberId: 'm1', type: 'taiwan_license', documentNumber: 'TL-1', issuingCountry: 'TW',
    originalVehicleClassText: '普通小型車', standardizedVehicleClass: 'car',
    verification: { state: 'verified' }, reciprocityStatus: 'pending', version: 1, createdAt: '', updatedAt: '',
  };
  const signedContract = { id: 'cv1', bookingId: 'b1', version: 1, status: 'signed' } as ContractVersion;
  const depositPaid: PaymentRecord = {
    id: 'p1', bookingId: 'b1', amount: 500, method: 'cash', purpose: 'deposit', status: 'confirmed',
    receivedAt: '2026-01-01T00:00:00.000Z', handledBy: 'staff',
  };

  function card(harness: RouterTestingHarness): HTMLElement | null {
    return el(harness).querySelector('app-order-incomplete-card');
  }

  function item(harness: RouterTestingHarness, kind: string): HTMLButtonElement {
    return el(harness).querySelector(`.incomplete-card__item[data-kind="${kind}"]`) as HTMLButtonElement;
  }

  it('列出這筆訂單還缺的事，放在總覽最上方（在分組卡片之前）', async () => {
    const { harness } = await setup('/orders/b1');
    const cardEl = card(harness);
    expect(cardEl).not.toBeNull();
    const labels = Array.from(cardEl?.querySelectorAll('.incomplete-card__label') ?? []).map((l) => l.textContent?.trim());
    // 會員有 Email、沒有報價快照（算不出租金是否收足）；訂金 500 未收、沒有合約、沒有證件紀錄。
    expect(labels).toEqual([
      ZH_TW.bookingForm.incomplete.depositNotCollected,
      ZH_TW.bookingForm.incomplete.contractNotSigned,
      ZH_TW.bookingForm.incomplete.identityNotVerified,
      ZH_TW.bookingForm.incomplete.driverNotVerified,
    ]);
    const panel = el(harness).querySelector('.order-detail__panel') as HTMLElement;
    expect(panel.firstElementChild?.tagName.toLowerCase()).toBe('app-order-incomplete-card');
  });

  it('點款項／合約類的項目：切到那個分頁', async () => {
    const { harness, component, router } = await setup('/orders/b1');
    item(harness, 'depositNotCollected').click();
    await settle(harness);
    expect(component.activeSection()).toBe('payments');
    expect(router.url).toBe('/orders/b1?section=payments');

    navButton(harness, 'overview').click();
    await settle(harness);
    item(harness, 'contractNotSigned').click();
    await settle(harness);
    expect(component.activeSection()).toBe('contract');
  });

  it('點證件／駕駛資格／Email 類的項目：開承租人的會員資料（這些存在會員層，沒有對應的分頁）', async () => {
    const { harness, dialogOpen } = await setup('/orders/b1');
    item(harness, 'driverNotVerified').click();
    expect(dialogOpen).toHaveBeenCalledWith(MemberFormDialogComponent, expect.objectContaining({ data: member }));
  });

  it('都補齊了：整張卡不出現', async () => {
    const { harness } = await setup('/orders/b1', {
      payments: [depositPaid],
      contracts: [signedContract],
      identityDocuments: [verifiedIdentity],
      driverCredentials: [verifiedLicense],
    });
    expect(card(harness)).toBeNull();
  });

  it('補齊後即時更新：收了訂金，「訂金尚未收款」就從卡片消失', async () => {
    const { harness } = await setup('/orders/b1', {
      contracts: [signedContract],
      identityDocuments: [verifiedIdentity],
      driverCredentials: [verifiedLicense],
    });
    expect(item(harness, 'depositNotCollected')).not.toBeNull();

    TestBed.inject(PaymentStore).recordPayment({
      bookingId: 'b1',
      amount: 500,
      method: 'cash',
      purpose: 'deposit',
      status: 'confirmed',
      receivedAt: '2026-01-02T00:00:00.000Z',
      handledBy: 'staff',
    });
    await settle(harness);
    expect(card(harness)).toBeNull();
  });

  it('已取消、已完成的訂單不顯示待補', async () => {
    for (const status of ['cancelled', 'completed'] as const) {
      TestBed.resetTestingModule();
      const { harness } = await setup('/orders/b1', { bookings: [makeBooking({ status })] });
      expect(card(harness)).toBeNull();
    }
  });

  it('編輯中不顯示（總覽換成表單）', async () => {
    const { harness, component } = await setup('/orders/b1');
    component.startEdit();
    await settle(harness);
    expect(card(harness)).toBeNull();
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
    // 2.4：建單頁把報價明細移到摘要欄；詳情的編輯沒有摘要欄，費用區塊仍列出報價明細
    const quoteList = el(harness).querySelector('app-order-pricing-section .order-section__dl');
    expect(quoteList?.textContent).toContain(ZH_TW.bookingForm.quoteTotal);
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

    for (const s of ['payments', 'contract', 'handover', 'cancellation', 'activity']) {
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
    setPaymentDrafts(component.form(), [{ method: 'cash', amount: 100, purpose: 'deposit' }]);
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
