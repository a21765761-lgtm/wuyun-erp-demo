const NAV = [
  {
    id: "dashboard",
    href: "dashboard.html",
    label: "Dashboard",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`
  },
  {
    id: "active",
    href: "active-orders.html",
    label: "進行中訂單",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>`
  },
  {
    id: "history",
    href: "history-orders.html",
    label: "歷史訂單",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
  },
  {
    id: "calendar",
    href: "calendar.html",
    label: "庫存行事曆",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`
  }
];

export const STAGE_BG_HTML = `
  <div class="neon-grid"></div>
  <div class="neon-beam neon-beam-1"></div>
  <div class="neon-beam neon-beam-2"></div>
  <div class="spotlight spotlight-main"></div>
  <div class="spotlight spotlight-left"></div>
  <div class="spotlight spotlight-purple"></div>
  <div class="stage-vignette"></div>
`;

export function renderErpSidebar(activeId) {
  const links = NAV.map(item => `
    <a href="${item.href}" class="nav-item${activeId === item.id ? " active" : ""}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-text">${item.label}</span>
    </a>
  `).join("");

  return `
    <aside class="sidebar" id="erpSidebar">
      <div class="sidebar-brand sidebar-brand--compact">
        <p class="sidebar-eyebrow">訂單營運 · ERP</p>
        <a href="index.html" class="erp-logo-link" title="舞韻舞台總覽">
          <span class="erp-logo-mark">舞</span>
          <span class="erp-logo-text"><strong>舞韻</strong><small>ERP 後台</small></span>
        </a>
      </div>
      <nav class="sidebar-nav">
        <p class="nav-label">後台導航</p>
        ${links}
      </nav>
      <div class="sidebar-footer">
        <a href="rental/" class="nav-item erp-footer-link">
          <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></span>
          <span class="nav-text">客戶租借入口</span>
        </a>
      </div>
    </aside>
  `;
}

export function mountErpShell(activeId) {
  const stage = document.getElementById("erp-stage");
  if (stage) {
    stage.className = "stage-bg";
    stage.setAttribute("aria-hidden", "true");
    stage.innerHTML = STAGE_BG_HTML;
  }

  const slot = document.getElementById("erp-sidebar");
  if (slot) {
    slot.outerHTML = renderErpSidebar(activeId);
  }

  const dateEl = document.getElementById("erpHeaderDate");
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long"
    });
  }

  const toggle = document.getElementById("erpMenuToggle");
  const overlay = document.getElementById("erpSidebarOverlay");
  const sidebar = document.getElementById("erpSidebar");
  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      overlay?.classList.toggle("open");
    });
  }
  overlay?.addEventListener("click", () => {
    sidebar?.classList.remove("open");
    overlay.classList.remove("open");
  });
}
