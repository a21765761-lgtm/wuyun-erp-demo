/**
 * 庫存邏輯 · 向後相容匯出（請優先使用 stock-service.js）
 */
export {
  DEFAULT_N_DAYS,
  LOW_STOCK_THRESHOLD,
  getRentalWindow,
  windowsOverlap,
  dateInWindow,
  getStockLevel,
  collectActiveOrders,
  getRemainingStock,
  getRemainingOnDate,
  getDayPressureList,
  checkStockAvailable,
  checkAccessoryAvailable,
  getLowStockAlerts,
  getHotSizeShortages,
  getSellingOutSoon,
  getAccessoryWarnings
} from "./stock-service.js";
