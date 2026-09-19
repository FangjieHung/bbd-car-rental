import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, NavigationExtras, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Subject } from 'rxjs';
import { BookingWorkspaceService } from './booking-workspace.service';
import { BookingWorkspaceDialogComponent } from '../dialogs/booking-workspace-dialog.component';

/**
 * 建一個會把 navigate() 的 queryParams 實際「寫回」queryParamMap$ 的假 Router，
 * 讓測試能驗證完整的往返：open()/close() 呼叫 navigate → 觸發訂閱 → 真的開/關 dialog，
 * 而不是只斷言 navigate 被呼叫過。
 */
function createHarness(initialParams: Record<string, string> = {}) {
  const current: Record<string, string> = { ...initialParams };
  const paramMap$ = new BehaviorSubject(convertToParamMap({ ...current }));

  const navigate = vi.fn((_commands: unknown[], extras: NavigationExtras = {}) => {
    const patch = (extras.queryParams ?? {}) as Record<string, unknown>;
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === undefined) delete current[key];
      else current[key] = String(value);
    }
    paramMap$.next(convertToParamMap({ ...current }));
    return Promise.resolve(true);
  });

  const dialogOpen = vi.fn();

  TestBed.configureTestingModule({
    providers: [
      { provide: Router, useValue: { navigate } },
      { provide: ActivatedRoute, useValue: { queryParamMap: paramMap$ } },
      { provide: MatDialog, useValue: { open: dialogOpen } },
    ],
  });

  return { navigate, dialogOpen, paramMap$, current };
}

const SIZING_CONTRACT = {
  width: '80vw',
  maxWidth: '1200px',
  height: 'min(88dvh, 960px)',
  panelClass: 'booking-workspace-dialog',
  autoFocus: 'dialog',
  restoreFocus: true,
};

describe('BookingWorkspaceService', () => {
  it('open() 寫入 booking 與 section 兩個 query params', () => {
    const { navigate, dialogOpen } = createHarness();
    dialogOpen.mockReturnValue({ afterClosed: () => new Subject() });
    const service = TestBed.inject(BookingWorkspaceService);

    service.open('b1', 'payments');

    expect(navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { booking: 'b1', section: 'payments' },
        queryParamsHandling: 'merge',
      }),
    );
  });

  it('open() 沒帶 section 時預設寫入 overview，且用該設定開出符合尺寸規格的 dialog', () => {
    const { dialogOpen } = createHarness();
    dialogOpen.mockReturnValue({ afterClosed: () => new Subject() });
    const service = TestBed.inject(BookingWorkspaceService);

    service.open('b1');

    expect(dialogOpen).toHaveBeenCalledWith(
      BookingWorkspaceDialogComponent,
      expect.objectContaining({
        data: { bookingId: 'b1', section: 'overview' },
        ...SIZING_CONTRACT,
      }),
    );
  });

  it('重新整理時網址已帶 booking/section，服務一建立就用同一分頁重新開啟 dialog', () => {
    const { dialogOpen } = createHarness({ booking: 'b2', section: 'contract' });
    dialogOpen.mockReturnValue({ afterClosed: () => new Subject() });

    TestBed.inject(BookingWorkspaceService);

    expect(dialogOpen).toHaveBeenCalledTimes(1);
    expect(dialogOpen).toHaveBeenCalledWith(
      BookingWorkspaceDialogComponent,
      expect.objectContaining({
        data: { bookingId: 'b2', section: 'contract' },
        ...SIZING_CONTRACT,
      }),
    );
  });

  it('關閉只移除 booking／section 兩個參數，保留其他既有的 query params', () => {
    const { dialogOpen, current } = createHarness({
      booking: 'b1',
      section: 'overview',
      foo: 'bar',
    });
    const afterClosed$ = new Subject<unknown>();
    const closeSpy = vi.fn(() => afterClosed$.next(undefined));
    dialogOpen.mockReturnValue({ close: closeSpy, afterClosed: () => afterClosed$ });
    const service = TestBed.inject(BookingWorkspaceService);

    service.close();

    expect(closeSpy).toHaveBeenCalled();
    expect(current['booking']).toBeUndefined();
    expect(current['section']).toBeUndefined();
    expect(current['foo']).toBe('bar');
  });

  it('瀏覽器上一頁把網址參數拿掉時，服務會關閉目前開啟的 dialog', () => {
    const { dialogOpen, paramMap$, current } = createHarness({
      booking: 'b1',
      section: 'overview',
    });
    const closeSpy = vi.fn();
    dialogOpen.mockReturnValue({ close: closeSpy, afterClosed: () => new Subject() });
    TestBed.inject(BookingWorkspaceService);
    expect(dialogOpen).toHaveBeenCalledTimes(1);

    delete current['booking'];
    delete current['section'];
    paramMap$.next(convertToParamMap({ ...current }));

    expect(closeSpy).toHaveBeenCalled();
  });

  it('同一筆訂單的第二次網址事件不會重複開啟 dialog', () => {
    const { dialogOpen, paramMap$, current } = createHarness({
      booking: 'b1',
      section: 'overview',
    });
    dialogOpen.mockReturnValue({ afterClosed: () => new Subject() });
    TestBed.inject(BookingWorkspaceService);
    expect(dialogOpen).toHaveBeenCalledTimes(1);

    // 模擬 router 對同樣的 query params 又發了一次事件（例如另一個不相干的 navigate 觸發）。
    paramMap$.next(convertToParamMap({ ...current }));

    expect(dialogOpen).toHaveBeenCalledTimes(1);
  });
});
