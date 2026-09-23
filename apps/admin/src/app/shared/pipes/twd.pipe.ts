import { Pipe, PipeTransform } from '@angular/core';
import { formatTwd } from '@car-rental/domain';

/**
 * admin 版全站金額顯示（1.8）：「NT$10,545」。格式規則本身在 libs/domain 的 formatTwd
 * （官網日後可共用），這裡只是薄薄一層 pipe，讓模板能直接 `{{ amount | twd }}`。
 * 空值（null/undefined）視同非有限數，交給 formatTwd 顯示「—」。
 */
@Pipe({ name: 'twd' })
export class TwdPipe implements PipeTransform {
  transform(amount: number | null | undefined): string {
    return formatTwd(amount ?? NaN);
  }
}
