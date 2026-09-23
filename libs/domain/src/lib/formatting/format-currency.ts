/**
 * 全站新台幣金額格式（1.8）：「NT$10,545」；負數用全形減號 U+2212（不是連字號 -）「−NT$700」，
 * 例如取消案件的應退金額、還車的應收費用調整。新台幣沒有小數，四捨五入到整數。
 * 非有限數（NaN、Infinity、-Infinity）代表尚未算出或資料有誤，顯示「—」而不是 NaN/undefined
 * 這種會讓使用者誤以為是系統壞掉的字串。
 *
 * 放在 libs/domain（而非 admin）：官網（apps/booking）日後需要顯示金額時可以直接複用同一份
 * 格式規則，不必各自重新定義一次「千分位＋NT$前綴＋負數用全形減號」的規則。
 */
export function formatTwd(amount: number): string {
  if (!Number.isFinite(amount)) return '—';
  const rounded = Math.round(amount);
  const isNegative = rounded < 0;
  const digits = Math.abs(rounded).toLocaleString('en-US');
  return isNegative ? `−NT$${digits}` : `NT$${digits}`;
}
