/** 側欄已改為各 ERP 頁靜態 HTML，此檔保留相容用 */
export function renderSidebar() {
  return document.querySelector(".sidebar")?.outerHTML || "";
}
