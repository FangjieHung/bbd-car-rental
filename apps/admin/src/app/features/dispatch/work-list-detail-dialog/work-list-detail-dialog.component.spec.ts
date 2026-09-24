import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PickupBlocker, PickupWarning } from '../../../core/models';
import { WorkListDetailData, WorkListDetailResult } from './work-list-detail-dialog';
import { WorkListDetailDialogComponent } from './work-list-detail-dialog.component';

const blocker: PickupBlocker = {
  type: 'deposit_below_threshold',
  reason: 'deposit_below_threshold',
  message: '訂金未達門檻。',
} as PickupBlocker;

const warning: PickupWarning = {
  type: 'missing_email',
  message: '未提供 Email，無法寄送提醒。',
} as PickupWarning;

function data(partial: Partial<WorkListDetailData> = {}): WorkListDetailData {
  return {
    title: 'ABC-123',
    subtitle: 'Gogoro 3 · 陳大同',
    timeTerm: '取車時間',
    time: '09:00',
    chips: [
      { tone: 'warning', icon: 'report', text: '訂金未達門檻', className: 'work-list-row__readiness' },
    ],
    member: {
      name: '陳大同',
      phone: { href: 'tel:0912345678', label: '打電話', ariaLabel: '陳大同，撥打電話 0912345678' },
    },
    fields: [
      { term: '取車地點', value: '馬公機場櫃檯' },
      { term: '合約', value: '尚未建立' },
    ],
    severities: [
      { kind: 'blocker', key: 'blocker-deposit_below_threshold', message: blocker.message, blocker },
      { kind: 'warning', key: 'warning-missing_email', message: warning.message, warning },
    ],
    actions: [
      { key: 'pay', label: '收款', icon: 'payments', variant: 'tonal' },
      { key: 'pickup', label: '取車', icon: 'directions_car', variant: 'filled' },
    ],
    ...partial,
  };
}

function setup(view: WorkListDetailData = data()) {
  const close = vi.fn<(result?: WorkListDetailResult) => void>();
  TestBed.configureTestingModule({
    providers: [
      { provide: MatDialogRef, useValue: { close } },
      { provide: MAT_DIALOG_DATA, useValue: view },
    ],
  });
  const fixture = TestBed.createComponent(WorkListDetailDialogComponent);
  fixture.detectChanges();
  return { fixture, close, el: fixture.nativeElement as HTMLElement };
}

describe('WorkListDetailDialogComponent', () => {
  it('標題是車牌＋車款/客人，明細第一列是客人與電話連結', () => {
    const { el } = setup();

    expect(el.querySelector('.work-list-detail-dialog__plate')?.textContent).toContain('ABC-123');
    expect(el.querySelector('.work-list-detail-dialog__subtitle')?.textContent).toContain('Gogoro 3 · 陳大同');

    const phone = el.querySelector<HTMLAnchorElement>('.work-list-detail__phone-link');
    expect(phone?.getAttribute('href')).toBe('tel:0912345678');
    expect(phone?.getAttribute('aria-label')).toBe('陳大同，撥打電話 0912345678');
  });

  it('取車時間與各欄位都印在明細上', () => {
    const { el } = setup();
    const terms = Array.from(el.querySelectorAll('.work-list-detail dt')).map((dt) => dt.textContent?.trim());

    expect(terms).toEqual(['客人', '取車時間', '取車地點', '合約']);
    expect(el.querySelector('.work-list-detail__time')?.textContent?.trim()).toBe('09:00');
  });

  // 設計原則「狀態不只靠顏色」：徽章與阻擋／提醒列都必須同時有 icon 與文字。
  it('狀態徽章與阻擋／提醒列都是 icon + 文字，阻擋還有「前往處理」按鈕', () => {
    const { el } = setup();

    const chip = el.querySelector('.work-list-row__status-chip');
    expect(chip?.querySelector('.material-symbols-rounded')?.textContent?.trim()).toBe('report');
    expect(chip?.textContent).toContain('訂金未達門檻');
    expect(chip?.classList.contains('ui-chip--warning')).toBe(true);

    const items = Array.from(el.querySelectorAll<HTMLElement>('.work-list-severity__item'));
    expect(items).toHaveLength(2);
    for (const item of items) {
      expect(item.querySelector('.material-symbols-rounded')).not.toBeNull();
      expect(item.querySelector('.work-list-severity__text')?.textContent?.trim()).not.toBe('');
      expect(item.querySelector('button')).not.toBeNull();
    }
    expect(items[0].classList.contains('work-list-severity__item--blocker')).toBe(true);
    expect(items[1].classList.contains('work-list-severity__item--warning')).toBe(true);
  });

  it('按快捷操作／前往處理會把選擇回傳給呼叫端，視窗本身不導頁', () => {
    const { el, close } = setup();

    const actionButtons = Array.from(
      el.querySelectorAll<HTMLButtonElement>('.work-list-detail-dialog__actions button'),
    );
    // 第一顆是「關閉」（mat-dialog-close），後面才是快捷操作。
    actionButtons.find((b) => b.textContent?.includes('收款'))?.click();
    expect(close).toHaveBeenCalledWith({ kind: 'action', key: 'pay' });

    el.querySelector<HTMLButtonElement>('.work-list-severity__item--blocker button')?.click();
    expect(close).toHaveBeenCalledWith({
      kind: 'severity',
      severity: expect.objectContaining({ kind: 'blocker', blocker }),
    });
  });

  it('沒有電話、沒有阻擋時不渲染對應的區塊', () => {
    const { el } = setup(data({ member: { name: '陳大同', phone: null }, severities: [], chips: [] }));

    expect(el.querySelector('.work-list-detail__phone-link')).toBeNull();
    expect(el.querySelector('.work-list-severity')).toBeNull();
    expect(el.querySelector('.work-list-detail-dialog__chips')).toBeNull();
  });
});
