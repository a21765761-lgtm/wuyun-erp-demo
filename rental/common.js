const KEYS = {
  date: "wuyun_rental_date",
  days: "wuyun_rental_days",
  cart: "wuyun_rental_cart"
};

export function getRentalContext() {
  return {
    performanceDate: sessionStorage.getItem(KEYS.date) || "",
    nDays: Number(sessionStorage.getItem(KEYS.days) || 3)
  };
}

export function setRentalContext({ performanceDate, nDays }) {
  if (performanceDate) sessionStorage.setItem(KEYS.date, performanceDate);
  if (nDays != null) sessionStorage.setItem(KEYS.days, String(nDays));
}

export function getCart() {
  try {
    return JSON.parse(sessionStorage.getItem(KEYS.cart) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  sessionStorage.setItem(KEYS.cart, JSON.stringify(cart));
}

export function cartCount() {
  return getCart().reduce((n, line) => n + line.quantity, 0);
}

export function formatMoney(n) {
  return `NT$ ${n.toLocaleString("zh-TW")}`;
}

export function formatDateLabel(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
}

function rentalMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(12, 0, 0, 0);
  return d;
}

function rentalMaxDate() {
  const d = rentalMinDate();
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function isoFromParts(y, m, d) {
  if (!y || !m || !d) return "";
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseIso(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

/** 年 / 月 / 日 下拉選單（最早為明天，最遠一年內） */
export function initPerformanceDatePicker({ yearEl, monthEl, dayEl, initialIso = "" }) {
  const min = rentalMinDate();
  const max = rentalMaxDate();

  const fillSelect = (el, items, placeholder) => {
    el.innerHTML = `<option value="">${placeholder}</option>` +
      items.map(({ value, label }) => `<option value="${value}">${label}</option>`).join("");
  };

  const years = [];
  for (let y = min.getFullYear(); y <= max.getFullYear(); y++) {
    years.push({ value: String(y), label: `${y} 年` });
  }
  fillSelect(yearEl, years, "年");

  const monthRange = (year) => {
    const y = Number(year);
    let start = 1;
    let end = 12;
    if (y === min.getFullYear()) start = min.getMonth() + 1;
    if (y === max.getFullYear()) end = max.getMonth() + 1;
    const items = [];
    for (let m = start; m <= end; m++) {
      items.push({ value: String(m), label: `${m} 月` });
    }
    return items;
  };

  const dayRange = (year, month) => {
    const y = Number(year);
    const m = Number(month);
    if (!y || !m) return [];
    let start = 1;
    let end = daysInMonth(y, m);
    if (y === min.getFullYear() && m === min.getMonth() + 1) start = min.getDate();
    if (y === max.getFullYear() && m === max.getMonth() + 1) end = max.getDate();
    const items = [];
    for (let d = start; d <= end; d++) {
      items.push({ value: String(d), label: `${d} 日` });
    }
    return items;
  };

  const refreshMonths = () => {
    const prev = monthEl.value;
    fillSelect(monthEl, monthRange(yearEl.value), "月");
    if (prev && [...monthEl.options].some(o => o.value === prev)) monthEl.value = prev;
    else monthEl.value = "";
  };

  const refreshDays = () => {
    const prev = dayEl.value;
    fillSelect(dayEl, dayRange(yearEl.value, monthEl.value), "日");
    if (prev && [...dayEl.options].some(o => o.value === prev)) dayEl.value = prev;
    else dayEl.value = "";
  };

  yearEl.addEventListener("change", () => {
    refreshMonths();
    refreshDays();
  });
  monthEl.addEventListener("change", refreshDays);

  fillSelect(monthEl, [], "月");
  fillSelect(dayEl, [], "日");

  const initial = parseIso(initialIso);
  if (initial) {
    const d = new Date(initial.y, initial.m - 1, initial.d, 12, 0, 0);
    if (d >= min && d <= max) {
      yearEl.value = String(initial.y);
      refreshMonths();
      monthEl.value = String(initial.m);
      refreshDays();
      dayEl.value = String(initial.d);
    }
  }

  return {
    getValue() {
      return isoFromParts(yearEl.value, monthEl.value, dayEl.value);
    },
    focusFirstEmpty() {
      if (!yearEl.value) yearEl.focus();
      else if (!monthEl.value) monthEl.focus();
      else dayEl.focus();
    }
  };
}

const STEPS = [
  { id: 1, label: "表演日期", href: "index.html" },
  { id: 2, label: "選擇服裝", href: "costumes.html" },
  { id: 3, label: "購物車", href: "cart.html" },
  { id: 4, label: "送出訂單", href: "checkout.html" }
];

export function renderShell({ step, title, subtitle, showCart = true }) {
  const ctx = getRentalContext();
  const count = cartCount();

  const header = document.getElementById("rentalHeader");
  if (header) {
    header.innerHTML = `
      <a href="index.html" class="rental-logo" title="舞韻舞蹈服飾">
        <span class="rental-logo-mark">舞</span>
        <span class="rental-logo-text"><strong>舞韻</strong><small>客戶租借</small></span>
      </a>
      ${ctx.performanceDate ? `<span class="rental-date-pill">${formatDateLabel(ctx.performanceDate)} · ${ctx.nDays} 天</span>` : ""}
      <div class="rental-header-actions">
        ${showCart ? `<a href="cart.html" class="rental-cart-btn" aria-label="購物車">🛒${count > 0 ? `<span class="rental-cart-badge">${count}</span>` : ""}</a>` : ""}
      </div>
    `;
  }

  const stepsEl = document.getElementById("rentalSteps");
  if (stepsEl) {
    stepsEl.innerHTML = STEPS.map(s => {
      const state = s.id < step ? "done" : s.id === step ? "active" : "";
      const canLink = s.id <= step || (s.id === 2 && step >= 2);
      const href = canLink ? s.href : "#";
      return `<a href="${href}" class="rental-step ${state}"><span class="rental-step-num">${s.id}</span><span class="rental-step-label">${s.label}</span></a>`;
    }).join("");
  }

  const hero = document.getElementById("rentalHero");
  if (hero && title) {
    hero.innerHTML = `<h1>${title}</h1>${subtitle ? `<p>${subtitle}</p>` : ""}`;
  }
}

export function requireDate() {
  if (!getRentalContext().performanceDate) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

export function requireCart() {
  if (getCart().length === 0) {
    window.location.href = "costumes.html";
    return false;
  }
  return true;
}
