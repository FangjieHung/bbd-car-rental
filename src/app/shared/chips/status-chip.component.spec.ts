import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { StatusChipComponent } from './status-chip.component';

describe('StatusChipComponent', () => {
  it('依 StatusKey 套對應 tone class', () => {
    const f = TestBed.createComponent(StatusChipComponent);
    f.componentRef.setInput('status', 'approved');
    f.componentRef.setInput('label', '已核准');
    f.detectChanges();
    const chip = f.nativeElement.querySelector('.ui-chip');
    expect(chip.classList).toContain('ui-chip--positive');
    expect(chip.textContent).toContain('已核准');
  });
});
