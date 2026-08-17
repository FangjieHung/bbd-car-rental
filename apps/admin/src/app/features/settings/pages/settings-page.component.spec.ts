import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { COLOR_THEMES, ThemeService, texture } from '@car-rental/theme-pack';
import { SettingsPageComponent } from './settings-page.component';

describe('SettingsPageComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [SettingsPageComponent] });
  });

  it('顯示系統設定標題與建置中文案', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('系統設定');
    expect(text).toContain('外觀設定');
    expect(text).toContain('質地');
    expect(text).toContain('配色');
  });

  it('顯示所有質地與配色選項', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    for (const option of [...texture, ...COLOR_THEMES]) {
      expect(text).toContain(option.label);
    }
  });

  it('選擇配色與質地會更新 ThemeService 並標示目前選項', () => {
    const fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
    const theme = TestBed.inject(ThemeService);
    const color = COLOR_THEMES.find((option) => option.id === 'midnight') ?? COLOR_THEMES[0];
    const paradigm = texture.find((option) => option.id !== theme.paradigm()) ?? texture[0];

    (fixture.nativeElement.querySelector(`[data-theme-id="${color.id}"]`) as HTMLButtonElement).click();
    (fixture.nativeElement.querySelector(`[data-paradigm-id="${paradigm.id}"]`) as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(theme.theme()).toBe(color.id);
    expect(theme.paradigm()).toBe(paradigm.id);
    expect(
      fixture.nativeElement.querySelector(`[data-theme-id="${color.id}"]`).getAttribute('aria-pressed'),
    ).toBe('true');
    expect(
      fixture.nativeElement
        .querySelector(`[data-paradigm-id="${paradigm.id}"]`)
        .getAttribute('aria-pressed'),
    ).toBe('true');
  });
});
