import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SideNavComponent } from './side-nav.component';
import { NavEntry } from './nav-item.model';

describe('SideNavComponent', () => {
  const navItems: NavEntry[] = [
    { route: '/dashboard', label: '總覽', icon: '◉' },
    {
      label: '商品管理',
      icon: '◫',
      children: [{ route: '/vehicles', label: '車輛清單', icon: '◫' }],
    },
  ];

  function setup() {
    const fixture = TestBed.createComponent(SideNavComponent);
    fixture.componentRef.setInput('navItems', navItems);
    fixture.componentRef.setInput('collapsed', false);
    fixture.componentRef.setInput('isMobile', false);
    fixture.componentRef.setInput('openGroupLabel', null);
    fixture.componentRef.setInput('currentGroupLabel', null);
    fixture.componentRef.setInput('flyoutPositions', []);
    return fixture;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideNavComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('渲染導覽項目與群組', () => {
    const fixture = setup();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('總覽');
    expect(text).toContain('商品管理');
  });

  it('點擊群組觸發 toggleGroup 事件', () => {
    const fixture = setup();
    fixture.detectChanges();
    let emitted: string | undefined;
    fixture.componentInstance.toggleGroup.subscribe((label: string) => (emitted = label));
    const trigger = (fixture.nativeElement as HTMLElement).querySelector(
      '.nav-group-trigger',
    ) as HTMLButtonElement;
    trigger.click();
    expect(emitted).toBe('商品管理');
  });

  it('currentGroupLabel 命中時群組按鈕加上 active class', () => {
    const fixture = setup();
    fixture.componentRef.setInput('currentGroupLabel', '商品管理');
    fixture.detectChanges();
    const trigger = (fixture.nativeElement as HTMLElement).querySelector('.nav-group-trigger');
    expect(trigger?.classList.contains('active')).toBe(true);
  });
});
