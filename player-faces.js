"use strict";

// Walford V6 Player Faces

(function () {
  let timer = null;

  function initials(name) {
    const cleaned = String(name || "").replace(/\s+/g, " ").trim();
    if (!cleaned) return "?";

    const parts = cleaned.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
  }

  function hash(text) {
    let value = 0;
    const str = String(text || "");

    for (let i = 0; i < str.length; i += 1) {
      value = (value << 5) - value + str.charCodeAt(i);
      value |= 0;
    }

    return Math.abs(value);
  }

  function avatarHtml(name) {
    const tone = hash(name) % 8;

    return `
      <span class="walford-player-face walford-player-face-${tone}" aria-hidden="true">
        ${WC.dom.esc(initials(name))}
      </span>
    `;
  }

  function installCss() {
    if (WC.dom.el("walfordPlayerFacesCss")) return;

    const style = document.createElement("style");
    style.id = "walfordPlayerFacesCss";
    style.textContent = `
      .walford-player-with-face {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .walford-player-face {
        width: 38px;
        height: 38px;
        min-width: 38px;
        min-height: 38px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.78rem;
        font-weight: 950;
        letter-spacing: 0.02em;
        color: #ffffff;
        border: 2px solid rgba(255,255,255,0.28);
        box-shadow: 0 8px 18px rgba(0,0,0,0.25);
        background: linear-gradient(135deg, #243b55, #141e30);
      }

      .walford-player-face-0 { background: linear-gradient(135deg, #1f4e79, #0d2135); }
      .walford-player-face-1 { background: linear-gradient(135deg, #7a3f98, #241332); }
      .walford-player-face-2 { background: linear-gradient(135deg, #0f766e, #062f2c); }
      .walford-player-face-3 { background: linear-gradient(135deg, #9a3412, #3b1205); }
      .walford-player-face-4 { background: linear-gradient(135deg, #365314, #142006); }
      .walford-player-face-5 { background: linear-gradient(135deg, #7f1d1d, #2a0909); }
      .walford-player-face-6 { background: linear-gradient(135deg, #1e3a8a, #111827); }
      .walford-player-face-7 { background: linear-gradient(135deg, #854d0e, #271602); }

      td.walford-player-cell {
        vertical-align: middle;
      }
    `;

    document.head.appendChild(style);
  }

  function wrapCell(cell) {
    if (!cell || cell.dataset.playerFaceDone === "1") return;

    const name = String(cell.textContent || "").replace(/\s+/g, " ").trim();

    if (!name || name.length < 3) return;
    if (/^(player|team|goals|date|match code)$/i.test(name)) return;

    cell.dataset.playerFaceDone = "1";
    cell.classList.add("walford-player-cell");

    cell.innerHTML = `
      <span class="walford-player-with-face">
        ${avatarHtml(name)}
        <span>${WC.dom.esc(name)}</span>
      </span>
    `;
  }

  function findPlayerColumn(table) {
    const headers = WC.dom.qa("thead th", table);
    if (!headers.length) return -1;

    return headers.findIndex(header =>
      String(header.textContent || "").toLowerCase().includes("player")
    );
  }

  function applyToTable(table) {
    const playerColumn = findPlayerColumn(table);
    if (playerColumn < 0) return;

    WC.dom.qa("tbody tr", table).forEach(row => {
      const cells = Array.from(row.children);
      wrapCell(cells[playerColumn]);
    });
  }

  function apply() {
    installCss();

    [
      WC.dom.el("golden-boot"),
      WC.dom.el("adminAuditPanel")
    ].filter(Boolean).forEach(area => {
      WC.dom.qa("table", area).forEach(applyToTable);
    });

    WC.dom.qa(".gb-player-name, .golden-boot-player, [data-player-name]")
      .forEach(wrapCell);
  }

  function scheduleApply() {
    clearTimeout(timer);
    timer = setTimeout(apply, 250);
  }

  function watchForTableChanges() {
    if (!document.body) return;

    const observer = new MutationObserver(scheduleApply);

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  WC.events.once(document, "DOMContentLoaded", () => {
    [1500, 3000, 5000].forEach(ms => setTimeout(apply, ms));
    watchForTableChanges();
  });

  WC.events.on(window, "hashchange", () => {
    [500, 1500, 3000].forEach(ms => setTimeout(apply, ms));
  });
})();
