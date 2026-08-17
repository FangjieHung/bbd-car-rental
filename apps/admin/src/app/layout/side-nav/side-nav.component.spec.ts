import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SideNavComponent } from './side-nav.component';
import { NavEntry } from './nav-item.model';

describe('SideNavComponent', () => {
  const navItems: NavEntry[] = [
    { route: '/dashboard', label: '總覽', icon: 'dashboard' },
    {
      label: '商品管理',
      icon: 'inventory_2',
      children: [{ route: '/vehicles', label: '車輛清單', icon: 'directions_car' }],
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

  function openUserMenu(fixture: ReturnType<typeof setup>): HTMLElement {
    const userCard = fixture.nativeElement.querySelector('.user-card') as HTMLButtonElement;
    userCard.click();
    fixture.detectChanges();
    return document.body;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideNavComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn() } },
      ],
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

  it('使用者選單顯示設定與登出', () => {
    const fixture = setup();
    fixture.detectChanges();
    const text = openUserMenu(fixture).textContent ?? '';

    expect(text).toContain('設定');
    expect(text).toContain('登出');
    expect(text).not.toContain('Item 1');
    expect(text).not.toContain('Item 2');
  });

  it('設定選單項目連結到設定頁', () => {
    const fixture = setup();
    fixture.detectChanges();
    const settings = openUserMenu(fixture).querySelector(
      '[data-menu-action="settings"]',
    );

    expect(settings?.getAttribute('href')).toBe('/settings');
  });

  it('點擊登出選單項目呼叫 AuthService.logout', () => {
    const fixture = setup();
    fixture.detectChanges();
    const auth = TestBed.inject(AuthService);
    const logout = vi.mocked(auth.logout);
    const logoutButton = openUserMenu(fixture).querySelector(
      '[data-menu-action="logout"]',
    ) as HTMLButtonElement;

    logoutButton.click();

    expect(logout).toHaveBeenCalledOnce();
  });
});
