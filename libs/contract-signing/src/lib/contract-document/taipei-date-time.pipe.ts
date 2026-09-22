import { Pipe, PipeTransform } from '@angular/core';

// 用原生 Intl 而非 DatePipe：DatePipe 會把 @angular/common 的日期格式化程式碼拉進 admin 首屏 bundle（約 10 kB）。
const TAIPEI = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Taipei',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** ISO 時間 → 台灣時間「yyyy/MM/dd HH:mm」；空值回空字串。 */
@Pipe({ name: 'taipeiDateTime' })
export class TaipeiDateTimePipe implements PipeTransform {
  transform(iso: string | null | undefined): string {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      TAIPEI.formatToParts(date).find((p) => p.type === type)?.value ?? '';
    return `${part('year')}/${part('month')}/${part('day')} ${part('hour')}:${part('minute')}`;
  }
}
