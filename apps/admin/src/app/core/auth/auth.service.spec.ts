import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [AuthService, provideRouter([])] });
  });

  it('login 建立本地示範 session', () => {
    const service = TestBed.inject(AuthService);

    service.login();

    expect(JSON.parse(localStorage.getItem('cr.auth.session') ?? 'null')).toEqual({
      user: 'admin',
    });
  });

  it('logout 清除 session 並導向登入頁', () => {
    localStorage.setItem('cr.auth.session', JSON.stringify({ user: 'admin' }));
    const service = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    service.logout();

    expect(localStorage.getItem('cr.auth.session')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});
