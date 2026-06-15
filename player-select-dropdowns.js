// Walford V5.7.6 Player Select Dropdowns
// Replaces fragile player datalist inputs with proper select dropdowns.
// This fixes the problem where the browser suggestion list closes before a player can be selected.

(function () {
  let psDb = null;
  let psPlayers = [];
  let psLoaded = false;
  let psLoading = false;

  function psClient() {
    if (psDb) return psDb;

    const url =
      window.SUPABASE_URL ||
      (typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : "");

    const key =
      window.SUPABASE_ANON_KEY ||
      (typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : "");

    if (!window.supabase || !url || !key) return null;

    psDb = window.supabase.createClient(url, key);
    return psDb;
  }

  function psEsc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function psLoadPlayers() {
    if (psLoaded || psLoading) return;
    psLoading = true;

    const db = psClient();
    if (!db) {
      psLoading = false;
      return;
    }

    const { data, error } = await db
      .from("squad_players")
      .select("team,player_name,shirt_name,position,club,squad_number")
      .order("team", { ascending: true })
      .order("player_name", { ascending: true });

    if (!error && data) {
      psPlayers = data;
      psLoaded = true;
    } else {
      console.warn("V5.7.6 could not load squad players for select dropdowns", error);
    }

    psLoading = false;
  }

  function psPlayersForTeam(team) {
    return psPlayers
      .filter(p => p.team === team)
      .slice()
      .sort((a, b) =>
        String(a.player_name || "").localeCompare(String(b.player_name || ""), "en", { sensitivity: "base" })
      );
  }

  function psOptions(team, currentValue) {
    const rows = psPlayersForTeam(team);

    let html = `<option value="">Select player...</option>`;

    // Keep manually typed/old value available so edit mode does not lose it.
    if (currentValue && !rows.some(p => p.player_name === currentValue)) {
      html += `<option value="${psEsc(currentValue)}" selected>${psEsc(currentValue)} — existing value</option>`;
    }

    html += rows.map(p => {
      const labelBits = [];
      if (p.squad_number) labelBits.push(`#${p.squad_number}`);
      if (p.position) labelBits.push(p.position);
      if (p.club) labelBits.push(p.club);
      const detail = labelBits.length ? ` — ${labelBits.join(" · ")}` : "";
      return `<option value="${psEsc(p.player_name)}" ${p.player_name === currentValue ? "selected" : ""}>${psEsc(p.player_name)}${psEsc(detail)}</option>`;
    }).join("");

    return html;
  }

  function psMakeSelectFromInput(input, teamSelect, className) {
    if (!input || !teamSelect) return null;
    if (input.tagName === "SELECT") return input;

    const select = document.createElement("select");
    select.id = input.id;
    select.name = input.name || input.id || "";
    select.className = `${input.className || ""} ${className || ""}`.trim();
    select.dataset.walfordPlayerSelect = "yes";
    select.innerHTML = psOptions(teamSelect.value, input.value || "");

    input.replaceWith(select);
    return select;
  }

  function psWireSelect(select, teamSelect) {
    if (!select || !teamSelect) return;
    if (select.dataset.walfordPlayerWired === "yes") return;

    function reload(clear) {
      const current = clear ? "" : select.value;
      select.innerHTML = psOptions(teamSelect.value, current);
    }

    teamSelect.addEventListener("change", () => reload(true));
    select.addEventListener("focus", () => reload(false));
    select.addEventListener("click", () => reload(false));

    select.dataset.walfordPlayerWired = "yes";
  }

  async function psUpgradeGoldenBoot() {
    await psLoadPlayers();
    if (!psPlayers.length) return;

    const teamSelect = document.getElementById("gbTeam");
    const playerField = document.getElementById("gbPlayer");
    if (!teamSelect || !playerField) return;

    const select = psMakeSelectFromInput(playerField, teamSelect, "gb-player-select");
    psWireSelect(select, teamSelect);
  }

  async function psUpgradeMatchScorerRows() {
    await psLoadPlayers();
    if (!psPlayers.length) return;

    document.querySelectorAll(".ms-scorer-row").forEach(row => {
      const teamSelect = row.querySelector(".msScorerTeam");
      const playerField = row.querySelector(".msScorerPlayer");
      if (!teamSelect || !playerField) return;

      const select = psMakeSelectFromInput(playerField, teamSelect, "ms-player-select");
      psWireSelect(select, teamSelect);

      // Remove datalist remnants for this row so the browser stops trying to show suggestions.
      row.querySelectorAll("datalist").forEach(dl => dl.remove());
    });
  }

  async function psUpgradeAll() {
    await psUpgradeGoldenBoot();
    await psUpgradeMatchScorerRows();
  }

  function psWatchMatchRows() {
    const container = document.getElementById("msScorerRows");
    if (!container || container.dataset.playerSelectWatch === "yes") return;

    const observer = new MutationObserver(() => {
      setTimeout(psUpgradeMatchScorerRows, 50);
    });

    observer.observe(container, { childList: true, subtree: false });
    container.dataset.playerSelectWatch = "yes";
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(psUpgradeAll, 1200);
    setTimeout(psUpgradeAll, 3000);
    setTimeout(() => {
      psUpgradeAll();
      psWatchMatchRows();
    }, 5200);
  });

  window.addEventListener("walford:goldenboot-rendered", () => {
    setTimeout(psUpgradeGoldenBoot, 80);
  });

  window.addEventListener("click", event => {
    const addButton = event.target.closest("#msAddScorer");
    if (addButton) setTimeout(psUpgradeMatchScorerRows, 120);
  });
})();
