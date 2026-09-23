import { Component, DestroyRef, ElementRef, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatStepperModule, StepperOrientation } from '@angular/material/stepper';
import { map } from 'rxjs';
import { SignatureAsset, openContractSigningDialog } from '@car-rental/contract-signing';
import { ContractSnapshot, Vehicle } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { provideHeaderTitle } from '../../../layout/header/header-title';
import { confirm } from '../../../shared/dialogs/confirm-dialog.component';
import {
  OrderFormInitial,
  connectOrderFormBehaviors,
  createOrderForm,
  orderFormValue,
} from '../order-form/order-form';
import { ORDER_FORM_DATA } from '../order-form/order-form-data';
import {
  OrderContractSigning,
  createOrderFormDerived,
  orderFormProblems,
  orderRequirements,
} from '../order-form/order-form-derived';
import { incompleteFactsFromForm, orderIncompleteItems } from '../incomplete/order-incomplete';
import { buildContractSnapshot, sameContractTerms } from '../order-form/contract-snapshot';
import { ORDER_SUBMIT_GATEWAY, OrderSubmitInput } from '../order-form/order-submit-gateway';
import { OrderRentalSectionComponent } from '../sections/order-rental-section.component';
import { OrderRenterSectionComponent } from '../sections/order-renter-section.component';
import { OrderDriverSectionComponent } from '../sections/order-driver-section.component';
import { OrderPricingSectionComponent } from '../sections/order-pricing-section.component';
import { OrderPaymentDraftsSectionComponent } from '../sections/order-payment-drafts-section.component';
import { OrderContractSectionComponent } from '../sections/order-contract-section.component';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';
import { buildOrderSummary } from '../order-summary/order-summary';
import { LeaveConfirmable } from '../navigation/confirm-leave.guard';

/**
 * 4 個步驟：租期與車輛 → 承租人與駕駛資格 → 費用與付款 → 合約。
 * 原本的第 5 步「確認建立」拿掉了（2.2）：它的待補清單移進左側的訂單摘要欄，每一步都看得到。
 */
export const ORDER_CREATE_STEPS = ['vehicle', 'renter', 'payment', 'contract'] as const;
export type OrderCreateStep = (typeof ORDER_CREATE_STEPS)[number];

/** 直接輸入網址進來、沒有站內上一頁時，取消回到這裡。 */
const FALLBACK_RETURN_URL = '/bookings';
/**
 * 步驟導覽改為直式的斷點。橫式需要約 600px 內容寬才放得下 4 個步驟標籤，
 * 而 900px 以上側欄會常駐佔去約 330px，因此在 1024px 以下就改用直式。
 * 與 layout/_fill-page.scss 的滿版條件是同一條寬度界線：直式時一律走自然排版。
 */
const NARROW_QUERY = '(max-width: 1023.98px)';

/** 客人在建立前預先簽署的結果，連同簽署當下的預覽快照一起暫存。 */
interface PendingSignature {
  asset: SignatureAsset;
  snapshot: ContractSnapshot;
}

/**
 * 從 query params 讀出預填值（例如儀表板快速建立：`?vehicleId=v1&start=<ISO>&end=<ISO>`）。
 * 不存在的車輛與無法解析的時間一律忽略。
 */
export function orderInitialFromQuery(params: ParamMap, vehicles: Vehicle[]): OrderFormInitial {
  const initial: OrderFormInitial = {};
  const vehicleId = params.get('vehicleId');
  if (vehicleId && vehicles.some((v) => v.id === vehicleId)) initial.vehicleId = vehicleId;
  const iso = (key: string) => {
    const raw = params.get(key);
    if (!raw) return undefined;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  };
  const start = iso('start');
  const end = iso('end');
  if (start) initial.startTime = start;
  if (end) initial.endTime = end;
  return initial;
}

/**
 * `/orders/new` 建立訂單頁：非線性 mat-stepper 串起各表單區塊，左側（窄版為頂端）是每一步都在的訂單摘要。
 * 「建立訂單」在每一步都可以按；只有訂單底線與既有完整性規則會擋送出，其餘成為待補項目。
 * 步驟錯誤只在按下「建立訂單」之後才亮，之後隨修正即時消失。
 *
 * 版面（2.2）：路由標記為滿版頁（orders.routes.ts），卡片撐滿頁首與頁尾之間的高度，
 * 步驟內容自己捲動、操作列釘在卡片底，換步驟時操作列不會跳動。
 */
@Component({
  selector: 'app-order-create-page',
  imports: [
    MatButtonModule,
    MatStepperModule,
    OrderRentalSectionComponent,
    OrderRenterSectionComponent,
    OrderDriverSectionComponent,
    OrderPricingSectionComponent,
    OrderPaymentDraftsSectionComponent,
    OrderContractSectionComponent,
    OrderSummaryComponent,
  ],
  templateUrl: './order-create-page.component.html',
  styleUrl: './order-create-page.component.scss',
  host: { '(window:beforeunload)': 'onBeforeUnload($event)' },
})
export class OrderCreatePageComponent implements LeaveConfirmable {
  protected readonly t = ZH_TW;
  protected readonly steps = ORDER_CREATE_STEPS;

  private readonly data = inject(ORDER_FORM_DATA);
  private readonly gateway = inject(ORDER_SUBMIT_GATEWAY);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** 來源頁：建構時導覽仍在進行中，取它的上一個導覽；沒有（直接輸入網址）就回訂單列表。 */
  private readonly returnUrl = (() => {
    const previous = this.router.currentNavigation()?.previousNavigation?.finalUrl;
    return previous ? this.router.serializeUrl(previous) : FALLBACK_RETURN_URL;
  })();

  readonly form = createOrderForm(orderInitialFromQuery(this.route.snapshot.queryParamMap, this.data.vehicles()));
  private readonly value = orderFormValue(this.form);
  protected readonly derived = createOrderFormDerived(this.value, this.data);

  readonly selectedIndex = signal(0);
  /** 按過「建立訂單」之後才讓步驟標題顯示錯誤。 */
  readonly submitAttempted = signal(false);
  readonly submitting = signal(false);
  readonly error = signal('');
  /** 已確認放棄或已建立成功：之後的導頁不必再經過離開確認。 */
  private leaveApproved = false;

  protected readonly orientation = toSignal(
    inject(BreakpointObserver)
      .observe(NARROW_QUERY)
      .pipe(map((r): StepperOrientation => (r.matches ? 'vertical' : 'horizontal'))),
    { initialValue: 'horizontal' as StepperOrientation },
  );

  private readonly problems = computed(() => orderFormProblems(this.value(), this.derived));
  readonly stepProblems = computed<Record<OrderCreateStep, string[]>>(() => {
    const p = this.problems();
    return { vehicle: p.rental, renter: p.renter, payment: p.pricing, contract: [] };
  });
  /** 擋住建立的問題總數（「還有 N 項待修正」的 N）。 */
  readonly problemCount = computed(() =>
    this.steps.reduce((sum, step) => sum + this.stepProblems()[step].length, 0),
  );
  /** 第一個有問題的步驟；沒有問題時為 -1。 */
  private readonly firstProblemStep = computed(() => this.steps.findIndex((s) => this.stepProblems()[s].length > 0));

  /** 「建立訂單需要」：與擋送出的檢查同一套規則（order-form-derived.ts 的 orderRequirements）。 */
  private readonly requirements = computed(() => orderRequirements(this.value(), this.derived));

  // ---- 合約預簽 ----
  private readonly pendingSignature = signal<PendingSignature | null>(null);

  /** 用目前表單內容組出的合約預覽快照；與正式送出共用同一個 buildContractSnapshot。 */
  readonly previewSnapshot = computed<ContractSnapshot | undefined>(() => {
    const vehicle = this.derived.vehicle();
    const quote = this.derived.quote();
    if (!vehicle || !quote) return undefined;
    const v = this.value();
    return buildContractSnapshot(vehicle, quote, v.renter.memberId ?? '', v);
  });

  /** 簽過後若改了影響合約條款的欄位，狀態變成「需重新簽署」。 */
  readonly contractSigning = computed<OrderContractSigning>(() => {
    const pending = this.pendingSignature();
    if (!pending) return 'unsigned';
    const preview = this.previewSnapshot();
    return preview && sameContractTerms(preview, pending.snapshot) ? 'signed' : 'needs_resign';
  });
  protected readonly signatureUrl = computed(() => this.pendingSignature()?.asset.url);

  /**
   * 建立後待補：與訂單詳情、訂單列表同一套規則（incomplete/order-incomplete.ts），這裡吃表單值；
   * 選了既有會員時，證件與駕駛資格要看他已有的紀錄。
   */
  readonly incompleteItems = computed(() => {
    const value = this.value();
    const memberId = value.renter.memberId;
    return orderIncompleteItems(
      incompleteFactsFromForm({
        value,
        quoteTotal: this.derived.quote()?.total,
        contract: this.contractSigning(),
        ...(memberId
          ? {
              memberRecords: {
                identityDocuments: this.data.identityDocumentsOf(memberId),
                driverCredentials: this.data.driverCredentialsOf(memberId),
              },
            }
          : {}),
      }),
    ).map((item) => item.label);
  });

  /** 左側訂單摘要欄的內容。 */
  readonly summary = computed(() =>
    buildOrderSummary({
      value: this.value(),
      vehicle: this.derived.vehicle(),
      quote: this.derived.quote(),
      requirements: this.requirements(),
      incompleteItems: this.incompleteItems(),
    }),
  );

  /** 操作列的缺項提示「還缺：承租人」；「建立訂單需要」都齊了就是空字串（不顯示）。 */
  readonly missingHint = computed(() => {
    const s = this.t.orderSummary;
    const missing = this.summary().missing.map((group) => s.requirementLabels[group]);
    return missing.length > 0 ? `${s.missingPrefix}${missing.join(s.listSeparator)}` : '';
  });

  constructor() {
    connectOrderFormBehaviors(this.form, this.data, { autoDeposit: true, destroyRef: inject(DestroyRef) });
    // 2.1：頁首麵包屑「訂單管理」（可點回列表）› 大標題「新增訂單」，取代頁內原本自己的標題。
    provideHeaderTitle(() => ({
      title: this.t.bookingForm.title,
      breadcrumbs: [{ label: this.t.nav.bookings, route: '/bookings' }],
    }));
  }

  stepHasError(step: OrderCreateStep): boolean {
    return this.submitAttempted() && this.stepProblems()[step].length > 0;
  }

  protected stepErrorMessage(step: OrderCreateStep): string {
    return this.stepProblems()[step].join('；');
  }

  /** 按過「建立訂單」且仍有問題時，操作列顯示一行「還有 N 項待修正」（點了跳到第一個有問題的步驟）。 */
  protected readonly showProblems = computed(() => this.submitAttempted() && this.problemCount() > 0);

  next(): void {
    this.selectedIndex.update((i) => Math.min(i + 1, this.steps.length - 1));
  }

  prev(): void {
    this.selectedIndex.update((i) => Math.max(i - 1, 0));
  }

  /** 「還有 N 項待修正」：跳到第一個有問題的步驟。 */
  goToFirstProblem(): void {
    const index = this.firstProblemStep();
    if (index >= 0) this.selectedIndex.set(index);
  }

  /** 換步驟（點步驟標題、上一步／下一步、跳到有問題的步驟都會經過這裡）。 */
  protected onStepChange(index: number): void {
    this.selectedIndex.set(index);
    // 滿版版面下，步驟內容由 mat-stepper 內部的容器自己捲動；換步驟時回到頂端，不沿用上一步的捲動位置。
    const content = this.host.nativeElement.querySelector('.mat-horizontal-content-container');
    if (content) content.scrollTop = 0;
  }

  /** 開啟共用簽署 dialog，讓客人檢視以目前表單內容組出的合約並簽名；確認後暫存簽名與當下快照。 */
  openSigning(): void {
    const snapshot = this.previewSnapshot();
    if (!snapshot) return;
    openContractSigningDialog(this.dialog, {
      snapshot,
      needsResign: this.contractSigning() === 'needs_resign',
    }).subscribe((asset) => {
      if (asset) this.pendingSignature.set({ asset, snapshot });
    });
  }

  async submit(): Promise<void> {
    if (this.submitting()) return;
    this.submitAttempted.set(true);
    this.error.set('');
    this.form.markAllAsTouched();

    if (this.firstProblemStep() >= 0) {
      this.goToFirstProblem();
      return;
    }

    const pending = this.pendingSignature();
    const input: OrderSubmitInput = {
      value: this.form.getRawValue(),
      // 需重新簽署時不帶舊簽名；gateway 端也會再比對一次條款。
      ...(pending && this.contractSigning() === 'signed'
        ? { presignature: { assetId: pending.asset.assetId, snapshot: pending.snapshot } }
        : {}),
    };

    this.submitting.set(true);
    try {
      const bookingId = await this.gateway.create(input);
      this.navigateToCreatedOrder(bookingId);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.submitting.set(false);
    }
  }

  private hasUnsavedChanges(): boolean {
    return this.form.dirty || !!this.pendingSignature();
  }

  /** 離開確認（confirmLeaveGuard）：填過內容或已預簽、且尚未確認放棄時才擋。 */
  unsavedChangesMessage(): string | null {
    return !this.leaveApproved && this.hasUnsavedChanges() ? this.t.orderForm.discardConfirm : null;
  }

  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.unsavedChangesMessage()) event.preventDefault();
  }

  async cancel(): Promise<void> {
    if (this.hasUnsavedChanges() && !(await confirm(this.dialog, this.t.orderForm.discardConfirm))) return;
    // 這裡已經問過了，之後的導頁不要再被離開確認擋一次。
    this.leaveApproved = true;
    await this.router.navigateByUrl(this.returnUrl);
  }

  /** 建立成功後前往該訂單的訂單詳情。 */
  private navigateToCreatedOrder(bookingId: string): void {
    this.leaveApproved = true;
    void this.router.navigate(['/orders', bookingId]);
  }
}
