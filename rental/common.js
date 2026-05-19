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
