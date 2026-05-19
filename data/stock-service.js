/**
 * 剩餘可租庫存 · 核心服務
 * 表演日前後 N 天內，依尺寸扣除已租數量，計算剩餘可租件數。
 */
import { inventory, getCostumeById } from "./inventory.js";
import { orders } from "./orders.js";
import { accessories } from "./accessories.js";

export const LOW_STOCK_THRESHOLD = 3;
export const DEFAULT_N_DAYS = 3;

/** @typedef {'ok'|'low'|'tight'|'out'} StockLevel */

export function getRentalWindow(performanceDate, nDays = DEFAULT_N_DAYS) {
  const performance = parseDate(performanceDate);
  if (!performance) return null;

  const start = new Date(performance);
  start.setDate(start.getDate() - nDays);
  const end = new Date(performance);
  end.setDate(end.getDate() + nDays);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end, performanceDate, nDays };
}

export function parseDate(isoOrDate) {
  if (!isoOrDate) return null;
  if (isoOrDate instanceof Date) {
    const d = new Date(isoOrDate);
    d.setHours(12, 0, 0, 0);
    return d;
  }
  const d = new Date(String(isoOrDate).slice(0, 10) + "T12:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

export function dateInWindow(date, window) {
  if (!window || !date) return false;
  const d = parseDate(date);
  return d >= window.start && d <= window.end;
}

export function windowsOverlap(a, b) {
  if (!a || !b) return false;
  return a.start <= b.end && a.end >= b.start;
}

export function getStockLevel(remaining) {
  if (remaining <= 0) {
    return { level: "out", label: "已無可租", shortLabel: "無庫存" };
  }
  if (remaining <= 1) {
    return { level: "tight", label: "庫存緊張", shortLabel: "緊張" };
  }
  if (remaining <= LOW_STOCK_THRESHOLD) {
    return { level: "low", label: "即將不足", shortLabel: "偏低" };
  }
  return { level: "ok", label: "可租", shortLabel: "充足" };
}

function normalizeOrder(raw) {
  let nDays = raw.nDays ?? DEFAULT_N_DAYS;
  try {
    if (raw.nDays == null) {
      const fromSession = sessionStorage.getItem("wuyun_rental_days");
      if (fromSession) nDays = Number(fromSession) || DEFAULT_N_DAYS;
    }
  } catch {
    /* non-browser */
  }
  const items = (raw.items || []).map(item => ({
    costumeId: Number(item.costumeId ?? item.productId),
    size: item.size,
    quantity: item.quantity ?? 1,
    performanceDate: item.performanceDate ?? raw.performanceDate
  }));

  return {
    id: raw.id,
    status: raw.status ?? "進行中",
    nDays,
    customer: raw.customer ?? raw.orgName,
    items
  };
}

/** 進行中訂單（已完成不扣庫存） */
export function collectActiveOrders() {
  const stored = [];
  try {
    const raw = JSON.parse(localStorage.getItem("activeOrders") || "[]");
    stored.push(...raw.map(normalizeOrder));
  } catch {
    /* ignore */
  }

  const sample = orders
    .filter(o => o.status !== "完成")
    .map(o => normalizeOrder({ ...o, status: o.status ?? "進行中" }));

  return [...sample, ...stored];
}

function sumRentedInWindow({ costumeId, size, window, excludeOrderId }) {
  let rented = 0;

  for (const order of collectActiveOrders()) {
    if (order.status === "完成") continue;
    if (excludeOrderId != null && order.id == excludeOrderId) continue;

    for (const item of order.items) {
      if (item.costumeId !== costumeId || item.size !== size) continue;
      if (!item.performanceDate) continue;

      const itemWindow = getRentalWindow(item.performanceDate, order.nDays);
      if (windowsOverlap(window, itemWindow)) {
        rented += item.quantity;
      }
    }
  }

  return rented;
}

/**
 * 某檔期（表演日 ±N 天）剩餘可租
 */
export function getRemainingStock({
  costumeId,
  size,
  performanceDate,
  nDays = DEFAULT_N_DAYS,
  excludeOrderId = null
}) {
  const costume = getCostumeById(costumeId);
  const totalStock = costume?.sizes?.[size] ?? 0;
  const window = getRentalWindow(performanceDate, nDays);

  if (!window) {
    return {
      costumeId,
      size,
      costumeName: costume?.name ?? "",
      totalStock,
      rented: 0,
      remaining: totalStock,
      ...getStockLevel(totalStock)
    };
  }

  const rented = sumRentedInWindow({
    costumeId,
    size,
    window,
    excludeOrderId
  });
  const remaining = Math.max(0, totalStock - rented);

  return {
    costumeId,
    size,
    costumeName: costume?.name ?? "",
    totalStock,
    rented,
    remaining,
    window,
    ...getStockLevel(remaining)
  };
}

/** 某一天當下的剩餘（所有重疊該日的訂單都會扣除） */
export function getRemainingOnDate({ costumeId, size, onDate }) {
  const costume = getCostumeById(costumeId);
  const totalStock = costume?.sizes?.[size] ?? 0;
  const day = parseDate(onDate);
  if (!day) {
    return { costumeId, size, costumeName: costume?.name ?? "", totalStock, rented: 0, remaining: totalStock, ...getStockLevel(totalStock) };
  }

  let rented = 0;
  for (const order of collectActiveOrders()) {
    if (order.status === "完成") continue;
    for (const item of order.items) {
      if (item.costumeId !== costumeId || item.size !== size) continue;
      const w = getRentalWindow(item.performanceDate, order.nDays);
      if (dateInWindow(day, w)) rented += item.quantity;
    }
  }

  const remaining = Math.max(0, totalStock - rented);
  return {
    costumeId,
    size,
    costumeName: costume?.name ?? "",
    totalStock,
    rented,
    remaining,
    ...getStockLevel(remaining)
  };
}

/** 某日庫存壓力清單（含款式／尺寸／剩餘） */
export function getDayPressureList(year, month, day) {
  const onDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const rows = [];

  for (const costume of inventory) {
    for (const size of Object.keys(costume.sizes)) {
      const snap = getRemainingOnDate({ costumeId: costume.id, size, onDate });
      if (snap.rented > 0 || snap.remaining <= LOW_STOCK_THRESHOLD) {
        rows.push({
          onDate,
          dateLabel: `${month}/${day}`,
          costumeId: costume.id,
          costumeName: costume.name,
          size,
          ...snap
        });
      }
    }
  }

  for (const acc of accessories) {
    const snap = getAccessoryRemainingOnDate({ accessoryId: acc.id, onDate });
    if (snap.rented > 0 || snap.remaining <= LOW_STOCK_THRESHOLD) {
      rows.push({
        onDate,
        dateLabel: `${month}/${day}`,
        costumeId: null,
        costumeName: acc.name,
        size: "配件",
        isAccessory: true,
        ...snap
      });
    }
  }

  return rows.sort((a, b) => a.remaining - b.remaining);
}

export function getAccessoryRemainingOnDate({ accessoryId, onDate }) {
  const acc = accessories.find(a => a.id === accessoryId);
  const totalStock = acc?.totalStock ?? 0;
  const day = parseDate(onDate);
  let rented = 0;

  if (day) {
    for (const order of collectActiveOrders()) {
      if (order.status === "完成") continue;
      for (const item of order.items) {
        const w = getRentalWindow(item.performanceDate, order.nDays);
        if (!dateInWindow(day, w)) continue;
        const costume = getCostumeById(item.costumeId);
        if (costume?.sharedAccessories?.includes(accessoryId)) {
          rented += item.quantity;
        }
      }
    }
  }

  const remaining = Math.max(0, totalStock - rented);
  return {
    accessoryId,
    totalStock,
    rented,
    remaining,
    ...getStockLevel(remaining)
  };
}

export function getAccessoryRemaining({ accessoryId, performanceDate, nDays = DEFAULT_N_DAYS }) {
  const acc = accessories.find(a => a.id === accessoryId);
  const totalStock = acc?.totalStock ?? 0;
  const window = getRentalWindow(performanceDate, nDays);
  let rented = 0;

  if (window) {
    for (const order of collectActiveOrders()) {
      if (order.status === "完成") continue;
      for (const item of order.items) {
        const costume = getCostumeById(item.costumeId);
        if (!costume?.sharedAccessories?.includes(accessoryId)) continue;
        const itemWindow = getRentalWindow(item.performanceDate, order.nDays);
        if (windowsOverlap(window, itemWindow)) rented += item.quantity;
      }
    }
  }

  const remaining = Math.max(0, totalStock - rented);
  return {
    accessoryId,
    name: acc?.name,
    totalStock,
    rented,
    remaining,
    ...getStockLevel(remaining)
  };
}

/** 以「今天」為基準的各尺寸剩餘快照 */
export function getAllSizeSnapshots(referenceDate = new Date()) {
  const iso = referenceDate.toISOString().slice(0, 10);
  const rows = [];

  for (const costume of inventory) {
    for (const size of Object.keys(costume.sizes)) {
      rows.push(getRemainingOnDate({ costumeId: costume.id, size, onDate: iso }));
    }
  }
  return rows;
}

/** Dashboard：即將低庫存（剩餘 1～3） */
export function getLowStockAlerts(referenceDate = new Date()) {
  return getAllSizeSnapshots(referenceDate)
    .filter(s => s.remaining > 0 && s.remaining <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.remaining - b.remaining);
}

/** Dashboard：熱門尺寸不足（出租率 ≥ 50% 且剩餘 ≤ 5） */
export function getHotSizeShortages(referenceDate = new Date()) {
  return getAllSizeSnapshots(referenceDate)
    .filter(s => {
      if (s.totalStock <= 0) return false;
      const rate = s.rented / s.totalStock;
      return rate >= 0.5 && s.remaining <= 5;
    })
    .sort((a, b) => b.rented / b.totalStock - a.rented / a.totalStock);
}

/** Dashboard：即將售罄（剩餘 ≤ 1） */
export function getSellingOutSoon(referenceDate = new Date()) {
  return getAllSizeSnapshots(referenceDate)
    .filter(s => s.remaining <= 1)
    .sort((a, b) => a.remaining - b.remaining);
}

/** Dashboard：配件不足 */
export function getAccessoryWarnings(referenceDate = new Date()) {
  const iso = referenceDate.toISOString().slice(0, 10);
  return accessories
    .map(acc => {
      const snap = getAccessoryRemainingOnDate({ accessoryId: acc.id, onDate: iso });
      return { name: acc.name, ...snap };
    })
    .filter(s => s.remaining <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.remaining - b.remaining);
}

export function checkStockAvailable(order) {
  const normalized = normalizeOrder(order);
  const warnings = [];

  normalized.items.forEach(item => {
    const stock = getRemainingStock({
      costumeId: item.costumeId,
      size: item.size,
      performanceDate: item.performanceDate,
      nDays: normalized.nDays,
      excludeOrderId: normalized.id
    });

    if (stock.remaining < item.quantity) {
      warnings.push({
        costumeId: item.costumeId,
        costumeName: stock.costumeName,
        size: item.size,
        requested: item.quantity,
        remaining: stock.remaining,
        totalStock: stock.totalStock,
        rented: stock.rented
      });
    }
  });

  return warnings;
}

export function checkAccessoryAvailable(order) {
  const normalized = normalizeOrder(order);
  const warnings = [];
  const perf = normalized.items[0]?.performanceDate;

  for (const acc of accessories) {
    const snap = getAccessoryRemaining({
      accessoryId: acc.id,
      performanceDate: perf,
      nDays: normalized.nDays
    });

    const maxQty = Math.max(
      ...normalized.items
        .filter(i => getCostumeById(i.costumeId)?.sharedAccessories?.includes(acc.id))
        .map(i => i.quantity),
      0
    );

    if (maxQty > 0 && snap.remaining < maxQty) {
      warnings.push({
        accessory: acc.name,
        requested: maxQty,
        remaining: snap.remaining
      });
    }
  }

  return warnings;
}

export { inventory, accessories };
