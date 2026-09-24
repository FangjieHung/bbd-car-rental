import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';
import { FILL_PAGE_DATA_KEY } from './layout/fill-page';
import { NavEntry, NavGroup, isNavGroup } from './layout/side-nav/nav-item.model';
import { ZH_TW } from './core/i18n/zh-tw';

@Component({ template: '' })
class BlankComponent {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: 'dashboard', component: BlankComponent },
          { path: 'vehicles', component: BlankComponent },
          { path: 'vehicles/:id', component: BlankComponent },
          { path: 'settings', component: BlankComponent },
          { path: 'no-nav-match', component: BlankComponent },
          { path: 'orders/members', component: BlankComponent },
          { path: 'bookings', component: BlankComponent },
          {
            path: 'orders',
            children: [
              { path: 'new', component: BlankComponent, data: { [FILL_PAGE_DATA_KEY]: true } },
              { path: ':id', component: BlankComponent },
            ],
          },
        ]),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the brand title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('澎湖租車後台');
  });

  it('2.1：整個殼（側欄＋頁首）只有一個 h1——側欄品牌已不是 h1，頁首的大標題是唯一的一個', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await fixture.whenStable();
    await router.navigateByUrl('/vehicles');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('h1')).toHaveLength(1);
    expect(compiled.querySelector('h1')?.textContent).toBe('車輛清單');
  });

  describe('由選單推得的 defaultTitle（頁首的預設標題／麵包屑，頁面沒有覆寫時使用）', () => {
    it('頂層選單項目（沒有所屬群組）：標題就是選單項目名稱，沒有麵包屑', async () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      const router = TestBed.inject(Router);
      await fixture.whenStable();

      await router.navigateByUrl('/dashboard');
      expect(app['defaultTitle']).toEqual({ title: '總覽', breadcrumbs: [] });
      expect(app['currentGroupLabel']).toBeNull();
    });

    it('群組內的選單項目：標題是項目名稱，麵包屑是群組名稱（群組沒有自己的頁面，不可點）', async () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      const router = TestBed.inject(Router);
      await fixture.whenStable();

      await router.navigateByUrl('/vehicles');
      expect(app['defaultTitle']).toEqual({ title: '車輛清單', breadcrumbs: [{ label: '車輛與配件' }] });
      expect(app['currentGroupLabel']).toBe('車輛與配件');
    });

    it('找不到選單對應的路由：不再退回「總覽」，標題留空（由頁面自己的 provideHeaderTitle 覆寫）', async () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      const router = TestBed.inject(Router);
      await fixture.whenStable();

      await router.navigateByUrl('/no-nav-match');
      expect(app['defaultTitle']).toEqual({ title: '', breadcrumbs: [] });
      expect(app['currentGroupLabel']).toBeNull();
    });
  });

  describe('2.2 滿版頁（路由 data 標記）', () => {
    it('標記為滿版頁的路由：主內容區加上 page-shell--fill（撐滿頁首與頁尾之間的高度）；其他頁面沒有', async () => {
      const fixture = TestBed.createComponent(App);
      const router = TestBed.inject(Router);
      await fixture.whenStable();
      const shell = () => (fixture.nativeElement as HTMLElement).querySelector('.page-shell') as HTMLElement;

      await router.navigateByUrl('/orders/new');
      fixture.detectChanges();
      expect(shell().classList.contains('page-shell--fill')).toBe(true);

      await router.navigateByUrl('/vehicles');
      fixture.detectChanges();
      expect(shell().classList.contains('page-shell--fill')).toBe(false);
    });
  });

  describe('4.5 側欄入口與命名', () => {
    function groupOf(navItems: NavEntry[], label: string): NavGroup | undefined {
      return navItems.find((entry): entry is NavGroup => isNavGroup(entry) && entry.label === label);
    }

    /** 側欄目前亮起的子項目名稱（去掉圖示字型的 ligature 文字）。 */
    function activeSublinkLabels(root: HTMLElement): (string | undefined)[] {
      return Array.from(root.querySelectorAll('.nav-sublink.active')).map((a) =>
        a.querySelector('span:not(.nav-icon)')?.textContent?.trim(),
      );
    }

    it('「商品管理」改叫「車輛與配件」；「訂單管理」是群組：訂單列表（建單、訂單詳情也歸它）＋會員', () => {
      const app = TestBed.createComponent(App).componentInstance;
      const navItems: NavEntry[] = app['navItems'];

      expect(navItems.map((entry) => entry.label)).toEqual(['總覽', '車輛與配件', '訂單管理', '定價管理', '合作通路']);
      expect(groupOf(navItems, '車輛與配件')?.children.map((c) => c.label)).toEqual(['車輛清單', '配件清單']);
      expect(groupOf(navItems, '訂單管理')?.children).toEqual([
        { route: '/orders', label: '訂單列表', icon: 'calendar_month', matchPrefixes: ['/orders/'] },
        { route: '/orders/members', label: '會員', icon: 'group' },
      ]);
    });

    it('/orders：頁首「訂單管理 › 訂單列表」，側欄群組展開、「訂單列表」亮起', async () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      const router = TestBed.inject(Router);
      await fixture.whenStable();

      await router.navigateByUrl('/orders?q=林美惠');
      fixture.detectChanges();

      expect(app['defaultTitle']).toEqual({ title: '訂單列表', breadcrumbs: [{ label: '訂單管理' }] });
      expect(app['currentGroupLabel']).toBe('訂單管理');
      expect(app['openGroupLabel']).toBe('訂單管理');
      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('h1')?.textContent).toBe('訂單列表');
      expect(el.querySelector('.breadcrumb-text')?.textContent).toBe('訂單管理');
      expect(activeSublinkLabels(el)).toEqual(['訂單列表']);
      expect(el.querySelector('.nav-sublink.active')?.getAttribute('aria-current')).toBe('page');
    });

    it('/orders/members：頁首「訂單管理 › 會員」，側欄亮「會員」（不是訂單列表）', async () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      const router = TestBed.inject(Router);
      await fixture.whenStable();

      await router.navigateByUrl('/orders/members');
      fixture.detectChanges();

      expect(app['defaultTitle']).toEqual({ title: '會員', breadcrumbs: [{ label: '訂單管理' }] });
      expect(activeSublinkLabels(fixture.nativeElement as HTMLElement)).toEqual(['會員']);
    });

    it('建單（/orders/new）與訂單詳情（/orders/:id）也亮「訂單列表」，群組跟著展開', async () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      const router = TestBed.inject(Router);
      await fixture.whenStable();
      const activeSublinks = () => activeSublinkLabels(fixture.nativeElement as HTMLElement);

      await router.navigateByUrl('/orders/new?vehicleId=v1');
      fixture.detectChanges();
      expect(app['currentGroupLabel']).toBe('訂單管理');
      expect(activeSublinks()).toEqual(['訂單列表']);

      await router.navigateByUrl('/orders/b1');
      fixture.detectChanges();
      expect(activeSublinks()).toEqual(['訂單列表']);
    });

    it('頁面自己登記的麵包屑（新增訂單、訂單詳情、會員頁都寫 nav.orders 並連回 /orders）與側欄群組同名', () => {
      const app = TestBed.createComponent(App).componentInstance;
      const orderGroup = (app['navItems'] as NavEntry[]).find(
        (entry): entry is NavGroup => isNavGroup(entry) && entry.children.some((c) => c.route === '/orders'),
      );

      expect(orderGroup?.label).toBe(ZH_TW.nav.orders);
      expect(ZH_TW.nav.orders).toBe('訂單管理');
      // 車輛詳情的麵包屑「車輛與配件 › 車輛清單 › {車牌}」同理。
      expect(ZH_TW.nav.productGroup).toBe('車輛與配件');
    });
  });
});
