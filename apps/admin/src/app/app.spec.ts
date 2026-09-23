import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { App } from './app';

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
      expect(app['defaultTitle']).toEqual({ title: '車輛清單', breadcrumbs: [{ label: '商品管理' }] });
      expect(app['currentGroupLabel']).toBe('商品管理');
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
});
