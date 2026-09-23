/**
 * 下拉選單／單選群組共用的「值＋標籤」形狀。label 定位是預設繁中標籤：admin 直接讀取顯示；
 * 官網日後疊加 i18n 時，以 value 當作翻譯查找的 key，查不到時落回這裡的 label，
 * 不需要另外維護一份平行的翻譯 key 對照表。
 */
export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

/** 把一組 SelectOption 攤平成 { value: label } 的查找表，給只需要「查標籤」而不需要走訪選項清單的呼叫端用。 */
export function optionLabelMap<T extends string>(
  options: readonly SelectOption<T>[],
): Record<T, string> {
  const map = {} as Record<T, string>;
  for (const option of options) {
    map[option.value] = option.label;
  }
  return map;
}
