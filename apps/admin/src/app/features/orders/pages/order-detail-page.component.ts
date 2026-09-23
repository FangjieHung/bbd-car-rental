import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, distinctUntilChanged, map, skip } from 'rxjs';
import { branchName, contractSigningState, needsDispatch } from '@car-rental/domain';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { fmtDateTime } from '../../../core/date-utils';
import { provideHeaderTitle } from '../../../layout/header/header-title';
import { HeaderTitleExtraDirective } from '../../../layout/header/header-title-extra-slot';
import { BookingStore } from '../../../stores/booking/booking.store';
import { VehicleStore } from '../../../stores/vehicle/vehicle.store';
import { MemberStore } from '../../../stores/member/member.store';
import { ContractStore } from '../../../stores/contract/contract.store';
import { PaymentStore } from '../../../stores/payment/payment.store';
import { OperatorRecoveryStore } from '../../../stores/operator-recovery/operator-recovery.store';
import { StatusChipComponent } from '../../../shared/chips/status-chip.component';
import { BOOKING_STATUS_KEY } from '../../../shared/chips/booking-status-key';
import { TwdPipe } from '../../../shared/pipes/twd.pipe';
import {
  hasRefundPending,
  hasUrgentOperatorRecovery,
  isOverdueReturn,
} from '../../bookings/booking-urgency';
import { PaymentPanelComponent } from '../../bookings/components/payment-panel.component';
import { ContractPanelComponent } from '../../bookings/components/contract-panel.component';
import { HandoverPanelComponent } from '../../bookings/components/handover-panel.component';
import { CancellationPanelComponent } from '../../bookings/components/cancellation-panel.component';
import { CustomerCreditPanelComponent } from '../../bookings/components/customer-credit-panel.component';
import { OperatorRecoveryPanelComponent } from '../../bookings/components/operator-recovery-panel.component';
import { ActivityTimelineComponent } from '../../bookings/components/activity-timeline.component';
import { MemberFormDialogComponent } from '../../bookings/dialogs/member-form-dialog.component';
import { OrderIncompleteCardComponent } from '../detail/order-incomplete-card.component';
import { OrderIncompleteItem } from '../incomplete/order-incomplete';
import { OrderIncompleteService } from '../incomplete/order-incomplete.service';
import {
  OrderForm,
  connectOrderFormBehaviors,
  createOrderForm,
  orderFormInitialFromBooking,
  orderFormValue,
} from '../order-form/order-form';
import { ORDER_FORM_DATA } from '../order-form/order-form-data';
import { OrderFormContext, createOrderFormDerived, orderFormProblems } from '../order-form/order-form-derived';
import { ORDER_SUBMIT_GATEWAY } from '../order-form/order-submit-gateway';
import { OrderRentalSectionComponent } from '../sections/order-rental-section.component';
import { OrderRenterSectionComponent } from '../sections/order-renter-section.component';
import { OrderPricingSectionComponent } from '../sections/order-pricing-section.component';
import { LeaveConfirmable } from '../navigation/confirm-leave.guard';
import {
  DEFAULT_ORDER_DETAIL_SECTION,
  ORDER_DETAIL_SECTIONS,
  OrderDetailSection,
  parseOrderDetailSection,
} from '../navigation/order-detail-sections';
import { ORDER_DETAIL_EDIT_PARAM, ORDER_DETAIL_SECTION_PARAM } from '../navigation/order-detail-navigation';

/** 直接輸入網址進來、或上一頁是建立訂單頁時，返回回到這裡。 */
const FALLBACK_RETURN_URL = '/bookings';

/**
 * `/orders/:id` 訂單詳情：頁首是訂單識別資訊，下方七個分頁，目前分頁以 `?section=` 表示（可分享、重新整理後回到同一分頁）。
 *
 * 「編輯訂單」只作用在總覽：預設唯讀，按「編輯」後總覽在同一頁切換成表單（租期與車輛／承租人／費用三個可重用區塊），
 * 明確按「儲存」才送出，「取消」丟棄所有改動。編輯中其他分頁停用，讓儲存範圍清楚；
 * 有未儲存改動時離開頁面由 confirmLeaveGuard 詢問。收款、上傳文件、簽約、交還車、取消都是各分頁自己的作業，不屬於編輯訂單。
 */
@Component({
  selector: 'app-order-detail-page',
  imports: [
    MatButtonModule,
    StatusChipComponent,
    HeaderTitleExtraDirective,
    OrderRentalSectionComponent,
    OrderRenterSectionComponent,
    OrderPricingSectionComponent,
    PaymentPanelComponent,
    ContractPanelComponent,
    HandoverPanelComponent,
    CancellationPanelComponent,
    CustomerCreditPanelComponent,
    OperatorRecoveryPanelComponent,
    ActivityTimelineComponent,
    OrderIncompleteCardComponent,
    TwdPipe,
  ],
  templateUrl: './order-detail-page.component.html',
  styleUrls: ['../../../app.scss', './order-detail-page.component.scss'],
  host: { '(window:beforeunload)': 'onBeforeUnload($event)' },
})
export class OrderDetailPageComponent implements LeaveConfirmable {
  protected readonly t = ZH_TW;
  protected readonly sections = ORDER_DETAIL_SECTIONS;
  protected readonly fmt = fmtDateTime;
  protected readonly branchName = branchName;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingStore = inject(BookingStore);
  private readonly vehicleStore = inject(VehicleStore);
  private readonly memberStore = inject(MemberStore);
  private readonly contractStore = inject(ContractStore);
  private readonly paymentStore = inject(PaymentStore);
  private readonly operatorRecoveryStore = inject(OperatorRecoveryStore);
  private readonly data = inject(ORDER_FORM_DATA);
  private readonly gateway = inject(ORDER_SUBMIT_GATEWAY);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly incomplete = inject(OrderIncompleteService);

  /** 來源頁：建構時導覽仍在進行中，取它的上一個導覽；沒有、或來自訂單頁本身時回訂單列表。 */
  protected readonly returnUrl = (() => {
    const previous = this.router.currentNavigation()?.previousNavigation?.finalUrl;
    const url = previous ? this.router.serializeUrl(previous) : '';
    return url && !url.startsWith('/orders') ? url : FALLBACK_RETURN_URL;
  })();

  readonly bookingId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), {
    initialValue: this.route.snapshot.paramMap.get('id') ?? '',
  });
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly urlSection = computed(() =>
    parseOrderDetailSection(this.queryParamMap().get(ORDER_DETAIL_SECTION_PARAM)),
  );

  readonly editing = signal(false);
  /** 編輯中一律停在總覽（其他分頁停用）；否則以網址為準。 */
  readonly activeSection = computed<OrderDetailSection>(() =>
    this.editing() ? DEFAULT_ORDER_DETAIL_SECTION : this.urlSection(),
  );

  readonly booking = computed(() => this.bookingStore.bookings().find((b) => b.id === this.bookingId()));
  protected readonly vehicle = computed(() => {
    const b = this.booking();
    return b ? this.vehicleStore.vehicles().find((v) => v.id === b.vehicleId) : undefined;
  });
  protected readonly member = computed(() => {
    const b = this.booking();
    return b ? this.memberStore.members().find((m) => m.id === b.memberId) : undefined;
  });
  protected readonly statusKey = computed(() => {
    const b = this.booking();
    return b ? BOOKING_STATUS_KEY[b.status] : 'archived';
  });
  // 急迫狀態：與訂單列表同一套判斷（booking-urgency.ts），標題旁顯示、點了跳到對應分頁。
  protected readonly isOverdueReturn = computed(() => {
    const b = this.booking();
    return !!b && isOverdueReturn(b);
  });
  protected readonly hasRefundPending = computed(() => {
    const b = this.booking();
    return !!b && hasRefundPending(b, this.paymentStore);
  });
  protected readonly hasUrgentOperatorRecovery = computed(() => {
    const b = this.booking();
    return !!b && hasUrgentOperatorRecovery(b, this.operatorRecoveryStore);
  });
  /** 費用卡「已收」「待收」：與款項分頁同一套計算（PaymentStore.summaryFor）；沒有報價快照時仍算得出已收。 */
  protected readonly paymentSummary = computed(() => {
    const b = this.booking();
    return b ? this.paymentStore.summaryFor(b.id) : undefined;
  });
  /**
   * 4.1：總覽最上方的待補卡——與建立訂單摘要欄的「建立後待補」同一套規則，改吃這筆訂單的實際紀錄
   * （款項、合約版本、承租人的證件）。已取消、已完成的訂單沒有待補（空陣列，卡片不出現）。
   */
  protected readonly incompleteItems = computed(() => {
    const b = this.booking();
    return b ? this.incomplete.itemsFor(b) : [];
  });
  /** 沿用既有編輯入口的條件：只有尚未取車（已預訂）的訂單可以編輯。 */
  readonly canEdit = computed(() => this.booking()?.status === 'reserved');
  /** 需調度：取車據點與車輛所在據點不同；只有尚未取車的訂單才有意義（與行事曆一致）。 */
  protected readonly needsDispatch = computed(() => {
    const b = this.booking();
    return b?.status === 'reserved' && needsDispatch(this.vehicle()?.location, b.pickupLocation);
  });
  protected readonly dispatchNote = computed(() => {
    const b = this.booking();
    if (!b) return '';
    const w = this.t.dispatch.workList;
    return `${w.dispatchNeededPrefix}${branchName(this.vehicle()?.location)}${w.dispatchNeededMiddle}${branchName(b.pickupLocation)}`;
  });

  // ---- 編輯訂單 ----
  /** 目前的編輯表單；每次按「編輯」都從訂單重新帶入一份新的，取消時整份丟棄。 */
  readonly form = signal<OrderForm>(createOrderForm());
  private readonly formValue = orderFormValue(this.form);
  protected readonly editContext = computed<OrderFormContext>(() => ({
    editingBookingId: this.bookingId(),
    originalPriceBreakdown: this.booking()?.priceBreakdown,
  }));
  protected readonly derived = createOrderFormDerived(this.formValue, this.data, () => this.editContext());
  readonly saving = signal(false);
  readonly error = signal('');
  private behaviors?: Subscription;

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.behaviors?.unsubscribe());

    // 2.1：頁首麵包屑「訂單管理」› 大標題＝承租人姓名；「← 返回」交給頁首（回 returnUrl，
    // 可能是來源頁而非固定回列表，跟麵包屑的上一層不一定相同，所以另外帶 backTo）。
    // 狀態 chip／急迫徽章改在 template 用 appHeaderTitleExtra 登記，渲染在頁首標題旁。
    provideHeaderTitle(() => ({
      title: this.member()?.name ?? '—',
      breadcrumbs: [{ label: this.t.nav.bookings, route: '/bookings' }],
      backTo: this.returnUrl,
    }));

    // 同一個元件換到另一筆訂單（/orders/a → /orders/b）時，離開編輯狀態。
    this.route.paramMap
      .pipe(
        map((p) => p.get('id')),
        distinctUntilChanged(),
        skip(1),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(() => this.exitEdit());

    // `?edit=1`：直接進入總覽的編輯狀態，接著把參數從網址拿掉（不留瀏覽紀錄）。
    this.route.queryParamMap.pipe(takeUntilDestroyed(destroyRef)).subscribe((params) => {
      if (!params.has(ORDER_DETAIL_EDIT_PARAM)) return;
      this.startEdit();
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { [ORDER_DETAIL_EDIT_PARAM]: null, [ORDER_DETAIL_SECTION_PARAM]: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  }

  /** 切換分頁：更新網址（replaceUrl，不為每次切換塞一筆瀏覽紀錄）。編輯中只能停在總覽。 */
  selectSection(section: OrderDetailSection): void {
    if (this.editing() && section !== DEFAULT_ORDER_DETAIL_SECTION) return;
    if (section === this.urlSection()) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [ORDER_DETAIL_SECTION_PARAM]: section === DEFAULT_ORDER_DETAIL_SECTION ? null : section },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /** 點了待補卡的某一項：款項、合約切到那個分頁；Email、證件、駕駛資格存在會員層，開承租人的會員資料。 */
  protected onIncompleteSelected(item: OrderIncompleteItem): void {
    if (item.target === 'renter') {
      this.openRenterDialog();
      return;
    }
    this.selectSection(item.target);
  }

  /** 承租人的會員資料（與會員頁同一個視窗：基本資料、證件、駕駛資格）；存檔後待補卡會跟著更新。 */
  protected openRenterDialog(): void {
    const member = this.member();
    if (!member) return;
    this.dialog.open(MemberFormDialogComponent, { data: member, width: '640px', maxWidth: '92vw' });
  }

  isSectionDisabled(section: OrderDetailSection): boolean {
    return this.editing() && section !== DEFAULT_ORDER_DETAIL_SECTION;
  }

  startEdit(): void {
    const booking = this.booking();
    if (!booking || !this.canEdit() || this.editing()) return;
    const form = createOrderForm(
      orderFormInitialFromBooking(booking, { vehicle: this.vehicle(), member: this.member() }),
    );
    this.behaviors?.unsubscribe();
    // 編輯既有訂單：訂金維持原值，不跟著車型上限自動改。
    this.behaviors = connectOrderFormBehaviors(form, this.data, { autoDeposit: false });
    this.form.set(form);
    this.error.set('');
    this.editing.set(true);
    this.selectSection(DEFAULT_ORDER_DETAIL_SECTION);
  }

  /** 取消：丟棄所有改動並回到唯讀（下次按編輯會從訂單重新帶入）。 */
  cancelEdit(): void {
    this.exitEdit();
  }

  private exitEdit(): void {
    this.behaviors?.unsubscribe();
    this.behaviors = undefined;
    this.editing.set(false);
    this.saving.set(false);
    this.error.set('');
  }

  /** 送出前的檢查，與建立訂單相同（訂單底線與既有的完整性規則）。 */
  private currentProblems(): string[] {
    const value = this.form().getRawValue();
    // 以當下的表單值重新計算，不依賴畫面上的變更偵測是否已跑過。
    const derived = createOrderFormDerived(
      computed(() => value),
      this.data,
      () => this.editContext(),
    );
    const p = orderFormProblems(value, derived);
    return [...p.rental, ...p.renter, ...p.pricing];
  }

  async save(): Promise<void> {
    const booking = this.booking();
    if (!booking || !this.editing() || this.saving()) return;
    this.form().markAllAsTouched();
    this.error.set('');

    const problems = this.currentProblems();
    if (problems.length > 0) {
      this.error.set(problems.join('；'));
      return;
    }

    const latestBefore = this.contractStore.latestFor(booking.id)?.id;
    // 編輯訂單不登記款項（收款在款項分頁）：送出的款項草稿一律為空。
    const value = this.form().getRawValue();
    const input = { value: { ...value, payments: { ...value.payments, drafts: [] } } };

    this.saving.set(true);
    try {
      await this.gateway.update(booking.id, input);
    } catch (e) {
      this.error.set((e as Error).message);
      this.saving.set(false);
      return;
    }

    const versions = this.contractStore.versionsFor(booking.id);
    const latestAfter = versions.at(-1)?.id;
    const needsResign = latestAfter !== latestBefore && contractSigningState(versions) === 'needs_resign';
    this.exitEdit();

    if (needsResign) {
      this.snackBar
        .open(this.t.orderDetail.needsResign, this.t.orderDetail.goToContract, { duration: 10000 })
        .onAction()
        .subscribe(() => this.selectSection('contract'));
    } else {
      this.snackBar.open(this.t.orderDetail.saved, undefined, { duration: 3000 });
    }
  }

  // ---- 離開確認 ----
  unsavedChangesMessage(): string | null {
    return this.editing() && this.form().dirty ? this.t.orderDetail.discardChangesConfirm : null;
  }

  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.unsavedChangesMessage()) event.preventDefault();
  }
}
