import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ContractVersion } from '@car-rental/domain';
import {
  BookingWorkspaceDialogComponent,
  BookingWorkspaceDialogData,
  WORKSPACE_SECTIONS,
} from './booking-workspace-dialog.component';
import { CONTRACT_VERSION_REPO } from '../../../core/repositories/tokens';
import { createInMemoryRepo } from '../../../core/repositories/testing';

describe('BookingWorkspaceDialogComponent', () => {
  let closeSpy: ReturnType<typeof vi.fn>;
  let dialogOpen: ReturnType<typeof vi.fn>;

  function createFixture(data: BookingWorkspaceDialogData = { bookingId: 'b1' }) {
    closeSpy = vi.fn();
    dialogOpen = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialogRef,
          useValue: { close: closeSpy, disableClose: false },
        },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialog, useValue: { open: dialogOpen } },
        { provide: CONTRACT_VERSION_REPO, useValue: createInMemoryRepo<ContractVersion>() },
      ],
    });
    return TestBed.createComponent(BookingWorkspaceDialogComponent);
  }

  it('定義七個具名分頁，且順序符合規格（總覽/文件/款項/合約/交還車/取消退款/活動紀錄）', () => {
    expect(WORKSPACE_SECTIONS).toEqual([
      'overview',
      'documents',
      'payments',
      'contract',
      'handover',
      'cancellation',
      'activity',
    ]);
  });

  it('沒有指定 section 時預設開在 overview', () => {
    const fixture = createFixture({ bookingId: 'b1' });
    expect(fixture.componentInstance['activeSection']()).toBe('overview');
  });

  it('data 有指定 section 時，開啟就停在該分頁（供網址還原使用）', () => {
    const fixture = createFixture({ bookingId: 'b1', section: 'payments' });
    expect(fixture.componentInstance['activeSection']()).toBe('payments');
  });

  it('selectSection 切換使用中分頁', () => {
    const fixture = createFixture();
    const component = fixture.componentInstance;

    component.selectSection('documents');

    expect(component['activeSection']()).toBe('documents');
  });

  it('標題為可存取的 h2，且有 role=status 的分頁狀態文字，切換分頁後同步更新', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const heading = el.querySelector('h2#booking-workspace-heading');
    expect(heading?.textContent?.trim()).toBe('訂單工作區');

    const status = el.querySelector('[role="status"]');
    expect(status?.textContent?.trim()).toBe('總覽');

    fixture.componentInstance.selectSection('contract');
    fixture.detectChanges();

    expect(el.querySelector('[role="status"]')?.textContent?.trim()).toBe('合約');
  });

  it('只渲染使用中分頁的內容，其餘六個分頁不建立面板（lazy render）', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('.booking-workspace__placeholder')).toHaveLength(1);
    expect(el.querySelector('.booking-workspace__placeholder')?.textContent?.trim()).toBe('總覽');
  });

  it('沒有未儲存變更時，點擊關閉直接呼叫 MatDialogRef.close()', async () => {
    const fixture = createFixture();

    await fixture.componentInstance.requestClose();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('有未儲存變更（dirty）時，關閉前先跳確認對話框；使用者取消則不會真的關閉', async () => {
    const fixture = createFixture();
    fixture.componentInstance.setDirty(true);
    dialogOpen.mockReturnValue({ afterClosed: () => of(false) });

    await fixture.componentInstance.requestClose();

    expect(dialogOpen).toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('dirty 時關閉並在確認對話框按下確定，才會真的呼叫 MatDialogRef.close()', async () => {
    const fixture = createFixture();
    fixture.componentInstance.setDirty(true);
    dialogOpen.mockReturnValue({ afterClosed: () => of(true) });

    await fixture.componentInstance.requestClose();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('setDirty(true) 會同步鎖住 MatDialogRef.disableClose，防止 ESC / 背景點擊直接關閉', () => {
    const fixture = createFixture();

    fixture.componentInstance.setDirty(true);
    expect(fixture.componentInstance.ref.disableClose).toBe(true);

    fixture.componentInstance.setDirty(false);
    expect(fixture.componentInstance.ref.disableClose).toBe(false);
  });
});
