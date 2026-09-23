import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DATE_RANGE_SELECTION_STRATEGY } from '@angular/material/datepicker';
import { DualMonthRangePickerComponent, SelectedDateRange } from './dual-month-range-picker.component';
import { HoverPreviewRangeStrategy } from './hover-preview-range-strategy';
import { DUAL_MONTH_RANGE_PICKER_LABELS, DualMonthRangePickerLabels } from './dual-month-range-picker-labels';

const LABELS: DualMonthRangePickerLabels = {
  field: '租期',
  placeholder: '選擇日期範圍',
  prevMonth: '上個月',
  nextMonth: '下個月',
  monthTitle: '{year}年{month}月',
};

const AUG_28 = new Date(2026, 7, 28);
const SEP_3 = new Date(2026, 8, 3);
const SEP_5 = new Date(2026, 8, 5);

describe('DualMonthRangePickerComponent hover 預覽', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<DualMonthRangePickerComponent>>;
  let component: DualMonthRangePickerComponent;
  let strategy: HoverPreviewRangeStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DualMonthRangePickerComponent],
      providers: [provideNativeDateAdapter(), { provide: DUAL_MONTH_RANGE_PICKER_LABELS, useValue: LABELS }],
    });
    fixture = TestBed.createComponent(DualMonthRangePickerComponent);
    component = fixture.componentInstance;
    strategy = fixture.debugElement.injector.get(
      MAT_DATE_RANGE_SELECTION_STRATEGY,
    ) as HoverPreviewRangeStrategy;
  });

  const range = () => component['selectedRange'];

  it('元件有 provide range strategy——沒有它 Material 的 hover 回報會靜默失效', () => {
    expect(strategy).toBeInstanceOf(HoverPreviewRangeStrategy);
  });

  it('選了起點後 hover 到下個月，折進共用的 selected，讓兩個日曆一起亮', () => {
    component['onDateClicked'](AUG_28);
    expect(range().end).toBeNull();

    // 透過 strategy 呼叫，一併驗證 createPreview → onHover 這條接線
    strategy.createPreview(SEP_3, range());

    expect(range().start).toEqual(AUG_28);
    expect(range().end).toEqual(SEP_3);
  });

  it('hover 不會污染實際選取：第二次點擊送出的是點擊值而非 hover 值', () => {
    const emitted: SelectedDateRange[] = [];
    component.rangeSelected.subscribe((r) => emitted.push(r));

    component['onDateClicked'](AUG_28);
    strategy.createPreview(SEP_3, range());
    component['onDateClicked'](SEP_5);

    expect(emitted).toEqual([{ start: AUG_28, end: SEP_5 }]);
  });

  it('滑鼠離開後預覽清除，範圍回到只有起點', () => {
    component['onDateClicked'](AUG_28);
    strategy.createPreview(SEP_3, range());
    expect(range().end).toEqual(SEP_3);

    component['onHover'](null);

    expect(range().start).toEqual(AUG_28);
    expect(range().end).toBeNull();
  });

  it('還沒選起點時 hover 不上色', () => {
    strategy.createPreview(SEP_3, range());

    expect(range().start).toBeNull();
    expect(range().end).toBeNull();
  });

  it('範圍已選定後 hover 不會改動它', () => {
    component['onDateClicked'](AUG_28);
    component['onDateClicked'](SEP_5);

    component['onHover'](SEP_3);

    expect(range().start).toEqual(AUG_28);
    expect(range().end).toEqual(SEP_5);
  });

  it('hover 到比起點早的日期不會產生反向範圍', () => {
    component['onDateClicked'](SEP_5);
    strategy.createPreview(AUG_28, range());

    expect(range().start).toEqual(SEP_5);
    expect(range().end).toBeNull();
  });

  it('關閉面板會清掉殘留的預覽', () => {
    component['onDateClicked'](AUG_28);
    strategy.createPreview(SEP_3, range());

    component['close']();

    expect(range().end).toBeNull();
  });

  it('帶著既有 start/end 重新開啟時顯示原範圍', () => {
    component.start = AUG_28;
    component.end = SEP_5;
    component.ngOnChanges({ start: { firstChange: true } as never });

    expect(range().start).toEqual(AUG_28);
    expect(range().end).toEqual(SEP_5);
  });
});

describe('DualMonthRangePickerComponent 畫面文字與相依', () => {
  it('欄位標籤、提示文字、月份標題都取自 DUAL_MONTH_RANGE_PICKER_LABELS（libs/ui 不內建文字）', () => {
    TestBed.configureTestingModule({
      imports: [DualMonthRangePickerComponent],
      providers: [
        provideNativeDateAdapter(),
        {
          provide: DUAL_MONTH_RANGE_PICKER_LABELS,
          useValue: { ...LABELS, field: 'Dates', placeholder: 'Pick dates', monthTitle: '{month}/{year}' },
        },
      ],
    });
    const fixture = TestBed.createComponent(DualMonthRangePickerComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('mat-label')?.textContent?.trim()).toBe('Dates');
    expect(el.querySelector('input')?.getAttribute('placeholder')).toBe('Pick dates');
    expect(fixture.componentInstance['monthLabel'](SEP_3)).toBe('9/2026');
  });

  it('面板還沒開啟時不需要 DateAdapter 也建得起來（月曆開啟時才需要）', () => {
    TestBed.configureTestingModule({
      imports: [DualMonthRangePickerComponent],
      providers: [{ provide: DUAL_MONTH_RANGE_PICKER_LABELS, useValue: LABELS }],
    });
    const fixture = TestBed.createComponent(DualMonthRangePickerComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect((fixture.nativeElement as HTMLElement).querySelector('mat-label')?.textContent?.trim()).toBe('租期');
  });
});
