// Walford V5.7.4 Squad Hub - Golden Boot player reload fix
// Add-on file. Requires squad-hub.sql.
// Adds team squads, head coach cards, player details, and Golden Boot scorer autocomplete.

(function () {
  let shDb = null;
  let shPlayers = [];
  let shCoaches = [];
  let shSelectedTeam = null;
  let shPositionFilter = "ALL";

  function shClient() {
    if (shDb) return shDb;

    const url =
      window.SUPABASE_URL ||
      (typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : "");

    const key =
      window.SUPABASE_ANON_KEY ||
      (typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : "");

    if (!window.supabase || !url || !key) return null;

    shDb = window.supabase.createClient(url, key);
    return shDb;
  }

  function shEsc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function shFallbackTeams() {
    try {
      if (Array.isArray(window.teams) && window.teams.length) return window.teams;
    } catch (e) {}
    return Array.isArray(window.FALLBACK_TEAMS) ? window.FALLBACK_TEAMS : [];
  }

  function shOwner(team) {
    try {
      if (typeof owner === "function") return owner(team) || "";
    } catch (e) {}
    const row = shFallbackTeams().find(t => t.team === team);
    return row ? row.owner || "" : "";
  }

  function shFlag(team) {
    try {
      if (typeof flag === "function") return flag(team) || "";
    } catch (e) {}
    const row = shFallbackTeams().find(t => t.team === team);
    return row ? row.flag || "" : "";
  }

  function shTeamList() {
    const fromPlayers = [...new Set(shPlayers.map(p => p.team))];
    const all = fromPlayers.length ? fromPlayers : shFallbackTeams().map(t => t.team);
    return all.slice().sort((a, b) => String(a).localeCompare(String(b)));
  }

  async function shLoad() {
    const db = shClient();
    if (!db) return;

    const [playersResult, coachesResult] = await Promise.all([
      db.from("squad_players")
      .select("*")
      .order("team", { ascending: true })
      .order("player_name", { ascending: true }),
      db.from("head_coaches").select("*").order("team", { ascending: true })
    ]);

    if (playersResult.error) {
      console.warn("Squad Hub could not load squad_players. Have you run squad-hub.sql?", playersResult.error);
      shPlayers = [];
    } else {
      shPlayers = playersResult.data || [];
    }

    if (coachesResult.error) {
      console.warn("Squad Hub could not load head_coaches. Have you run squad-hub.sql?", coachesResult.error);
      shCoaches = [];
    } else {
      shCoaches = coachesResult.data || [];
    }

    if (!shSelectedTeam) {
      const teams = shTeamList();
      shSelectedTeam = teams.includes("Brazil") ? "Brazil" : teams[0] || null;
    }
  }

  function shCoach(team) {
    return shCoaches.find(c => c.team === team) || null;
  }

  function shTeamPlayers(team) {
    return shPlayers
      .filter(p => p.team === team)
      .filter(p => shPositionFilter === "ALL" || p.position === shPositionFilter)
      .sort((a, b) => Number(a.squad_number) - Number(b.squad_number));
  }

  function shKeyPlayers(team) {
    return shPlayers
      .filter(p => p.team === team)
      .slice()
      .sort((a, b) => Number(b.international_goals || 0) - Number(a.international_goals || 0) || Number(b.caps || 0) - Number(a.caps || 0))
      .slice(0, 5);
  }

  function shFormatDate(value) {
    if (!value) return "-";
    const parts = String(value).split("-");
    if (parts.length !== 3) return value;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function shAge(value) {
    if (!value) return "";
    const dob = new Date(value + "T00:00:00");
    if (isNaN(dob)) return "";
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age > 0 ? `${age} yrs` : "";
  }

  function shTeamTabs() {
    return shTeamList().map(team => `
      <button type="button" class="${team === shSelectedTeam ? "active" : ""}" data-sh-team="${shEsc(team)}">
        ${shFlag(team)} ${shEsc(team)}
      </button>
    `).join("");
  }

  function shPositionTabs() {
    const positions = [
      ["ALL", "All"],
      ["GK", "GK"],
      ["DF", "Defenders"],
      ["MF", "Midfielders"],
      ["FW", "Forwards"]
    ];

    return positions.map(([key, label]) => `
      <button type="button" class="${key === shPositionFilter ? "active" : ""}" data-sh-pos="${key}">${label}</button>
    `).join("");
  }

  function shPlayerCard(player) {
    return `
      <button type="button" class="sh-player-card" data-sh-player="${player.id}">
        <span class="sh-number">${player.squad_number}</span>
        <div>
          <strong>${shEsc(player.player_name)}</strong>
          <span>${shEsc(player.position)} · ${shEsc(player.club || "Club TBC")}</span>
        </div>
        <em>${Number(player.caps || 0)} caps · ${Number(player.international_goals || 0)} goals</em>
      </button>
    `;
  }

  function shDetail(player) {
    if (!player) {
      return `
        <div class="sh-detail-empty">
          <strong>Select a player</strong>
          <span>Click any squad player to view full details.</span>
        </div>
      `;
    }

    return `
      <div class="sh-detail-card">
        <span>${shEsc(player.position)} · #${player.squad_number}</span>
        <h3>${shEsc(player.player_name)}</h3>
        <p><strong>Shirt:</strong> ${shEsc(player.shirt_name || "-")}</p>
        <p><strong>Club:</strong> ${shEsc(player.club || "-")}</p>
        <p><strong>DOB:</strong> ${shEsc(shFormatDate(player.dob))} ${shAge(player.dob) ? `(${shEsc(shAge(player.dob))})` : ""}</p>
        <p><strong>Height:</strong> ${player.height_cm ? `${player.height_cm} cm` : "-"}</p>
        <p><strong>Caps:</strong> ${Number(player.caps || 0)}</p>
        <p><strong>International goals:</strong> ${Number(player.international_goals || 0)}</p>
      </div>
    `;
  }

  function shRender() {
    let section = document.getElementById("squad-hub");
    if (!section) {
      section = document.createElement("section");
      section.id = "squad-hub";
      section.className = "section squad-hub";

      const groups = document.getElementById("groups");
      if (groups && groups.parentNode) {
        groups.parentNode.insertBefore(section, groups);
      } else {
        document.querySelector("main")?.appendChild(section);
      }
    }

    const team = shSelectedTeam || "Brazil";
    const coach = shCoach(team);
    const allTeamPlayers = shPlayers.filter(p => p.team === team);
    const filtered = shTeamPlayers(team);
    const keyPlayers = shKeyPlayers(team);
    const topPlayer = keyPlayers[0] || allTeamPlayers[0] || null;

    section.innerHTML = `
      <div class="section-title">
        <span>Squad Hub</span>
        <h2>Squads & Head Coaches</h2>
        <p>Explore each nation’s head coach, key players and full squad details.</p>
      </div>

      <div class="sh-tabs">${shTeamTabs()}</div>

      <div class="sh-grid">
        <aside class="sh-panel sh-team-summary">
          <div class="sh-team-title">
            <span>${shFlag(team)}</span>
            <div>
              <h3>${shEsc(team)}</h3>
              <p>Owner: <strong>${shEsc(shOwner(team) || "TBC")}</strong></p>
            </div>
          </div>

          <div class="sh-coach">
            <span>Head coach</span>
            <strong>${coach ? shEsc(coach.coach_name) : "Coach TBC"}</strong>
            <em>${coach ? shEsc(coach.nationality || "") : "Run squad-hub.sql to load coach details"}</em>
          </div>

          <div class="sh-stat-row">
            <article><span>Players</span><strong>${allTeamPlayers.length}</strong></article>
            <article><span>Most caps</span><strong>${allTeamPlayers.length ? Math.max(...allTeamPlayers.map(p => Number(p.caps || 0))) : 0}</strong></article>
            <article><span>Top int. goals</span><strong>${allTeamPlayers.length ? Math.max(...allTeamPlayers.map(p => Number(p.international_goals || 0))) : 0}</strong></article>
          </div>

          <h4>Key players</h4>
          <div class="sh-key-list">
            ${keyPlayers.map(p => `
              <button type="button" data-sh-player="${p.id}">
                <strong>${shEsc(p.player_name)}</strong>
                <span>${shEsc(p.position)} · ${Number(p.international_goals || 0)} int. goals</span>
              </button>
            `).join("") || "<p>No player data yet.</p>"}
          </div>
        </aside>

        <div class="sh-panel sh-squad-list">
          <div class="sh-toolbar">
            <h3>Full squad</h3>
            <div class="sh-pos-tabs">${shPositionTabs()}</div>
          </div>
          <div class="sh-players">
            ${filtered.map(shPlayerCard).join("") || "<p>No squad players found for this team.</p>"}
          </div>
        </div>

        <aside class="sh-panel sh-detail" id="shPlayerDetail">
          ${shDetail(topPlayer)}
        </aside>
      </div>
    `;

    section.querySelectorAll("[data-sh-team]").forEach(btn => {
      btn.addEventListener("click", () => {
        shSelectedTeam = btn.getAttribute("data-sh-team");
        shPositionFilter = "ALL";
        shRender();
        shUpgradeGoldenBoot();
      });
    });

    section.querySelectorAll("[data-sh-pos]").forEach(btn => {
      btn.addEventListener("click", () => {
        shPositionFilter = btn.getAttribute("data-sh-pos");
        shRender();
      });
    });

    section.querySelectorAll("[data-sh-player]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.getAttribute("data-sh-player"));
        const player = shPlayers.find(p => Number(p.id) === id);
        const target = document.getElementById("shPlayerDetail");
        if (target) target.innerHTML = shDetail(player);
      });
    });
  }

  function shUpgradeGoldenBoot() {
    const teamSelect = document.getElementById("gbTeam");
    const playerInput = document.getElementById("gbPlayer");
    if (!teamSelect || !playerInput || !shPlayers.length) return;

    let datalist = document.getElementById("gbPlayerOptions");
    if (!datalist) {
      datalist = document.createElement("datalist");
      datalist.id = "gbPlayerOptions";
      document.body.appendChild(datalist);
    }

    playerInput.setAttribute("list", "gbPlayerOptions");

    function updateOptions(clearPlayer) {
      const team = teamSelect.value;
      const options = shPlayers
        .filter(p => p.team === team)
        .slice()
        .sort((a, b) =>
          String(a.player_name || "").localeCompare(String(b.player_name || ""), "en", { sensitivity: "base" })
        )
        .map(p => `<option value="${shEsc(p.player_name)}" label="${shEsc(`#${p.squad_number || ""} ${p.position || ""} - ${p.club || ""}`)}"></option>`)
        .join("");

      datalist.innerHTML = options;
      datalist.dataset.walfordPlayerSorted = "yes";

      if (clearPlayer) {
        playerInput.value = "";
      }
    }

    // V5.7.4: Golden Boot re-renders after each save, so the player input is replaced.
    // Reconnect the list every time and reload suggestions on team/focus/click.
    teamSelect.onchange = () => updateOptions(true);
    playerInput.onfocus = () => updateOptions(false);
    playerInput.onclick = () => updateOptions(false);
    playerInput.oninput = () => {
      if (!playerInput.value.trim()) updateOptions(false);
    };

    updateOptions(false);
  }

  function shWatchGoldenBoot() {
    // V5.1 safety fix:
    // Do not observe the whole page. The previous observer could react to
    // its own datalist updates and make the browser think the page was stuck.
    // A few delayed checks are enough because Golden Boot loads after the page starts.
    setTimeout(shUpgradeGoldenBoot, 1000);
    setTimeout(shUpgradeGoldenBoot, 2500);
    setTimeout(shUpgradeGoldenBoot, 5000);
  }

  async function shStart() {
    await shLoad();
    shRender();
    shUpgradeGoldenBoot();
    shWatchGoldenBoot();

    // V5.7.4: Golden Boot replaces its form after saving a scorer.
    // This event reconnects the new player input to the squad datalist.
    window.addEventListener("walford:goldenboot-rendered", () => {
      setTimeout(shUpgradeGoldenBoot, 80);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(shStart, 2600);
  });
})();

// Walford V5.5.4 Alphabetical Player Datalist Safety Net
(function () {
  function sortDatalist(datalist) {
    if (!datalist) return;
    const options = Array.from(datalist.querySelectorAll("option"));
    if (options.length < 2) return;

    options
      .sort((a, b) =>
        String(a.value || a.textContent || "").localeCompare(String(b.value || b.textContent || ""), "en", { sensitivity: "base" })
      )
      .forEach(option => datalist.appendChild(option));

    datalist.dataset.walfordPlayerSorted = "yes";
  }

  function sortPlayerDatalists() {
    document.querySelectorAll("datalist").forEach(sortDatalist);
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(sortPlayerDatalists, 1200);
    setTimeout(sortPlayerDatalists, 3000);
    setTimeout(sortPlayerDatalists, 5500);
  });

  window.addEventListener("walford:goldenboot-rendered", () => {
    setTimeout(sortPlayerDatalists, 100);
  });
})();
