import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PageToolbarComponent } from './page-toolbar.component';

function setup() {
  const fixture = TestBed.createComponent(PageToolbarComponent);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    component: fixture.componentInstance,
    toggleBtn: () => el.querySelector('.search__toggle') as HTMLButtonElement,
    input: () => el.querySelector('.search__input') as HTMLInputElement,
    container: () => el.querySelector('.search') as HTMLElement,
    clearBtn: () => el.querySelector('.search__clear') as HTMLButtonElement | null,
  };
}

describe('PageToolbarComponent 展開收合', () => {
  it('初始為收合狀態', () => {
    const { component, container } = setup();
    expect(component.expanded()).toBe(false);
    expect(container().classList.contains('search--expanded')).toBe(false);
  });

  it('點放大鏡會展開', () => {
    const { fixture, component, toggleBtn, container } = setup();
    toggleBtn().click();
    fixture.detectChanges();
    expect(component.expanded()).toBe(true);
    expect(container().classList.contains('search--expanded')).toBe(true);
  });

  it('展開時點放大鏡會清空文字並收合', () => {
    const { fixture, component, toggleBtn } = setup();
    toggleBtn().click();
    fixture.detectChanges();
    component.query.set('ABC');
    fixture.detectChanges();

    toggleBtn().click();
    fixture.detectChanges();

    expect(component.query()).toBe('');
    expect(component.expanded()).toBe(false);
  });
});

describe('PageToolbarComponent 清除與 Esc', () => {
  it('沒有文字時不顯示清除鈕', () => {
    const { fixture, toggleBtn, clearBtn } = setup();
    toggleBtn().click();
    fixture.detectChanges();
    expect(clearBtn()).toBeNull();
  });

  it('點清除鈕會清空文字但維持展開', () => {
    const { fixture, component, toggleBtn, clearBtn } = setup();
    toggleBtn().click();
    fixture.detectChanges();
    component.query.set('ABC');
    fixture.detectChanges();

    clearBtn()!.click();
    fixture.detectChanges();

    expect(component.query()).toBe('');
    expect(component.expanded()).toBe(true);
  });

  it('按 Esc 會清空文字並收合', () => {
    const { fixture, component, toggleBtn, input } = setup();
    toggleBtn().click();
    fixture.detectChanges();
    component.query.set('ABC');
    fixture.detectChanges();

    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(component.query()).toBe('');
    expect(component.expanded()).toBe(false);
  });
});
