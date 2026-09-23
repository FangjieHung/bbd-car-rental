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
import { setPaymentDrafts } from '../order-form/order-form';
import { AdminOrderFormData } from '../data/admin-order-form-data';
import { createOrderRepos, makeVehicle } from '../testing';
import { ORDER_CREATE_STEPS, OrderCreatePageComponent } from './order-create-page.component';
import { ORDER_ROUTES } from '../orders.routes';
import { confirmLeaveGuard } from '../navigation/confirm-leave.guard';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { HeaderTitleSlot } from '../../../layout/header/header-title';
import { FILL_PAGE_DATA_KEY } from '../../../layout/fill-page';

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

function el(fixture: ReturnType<typeof setup>['fixture']): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function problemsLine(fixture: ReturnType<typeof setup>['fixture']): HTMLElement | null {
  return el(fixture).querySelector('.order-create__problems');
}

/** 操作列目前看得到的按鈕（依畫面順序）。 */
function actionButtons(fixture: ReturnType<typeof setup>['fixture']): string[] {
  return Array.from(el(fixture).querySelectorAll('.order-create__actions > button')).map(
    (b) => b.textContent?.trim() ?? '',
  );
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
  it('四個步驟依序為租期與車輛→承租人與駕駛資格→費用與付款→合約（2.2 拿掉第 5 步「確認建立」）', () => {
    const { fixture } = setup();
    expect(ORDER_CREATE_STEPS).toEqual(['vehicle', 'renter', 'payment', 'contract']);
    expect(steps(fixture)).toHaveLength(4);
    expect(steps(fixture).map((s) => s.label)).toEqual([
      ZH_TW.bookingForm.steps['vehicle'],
      ZH_TW.bookingForm.steps['renter'],
      ZH_TW.bookingForm.steps['payment'],
      ZH_TW.bookingForm.steps['contract'],
    ]);
  });

  it('按下建立前，所有步驟 hasError 都是 false（保持中性）', () => {
    const { fixture } = setup();
    expect(steps(fixture).map((s) => s.hasError)).toEqual([false, false, false, false]);
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
    expect(steps(fixture).map((s) => s.hasError)).toEqual([true, true, false, false]);
    expect(component.selectedIndex()).toBe(0);
    expect(component.form.controls.renter.controls.name.touched).toBe(true);
    // 底部紅框清單改成一行「還有 N 項待修正」：空白表單＝車輛與租期、據點、承租人三項
    expect(problemsLine(fixture)?.textContent).toContain(`${ZH_TW.orderSummary.problemsPrefix}3${ZH_TW.orderSummary.problemsSuffix}`);
    expect(fixture.nativeElement.querySelector('.order-create__errors')).toBeNull();
  });

  it('「還有 N 項待修正」只在按過建立之後出現；點了跳到第一個有問題的步驟；全部修好就消失', async () => {
    const { fixture, component } = setup();
    fillBaseline(component);
    component.form.controls.renter.patchValue({ name: '' });
    fixture.detectChanges();
    expect(problemsLine(fixture)).toBeNull();

    await component.submit();
    component.selectedIndex.set(3);
    fixture.detectChanges();
    expect(problemsLine(fixture)?.textContent).toContain(`${ZH_TW.orderSummary.problemsPrefix}1${ZH_TW.orderSummary.problemsSuffix}`);

    (problemsLine(fixture)?.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.selectedIndex()).toBe(1);

    component.form.controls.renter.patchValue({ name: '新客人' });
    fixture.detectChanges();
    expect(problemsLine(fixture)).toBeNull();
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
    expect(steps(fixture).map((s) => s.hasError)).toEqual([false, true, false, false]);

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

describe('OrderCreatePageComponent 底部操作列（2.2）', () => {
  const t = ZH_TW;

  it('左「取消」；右依序「上一步」（第一步不顯示）、「下一步」（最後一步不顯示）、「建立訂單」', () => {
    const { fixture, component } = setup();
    const expected = [
      [t.common.cancel, t.bookingForm.next, t.bookingForm.submit],
      [t.common.cancel, t.bookingForm.prev, t.bookingForm.next, t.bookingForm.submit],
      [t.common.cancel, t.bookingForm.prev, t.bookingForm.next, t.bookingForm.submit],
      [t.common.cancel, t.bookingForm.prev, t.bookingForm.submit],
    ];
    for (let i = 0; i < ORDER_CREATE_STEPS.length; i++) {
      component.selectedIndex.set(i);
      fixture.detectChanges();
      expect(actionButtons(fixture)).toEqual(expected[i]);
    }
  });

  it('「建立訂單」是操作列唯一的實心主按鈕', () => {
    const { fixture } = setup();
    const flat = el(fixture).querySelectorAll('.order-create__actions .mat-mdc-unelevated-button');
    expect(flat).toHaveLength(1);
    expect(flat[0].classList.contains('order-create__submit')).toBe(true);
  });

  it('上一步／下一步切換步驟', () => {
    const { fixture, component } = setup();
    (el(fixture).querySelector('.order-create__next') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.selectedIndex()).toBe(1);
    (el(fixture).querySelector('.order-create__prev') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.selectedIndex()).toBe(0);
  });

  it('缺項提示依「建立訂單需要」列出還沒填的項目，齊了就不顯示', () => {
    const { fixture, component } = setup();
    const missing = () => el(fixture).querySelector('.order-create__missing')?.textContent?.trim() ?? null;
    const labels = t.orderSummary.requirementLabels;
    expect(missing()).toBe(
      `${t.orderSummary.missingPrefix}${[labels['vehicle'], labels['period'], labels['branches'], labels['renter']].join(t.orderSummary.listSeparator)}`,
    );

    // 選車後取／還車據點自動帶入車輛所在據點
    component.form.controls.rental.patchValue({
      vehicleId: 'v1',
      startLocal: '2026-01-05T09:00',
      endLocal: '2026-01-07T09:00',
    });
    fixture.detectChanges();
    expect(missing()).toBe(`${t.orderSummary.missingPrefix}${labels['renter']}`);

    component.form.controls.renter.patchValue({ name: '新客人', phone: '0900000000' });
    fixture.detectChanges();
    expect(missing()).toBeNull();
  });
});

describe('OrderCreatePageComponent 訂單摘要欄（2.2）', () => {
  const t = ZH_TW;
  const summaryEl = (fixture: ReturnType<typeof setup>['fixture']) =>
    el(fixture).querySelector('app-order-summary') as HTMLElement;

  it('每一步都看得到訂單摘要', () => {
    const { fixture, component } = setup();
    for (let i = 0; i < ORDER_CREATE_STEPS.length; i++) {
      component.selectedIndex.set(i);
      fixture.detectChanges();
      expect(summaryEl(fixture)?.textContent).toContain(t.orderSummary.title);
    }
  });

  it('還沒選車：顯示「未選車輛」、未填的欄位顯示「未填」、金額為「—」', () => {
    const { fixture } = setup();
    const text = summaryEl(fixture).textContent ?? '';
    expect(text).toContain(t.orderSummary.noVehicle);
    expect(summaryEl(fixture).querySelector('.order-summary__fields .is-empty')?.textContent).toContain(
      t.orderSummary.notFilled,
    );
    expect(summaryEl(fixture).querySelector('.order-summary__total')?.textContent?.trim()).toBe('—');
  });

  it('選了車與租期、填了承租人：車牌＋車款、取還車時間與天數、據點、承租人、報價合計都出現', () => {
    const { fixture, component } = setup();
    fillBaseline(component);
    fixture.detectChanges();
    const text = summaryEl(fixture).textContent ?? '';
    expect(summaryEl(fixture).querySelector('.order-summary__plate')?.textContent).toContain('ABC-123');
    expect(summaryEl(fixture).querySelector('.order-summary__model')?.textContent).toContain('Toyota Altis');
    expect(text).toContain('01/05 09:00');
    expect(text).toContain('01/07 09:00');
    expect(text).toContain(`2${t.orderSummary.daysSuffix}`);
    expect(text).toContain('馬公港櫃檯');
    expect(text).toContain('新客人');
    expect(text).toContain('0900000000');
    expect(text).toContain(t.bookingForm.insuranceNone);
    expect(summaryEl(fixture).querySelector('.order-summary__total')?.textContent).toContain('NT$2,000');
    // 需要的都齊了：四項都打勾
    expect(summaryEl(fixture).querySelectorAll('.order-summary__check.is-met')).toHaveLength(4);
  });

  it('取車據點不是車輛所在據點時，寫出需調度路線「需調度 {車輛所在據點}→{取車據點}」', () => {
    const { fixture, component } = setup();
    fillBaseline(component);
    fixture.detectChanges();
    expect(summaryEl(fixture).querySelector('.order-summary__dispatch')).toBeNull();

    component.form.controls.rental.controls.pickupLocation.setValue('mzg-airport');
    component.form.controls.rental.controls.pickupLocation.markAsDirty();
    fixture.detectChanges();
    expect(summaryEl(fixture).querySelector('.order-summary__dispatch')?.textContent?.trim()).toContain(
      `${t.orderSummary.dispatchPrefix}馬公港櫃檯${t.orderSummary.dispatchArrow}馬公機場櫃檯`,
    );
  });

  it('本次收款與建立後待收跟收款區塊同一套計算；溢收時改寫「溢收」並用警示樣式', () => {
    const { fixture, component } = setup();
    fillBaseline(component); // 報價合計 2000
    setPaymentDrafts(component.form, [{ method: 'cash', purpose: 'deposit', amount: 500 }]);
    fixture.detectChanges();
    expect(summaryEl(fixture).querySelector('.order-summary__collected')?.textContent).toContain('NT$500');
    expect(summaryEl(fixture).querySelector('.order-summary__due')?.textContent).toContain('NT$1,500');

    setPaymentDrafts(component.form, [{ method: 'cash', purpose: 'deposit', amount: 2500 }]);
    fixture.detectChanges();
    const due = summaryEl(fixture).querySelector('.order-summary__due') as HTMLElement;
    expect(due.textContent).toContain('NT$500');
    expect(due.classList.contains('is-overpaid')).toBe(true);
    expect(summaryEl(fixture).textContent).toContain(t.orderSummary.overpaid);
  });

  it('「建立後待補」列出原第 5 步的待補項目', () => {
    const { fixture, component } = setup();
    fillBaseline(component);
    fixture.detectChanges();
    const items = Array.from(summaryEl(fixture).querySelectorAll('.order-summary__incomplete li')).map((li) =>
      li.textContent?.trim(),
    );
    expect(items).toEqual(component.incompleteItems());
    expect(items).toContain(t.bookingForm.incomplete.contractNotSigned);
  });

  it('「建立訂單需要」還沒全部打勾前，「建立後待補」只顯示提示、不列項目（2.2 走查）', () => {
    const { fixture, component } = setup();
    fixture.detectChanges();
    // 空白表單其實已經算得出待補項目（例如未填 Email）；但車、租期、承租人都還沒定，列出來沒意義。
    expect(component.incompleteItems().length).toBeGreaterThan(0);
    expect(summaryEl(fixture).querySelector('.order-summary__incomplete')).toBeNull();
    expect(summaryEl(fixture).querySelector('.order-summary__empty')?.textContent?.trim()).toBe(
      t.orderSummary.incompleteNotReady,
    );

    fillBaseline(component);
    fixture.detectChanges();
    expect(summaryEl(fixture).querySelector('.order-summary__incomplete')).toBeTruthy();
  });

  it('窄版摘要列預設收合，按一下展開完整內容', () => {
    const { fixture } = setup();
    const bar = summaryEl(fixture).querySelector('.order-summary__bar') as HTMLButtonElement;
    expect(bar.getAttribute('aria-expanded')).toBe('false');
    bar.click();
    fixture.detectChanges();
    expect(bar.getAttribute('aria-expanded')).toBe('true');
    expect(summaryEl(fixture).querySelector('.order-summary')?.classList.contains('is-expanded')).toBe(true);
  });
});

describe('OrderCreatePageComponent 第 3 步「費用與付款」（2.4）', () => {
  it('不再列出唯讀的報價明細（已在摘要欄）；應收訂金與本次收款接在保險／配件之後', () => {
    const { fixture, component } = setup();
    fillBaseline(component);
    component.selectedIndex.set(2);
    fixture.detectChanges();
    const pricing = el(fixture).querySelector('app-order-pricing-section') as HTMLElement;
    expect(pricing).toBeTruthy();
    expect(pricing.querySelector('.order-section__dl')).toBeNull();
    expect(el(fixture).querySelector('app-order-payment-drafts-section')).toBeTruthy();
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

  it('2.2：路由標記為滿版頁（外框讓卡片撐滿視窗、操作列釘在卡片底）；訂單詳情不是', () => {
    const children = ORDER_ROUTES[0].children ?? [];
    expect(children.find((r) => r.path === 'new')?.data?.[FILL_PAGE_DATA_KEY]).toBe(true);
    expect(children.find((r) => r.path === ':id')?.data?.[FILL_PAGE_DATA_KEY]).toBeUndefined();
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

describe('OrderCreatePageComponent 頁首標題（2.1：麵包屑「訂單管理」› 大標題「新增訂單」）', () => {
  it('登記到 HeaderTitleSlot，取代頁內自己的標題；頁面本身不再有 h1', () => {
    const { fixture } = setup();
    const slot = TestBed.inject(HeaderTitleSlot);

    expect(slot.entry()?.value).toEqual({
      title: ZH_TW.bookingForm.title,
      breadcrumbs: [{ label: ZH_TW.nav.bookings, route: '/bookings' }],
    });
    expect(fixture.nativeElement.querySelectorAll('h1')).toHaveLength(0);
  });
});
