import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BookingFlowI18n } from './booking-flow-i18n';
import { LanguageSwitcherComponent } from './language-switcher.component';

describe('LanguageSwitcherComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LanguageSwitcherComponent] });
  });

  function render() {
    const fixture = TestBed.createComponent(LanguageSwitcherComponent);
    fixture.detectChanges();
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    return { fixture, buttons, i18n: TestBed.inject(BookingFlowI18n) };
  }

  it('每個語言都用自己的寫法列出，目前語言標為按下', () => {
    const { buttons } = render();
    expect(buttons.map((b) => b.textContent?.trim())).toEqual(['繁體中文', 'English', '日本語']);
    expect(buttons.map((b) => b.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false']);
  });

  it('點選語言會切換整個訂車流程的語言', () => {
    const { fixture, buttons, i18n } = render();
    buttons[1].click();
    fixture.detectChanges();
    expect(i18n.locale()).toBe('en');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.querySelector('nav').getAttribute('aria-label')).toBe('Language');
  });
});
