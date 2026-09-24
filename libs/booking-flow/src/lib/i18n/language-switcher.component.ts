import { Component } from '@angular/core';
import { injectBookingFlowI18n } from './booking-flow-i18n';
import { BOOKING_FLOW_LOCALES } from './booking-flow-locale';

/**
 * 官網的語言切換。選項名稱一律用各語言自己的寫法（繁體中文／English／日本語），
 * 看不懂目前語言的客人才找得到自己的語言。
 */
@Component({
  selector: 'lib-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss',
})
export class LanguageSwitcherComponent {
  protected readonly i18n = injectBookingFlowI18n();
  protected readonly locales = BOOKING_FLOW_LOCALES;
}
