import { describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/dialogs/confirm-dialog.component';
import { LeaveConfirmable, confirmLeaveGuard } from './confirm-leave.guard';

function run(component: LeaveConfirmable, confirmResult = false) {
  const open = vi.fn(() => ({ afterClosed: () => of(confirmResult) }));
  TestBed.configureTestingModule({ providers: [{ provide: MatDialog, useValue: { open } }] });
  const result = TestBed.runInInjectionContext(() =>
    confirmLeaveGuard(
      component,
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
      {} as RouterStateSnapshot,
    ),
  );
  return { result, open };
}

describe('confirmLeaveGuard', () => {
  it('沒有未儲存改動時直接放行，不跳確認', () => {
    const { result, open } = run({ unsavedChangesMessage: () => null });
    expect(result).toBe(true);
    expect(open).not.toHaveBeenCalled();
  });

  it('有未儲存改動時以確認 dialog 詢問；使用者確認才放行', async () => {
    const { result, open } = run({ unsavedChangesMessage: () => '確定離開？' }, true);
    expect(open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.objectContaining({ data: '確定離開？' }));
    await expect(result).resolves.toBe(true);
  });

  it('使用者不確認就留在頁面', async () => {
    const { result } = run({ unsavedChangesMessage: () => '確定離開？' }, false);
    await expect(result).resolves.toBe(false);
  });
});
