import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  it('顯示標題與麵包屑', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentRef.setInput('currentTitle', '車輛清單');
    fixture.componentRef.setInput('currentGroupLabel', '商品管理');
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('商品管理');
    expect(text).toContain('車輛清單');
  });

  it('沒有 currentGroupLabel 時不顯示麵包屑前綴', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentRef.setInput('currentTitle', '總覽');
    fixture.componentRef.setInput('currentGroupLabel', null);
    fixture.detectChanges();
    const breadcrumb = (fixture.nativeElement as HTMLElement).querySelector('.breadcrumb');
    expect(breadcrumb?.querySelectorAll('span').length).toBe(1);
  });

  it('點擊選單按鈕觸發 menuToggle 事件', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentRef.setInput('currentTitle', '車輛清單');
    fixture.componentRef.setInput('currentGroupLabel', null);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.menuToggle.subscribe(() => (emitted = true));
    const btn = (fixture.nativeElement as HTMLElement).querySelector(
      '.menu-toggle',
    ) as HTMLButtonElement;
    btn.click();
    expect(emitted).toBe(true);
  });
});
