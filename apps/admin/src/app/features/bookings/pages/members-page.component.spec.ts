import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MEMBER_REPO } from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';
import { Member } from '../../../core/models';
import { ZH_TW } from '../../../core/i18n/zh-tw';
import { HeaderTitleSlot } from '../../../layout/header/header-title';
import { MembersPageComponent } from './members-page.component';

const member: Member = { id: 'm1', name: '王小明', phone: '0912345678', kind: 'local', email: '' };

function createFixture(members: Member[] = [member]) {
  TestBed.configureTestingModule({
    providers: [
      { provide: MEMBER_REPO, useValue: createInMemoryRepo<Member>(members) },
      { provide: MatDialog, useValue: { open: vi.fn() } },
      { provide: MatSnackBar, useValue: { open: vi.fn() } },
    ],
  });
  const fixture = TestBed.createComponent(MembersPageComponent);
  fixture.detectChanges();
  return fixture;
}

describe('MembersPageComponent 頁首標題（2.1：麵包屑「訂單管理」› 大標題「會員」，原本誤顯示「訂單管理」）', () => {
  it('登記到 HeaderTitleSlot：標題「會員」、麵包屑指回訂單列表', () => {
    createFixture();
    const slot = TestBed.inject(HeaderTitleSlot);

    expect(slot.entry()?.value).toEqual({
      title: ZH_TW.membersPage.title,
      breadcrumbs: [{ label: ZH_TW.nav.bookings, route: '/bookings' }],
    });
  });

  it('頁面本身不渲染 h1（頁面唯一的 h1 在頁首）', () => {
    const fixture = createFixture();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('h1')).toHaveLength(0);
  });
});

describe('MembersPageComponent 會員清單', () => {
  it('顯示會員資料', () => {
    const fixture = createFixture();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('王小明');
  });

  it('沒有會員時顯示空狀態', () => {
    const fixture = createFixture([]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(ZH_TW.common.empty);
  });
});
