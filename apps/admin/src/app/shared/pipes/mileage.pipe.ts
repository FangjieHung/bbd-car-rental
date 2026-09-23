import { Pipe, PipeTransform } from '@angular/core';

/**
 * admin 版里程顯示（1.8）：千分位，例如「45,200」。單位（km）寫在欄名裡
 * （例如「里程（km）」），不重複印在每一列的值上。非有限數／空值顯示「—」。
 */
@Pipe({ name: 'mileage' })
export class MileagePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(value)) return '—';
    return Math.round(value).toLocaleString('en-US');
  }
}
