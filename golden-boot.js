// Walford V4.9 Golden Boot
// Add-on file. Requires goal_scorers table from golden-boot.sql.
// Adds Golden Boot leaderboard and admin scorer entry.

(function () {
  let gbDb = null;
  let gbSession = null;
  let gbRows = [];

  function gbClient() {
    if (gbDb) return gbDb;

    const url =
      window.SUPABASE_URL ||
      (typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : "");

    const key =
      window.SUPABASE_ANON_KEY ||
      (typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : "");

    if (!window.supabase || !url || !key) return null;

    gbDb = window.supabase.createClient(url, key);
    return gbDb;
  }

  function gbTeams() {
    try {
      if (Array.isArray(window.teams) && window.teams.length) return window.teams;
    } catch (e) {}
    return Array.isArray(window.FALLBACK_TEAMS) ? window.FALLBACK_TEAMS : [];
  }

  function gbTeamOptions() {
    return gbTeams()
      .slice()
      .sort((a, b) => String(a.team).localeCompare(String(b.team)))
      .map(t => `<option value="${gbEsc(t.team)}">${gbEsc(t.flag || "")} ${gbEsc(t.team)} — ${gbEsc(t.owner || "")}</option>`)
      .join("");
  }

  function gbEsc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function gbFlag(teamName) {
    try {
      if (typeof flag === "function") return flag(teamName) || "";
    } catch (e) {}
    const row = gbTeams().find(t => t.team === teamName);
    return row ? row.flag || "" : "";
  }

  function gbOwner(teamName) {
    try {
      if (typeof owner === "function") return owner(teamName) || "";
    } catch (e) {}
    const row = gbTeams().find(t => t.team === teamName);
    return row ? row.owner || "" : "";
  }

  async function gbLoad() {
    const db = gbClient();
    if (!db) return;

    const session = await db.auth.getSession();
    gbSession = session?.data?.session || null;

    const { data, error } = await db
      .from("goal_scorers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Golden Boot could not load goal_scorers. Have you run golden-boot.sql?", error);
      gbRows = [];
      return;
    }

    gbRows = data || [];
  }

  function gbTotals() {
    const map = new Map();

    for (const row of gbRows) {
      const key = `${row.player}|||${row.team}`;
      const existing = map.get(key) || {
        player: row.player,
        team: row.team,
        goals: 0,
        entries: 0
      };
      existing.goals += Number(row.goals || 0);
      existing.entries += 1;
      map.set(key, existing);
    }

    return Array.from(map.values())
      .sort((a, b) => b.goals - a.goals || a.player.localeCompare(b.player));
  }

  function gbLatest() {
    return gbRows.slice(0, 6);
  }

  function gbPodium(totals) {
    if (!totals.length) {
      return `
        <div class="gb-empty">
          <strong>No scorers entered yet</strong>
          <span>Add scorers through the admin form once match goals are known.</span>
        </div>
      `;
    }

    return totals.slice(0, 5).map((row, index) => `
      <article class="gb-player ${index === 0 ? "leader" : ""}">
        <div class="gb-rank">${index + 1}</div>
        <div>
          <strong>${gbEsc(row.player)}</strong>
          <span>${gbFlag(row.team)} ${gbEsc(row.team)} · ${gbEsc(gbOwner(row.team))}</span>
        </div>
        <em>${row.goals} goal${row.goals === 1 ? "" : "s"}</em>
      </article>
    `).join("");
  }

  function gbLatestList() {
    const latest = gbLatest();
    if (!latest.length) return `<p class="gb-muted">No scorer entries yet.</p>`;

    return latest.map(row => `
      <div class="gb-latest-row">
        <strong>${gbEsc(row.player)}</strong>
        <span>${gbFlag(row.team)} ${gbEsc(row.team)}</span>
        <em>${Number(row.goals || 0)} goal${Number(row.goals || 0) === 1 ? "" : "s"}</em>
      </div>
    `).join("");
  }

  function gbAdmin() {
    if (!gbSession) {
      return `<div class="gb-admin-note">Sign in using the main Admin button to add goal scorers.</div>`;
    }

    return `
      <form id="goldenBootForm" class="gb-form">
        <input id="gbMatchDate" type="date">
        <input id="gbMatchCode" type="text" placeholder="Match code, e.g. M73">
        <select id="gbTeam">${gbTeamOptions()}</select>
        <input id="gbPlayer" type="text" placeholder="Player name">
        <input id="gbGoals" type="number" min="1" value="1" placeholder="Goals">
        <button class="button gold" type="submit">Save scorer</button>
      </form>
      <p id="gbStatus" class="status"></p>
    `;
  }

  function gbInsert() {
    let section = document.getElementById("golden-boot");
    if (!section) {
      section = document.createElement("section");
      section.id = "golden-boot";
      section.className = "section golden-boot";

      const groups = document.getElementById("groups");
      if (groups && groups.parentNode) {
        groups.parentNode.insertBefore(section, groups);
      } else {
        document.querySelector("main")?.appendChild(section);
      }
    }
    return section;
  }

  function gbRender() {
    const totals = gbTotals();
    const leader = totals[0];

    const section = gbInsert();
    section.innerHTML = `
      <div class="section-title">
        <span>Golden Boot Race</span>
        <h2>Golden Boot</h2>
        <p>Track individual goal scorers throughout the tournament.</p>
      </div>

      <div class="gb-grid">
        <div class="gb-panel gb-main">
          <div class="gb-trophy">⚽</div>
          <span>Current leader</span>
          <h3>${leader ? gbEsc(leader.player) : "No leader yet"}</h3>
          <p>${leader ? `${gbFlag(leader.team)} ${gbEsc(leader.team)} · ${gbEsc(gbOwner(leader.team))}` : "Add scorers to start the race."}</p>
          <strong>${leader ? `${leader.goals} goal${leader.goals === 1 ? "" : "s"}` : "0 goals"}</strong>
        </div>

        <div class="gb-panel">
          <h3>Leaderboard</h3>
          <div class="gb-list">${gbPodium(totals)}</div>
        </div>

        <div class="gb-panel">
          <h3>Latest scorer entries</h3>
          <div class="gb-latest">${gbLatestList()}</div>
        </div>
      </div>

      <div class="gb-panel gb-admin">
        <h3>Admin: Add goal scorer</h3>
        ${gbAdmin()}
      </div>
    `;

    const form = document.getElementById("goldenBootForm");
    if (form) form.addEventListener("submit", gbSave);
  }

  async function gbSave(event) {
    event.preventDefault();

    const db = gbClient();
    if (!db || !gbSession) return alert("Please sign in first.");

    const match_date = document.getElementById("gbMatchDate").value || null;
    const match_code = document.getElementById("gbMatchCode").value.trim() || null;
    const team = document.getElementById("gbTeam").value;
    const player = document.getElementById("gbPlayer").value.trim();
    const goals = Number(document.getElementById("gbGoals").value);

    if (!team || !player || !Number.isInteger(goals) || goals < 1) {
      return alert("Enter a team, player and valid number of goals.");
    }

    const { error } = await db.from("goal_scorers").insert({
      match_date,
      match_code,
      team,
      player,
      goals
    });

    if (error) {
      console.error(error);
      return alert("Could not save scorer. Check golden-boot.sql has been run.");
    }

    document.getElementById("gbPlayer").value = "";
    document.getElementById("gbGoals").value = 1;

    await gbLoad();
    gbRender();
  }

  async function gbStart() {
    await gbLoad();
    gbRender();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(gbStart, 2200);
  });
})();
