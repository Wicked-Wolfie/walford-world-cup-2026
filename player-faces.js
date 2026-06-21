// Walford V5.8.1 Player Faces
// Adds generated circular player avatars using initials.
// Safe alternative to real player photos.

(function () {
  function pfInitials(name) {
    const cleaned = String(name || "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleaned) return "?";

    const parts = cleaned.split(" ").filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
  }

  function pfHash(text) {
    let hash = 0;
    const str = String(text || "");

    for (let i = 0; i < str.length; i += 1) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }

    return Math.abs(hash);
  }

  function pfAvatarHtml(name) {
    const initials = pfInitials(name);
    const tone = pfHash(name) % 8;

    return `
      <span class="walford-player-face walford-player-face-${tone}" aria-hidden="true">
        ${initials}
      </span>
    `;
  }

  function pfInstallCss() {
    if (document.getElementById("walfordPlayerFacesCss")) return;

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

  function pfWrapCell(cell) {
    if (!cell || cell.dataset.playerFaceDone === "1") return;

    const name = String(cell.textContent || "")
      .replace(/\s+/g, " ")
      .trim();

    if (!name) return;
    if (name.length < 3) return;
    if (/^(player|team|goals|date|match code)$/i.test(name)) return;

    cell.dataset.playerFaceDone = "1";
    cell.classList.add("walford-player-cell");

    cell.innerHTML = `
      <span class="walford-player-with-face">
        ${pfAvatarHtml(name)}
        <span>${name}</span>
      </span>
    `;
  }

  function pfFindPlayerColumn(table) {
    const headers = Array.from(table.querySelectorAll("thead th"));

    if (!headers.length) return -1;

    return headers.findIndex(header =>
      String(header.textContent || "").toLowerCase().includes("player")
    );
  }

  function pfApplyToTable(table) {
    const playerColumn = pfFindPlayerColumn(table);

    if (playerColumn < 0) return;

    table.querySelectorAll("tbody tr").forEach(row => {
      const cells = Array.from(row.children);
      const cell = cells[playerColumn];

      if (cell) {
        pfWrapCell(cell);
      }
    });
  }

  function pfApply() {
    pfInstallCss();

    const areas = [
      document.getElementById("golden-boot"),
      document.getElementById("adminAuditPanel")
    ].filter(Boolean);

    areas.forEach(area => {
      area.querySelectorAll("table").forEach(pfApplyToTable);
    });

    document
      .querySelectorAll(".gb-player-name, .golden-boot-player, [data-player-name]")
      .forEach(element => {
        pfWrapCell(element);
      });
  }

  let pfTimer = null;

function pfScheduleApply() {
  clearTimeout(pfTimer);

  pfTimer = setTimeout(() => {
    pfApply();
  }, 250);
}

function pfWatchForTableChanges() {
  const target = document.body;

  if (!target) return;

  const observer = new MutationObserver(() => {
    pfScheduleApply();
  });

  observer.observe(target, {
    childList: true,
    subtree: true
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(pfApply, 1500);
  setTimeout(pfApply, 3000);
  setTimeout(pfApply, 5000);

  pfWatchForTableChanges();
});

window.addEventListener("hashchange", () => {
  setTimeout(pfApply, 500);
  setTimeout(pfApply, 1500);
  setTimeout(pfApply, 3000);
});
})();
