import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SettingsPageComponent } from './settings-page.component';

describe('SettingsPageComponent', () => {
  it('顯示系統設定標題與建置中文案', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('系統設定');
    expect(text).toContain('設定功能建置中');
  });
});
