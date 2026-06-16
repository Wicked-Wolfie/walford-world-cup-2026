// Walford V5.8.1 Golden Boot - real squad_players columns only
// Integrated version: no datalist, no add-on replacement script.
// Includes leaderboard, add/edit/delete admin tools, and direct squad player dropdowns.

(function () {
  let gbDb = null;
  let gbSession = null;
  let gbRows = [];
  let gbPlayers = [];
  let gbEditingId = null;

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

  function gbEsc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }



  function gbCanonTeam(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, "and")
      .replace(/[^a-zA-Z0-9 ]/g, " ")
      .replace(/\b(fc|cf|the)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  const GB_TEAM_CODE_ALIASES = {
    "MX": ["MEX", "MX"],
    "KR": ["KOR"],
    "CZ": ["CZE"],
    "ZA": ["RSA", "SAF"],
    "CH": ["SUI"],
    "CA": ["CAN"],
    "QA": ["QAT"],
    "BA": ["BIH"],
    "GB-SCT": ["SCO"],
    "MA": ["MAR"],
    "BR": ["BRA"],
    "HT": ["HTI"],
    "US": ["USA", "US"],
    "AU": ["AUS"],
    "TR": ["TUR"],
    "PY": ["PAR"],
    "DE": ["GER"],
    "CI": ["CIV", "ICO"],
    "EC": ["ECU"],
    "CW": ["CUW"],
    "SE": ["SWE"],
    "JP": ["JPN"],
    "NL": ["NED"],
    "TN": ["TUN"],
    "BE": ["BEL"],
    "EG": ["EGY"],
    "IR": ["IRI"],
    "NZ": ["NZL"],
    "ES": ["ESP"],
    "CV": ["CPV", "CV"],
    "SA": ["KSA"],
    "UY": ["URU"],
    "FR": ["FRA"],
    "SN": ["SEN"],
    "IQ": ["IRQ"],
    "NO": ["NOR"],
    "AR": ["ARG"],
    "DZ": ["DZA", "ALG"],
    "AT": ["AUT"],
    "JO": ["JOR"],
    "PT": ["POR"],
    "CD": ["COD", "DRC"],
    "UZ": ["UZB"],
    "CO": ["COL"],
    "GB-ENG": ["ENG"],
    "HR": ["CRO"],
    "GH": ["GHA"],
    "PA": ["PAN"]
  };

  const GB_TEAM_NAME_ALIASES = {
    "mexico": ["mexico"],
    "south korea": ["south korea", "korea republic", "republic of korea", "korea"],
    "czechia": ["czechia", "czech republic"],
    "south africa": ["south africa"],
    "switzerland": ["switzerland"],
    "canada": ["canada"],
    "qatar": ["qatar"],
    "bosnia and herzegovina": ["bosnia and herzegovina", "bosnia herzegovina", "bosnia"],
    "scotland": ["scotland"],
    "morocco": ["morocco"],
    "brazil": ["brazil"],
    "haiti": ["haiti"],
    "united states": ["united states", "usa", "u s a", "united states of america", "usmnt"],
    "australia": ["australia"],
    "turkiye": ["turkiye", "turkey", "türkiye"],
    "paraguay": ["paraguay"],
    "germany": ["germany"],
    "ivory coast": ["ivory coast", "cote d ivoire", "cote divoire", "côte d ivoire"],
    "ecuador": ["ecuador"],
    "curacao": ["curacao", "curaçao"],
    "sweden": ["sweden"],
    "japan": ["japan"],
    "netherlands": ["netherlands", "holland"],
    "tunisia": ["tunisia"],
    "belgium": ["belgium"],
    "egypt": ["egypt"],
    "iran": ["iran", "iran islamic republic"],
    "new zealand": ["new zealand"],
    "spain": ["spain"],
    "cape verde": ["cape verde", "cabo verde"],
    "saudi arabia": ["saudi arabia", "saudi"],
    "uruguay": ["uruguay"],
    "france": ["france"],
    "senegal": ["senegal"],
    "iraq": ["iraq"],
    "norway": ["norway"],
    "argentina": ["argentina"],
    "algeria": ["algeria"],
    "austria": ["austria"],
    "jordan": ["jordan"],
    "portugal": ["portugal"],
    "dr congo": ["dr congo", "d r congo", "congo dr", "democratic republic of congo", "congo democratic republic"],
    "uzbekistan": ["uzbekistan"],
    "colombia": ["colombia"],
    "england": ["england"],
    "croatia": ["croatia"],
    "ghana": ["ghana"],
    "panama": ["panama"]
  };

 function gbTeamCode(teamName) {
  const row = gbFindTeamRow(teamName);
  const code = gbTeamCodeFromRow(row);
  return code;
}

function gbExpectedCodes(teamName) {
  const teamKey = gbCanonTeam(teamName);
  const allocationCode = gbTeamCode(teamName);
  const codes = new Set();

  if (allocationCode) codes.add(allocationCode);

  // Add direct aliases for the allocation/site code.
  (GB_TEAM_CODE_ALIASES[allocationCode] || []).forEach(code => codes.add(code));

  // Add reverse aliases too, e.g. if stored code is USA, also allow US;
  // if stored code is SUI, also allow CH.
  Object.entries(GB_TEAM_CODE_ALIASES).forEach(([siteCode, fifaCodes]) => {
    if (allocationCode === siteCode || fifaCodes.includes(allocationCode)) {
      codes.add(siteCode);
      fifaCodes.forEach(code => codes.add(code));
    }
  });

  // Team-name fallbacks for cases where gbTeamCode() is blank or inconsistent.
  const byName = {
    "united states": ["USA", "US"],
    "switzerland": ["SUI", "CH"],
    "mexico": ["MEX", "MX"],
    "south korea": ["KOR", "KR"],
    "czechia": ["CZE", "CZ"],
    "south africa": ["RSA", "ZA"],
    "canada": ["CAN", "CA"],
    "qatar": ["QAT", "QA"],
    "bosnia and herzegovina": ["BIH", "BA"],
    "scotland": ["SCO", "GB-SCT"],
    "morocco": ["MAR", "MA"],
    "brazil": ["BRA", "BR"],
    "haiti": ["HTI", "HT"],
    "australia": ["AUS", "AU"],
    "turkiye": ["TUR", "TR"],
    "paraguay": ["PAR", "PY"],
    "germany": ["GER", "DE"],
    "ivory coast": ["CIV", "CI"],
    "ecuador": ["ECU", "EC"],
    "curacao": ["CUW", "CW"],
    "sweden": ["SWE", "SE"],
    "japan": ["JPN", "JP"],
    "netherlands": ["NED", "NL"],
    "tunisia": ["TUN", "TN"],
    "belgium": ["BEL", "BE"],
    "egypt": ["EGY", "EG"],
    "iran": ["IRI", "IR"],
    "new zealand": ["NZL", "NZ"],
    "spain": ["ESP", "ES"],
    "cape verde": ["CPV", "CV"],
    "saudi arabia": ["KSA", "SA"],
    "uruguay": ["URU", "UY"],
    "france": ["FRA", "FR"],
    "senegal": ["SEN", "SN"],
    "iraq": ["IRQ", "IQ"],
    "norway": ["NOR", "NO"],
    "argentina": ["ARG", "AR"],
    "algeria": ["DZA", "DZ", "ALG"],
    "austria": ["AUT", "AT"],
    "jordan": ["JOR", "JO"],
    "portugal": ["POR", "PT"],
    "dr congo": ["COD", "CD", "DRC"],
    "uzbekistan": ["UZB", "UZ"],
    "colombia": ["COL", "CO"],
    "england": ["ENG", "GB-ENG"],
    "croatia": ["CRO", "HR"],
    "ghana": ["GHA", "GH"],
    "panama": ["PAN", "PA"]
  };

  Object.entries(byName).forEach(([name, nameCodes]) => {
    const aliases = [name, ...(GB_TEAM_NAME_ALIASES[name] || [])].map(gbCanonTeam);
    if (aliases.includes(teamKey)) {
      nameCodes.forEach(code => codes.add(code));
    }
  });

  return Array.from(codes).filter(Boolean);
}

  function gbTeamKeys(team) {
    const key = gbCanonTeam(team);
    const keys = new Set([key]);
    (GB_TEAM_NAME_ALIASES[key] || []).forEach(name => keys.add(gbCanonTeam(name)));

    // Also map common code-looking team values.
    const upper = String(team || "").toUpperCase().trim();
    Object.entries(GB_TEAM_CODE_ALIASES).forEach(([siteCode, fifaCodes]) => {
      if (upper === siteCode || fifaCodes.includes(upper)) {
        const siteTeam = gbTeams().find(t => String(t.code || "").toUpperCase() === siteCode);
        if (siteTeam) {
          keys.add(gbCanonTeam(siteTeam.team));
          (GB_TEAM_NAME_ALIASES[gbCanonTeam(siteTeam.team)] || []).forEach(name => keys.add(gbCanonTeam(name)));
        }
      }
    });

    return Array.from(keys);
  }

  function gbTeamMatches(a, b) {
    const aKeys = gbTeamKeys(a);
    const bKeys = gbTeamKeys(b);
    return aKeys.some(key => bKeys.includes(key));
  }

function gbCleanTeamLabel(value) {
  const raw = String(value || "").trim();
  const parts = raw.split(/\s+/);

  if (parts.length > 1) {
    const first = parts[0].toUpperCase();
    const knownCodes = new Set();

    Object.entries(GB_TEAM_CODE_ALIASES).forEach(([siteCode, fifaCodes]) => {
      knownCodes.add(siteCode);
      fifaCodes.forEach(code => knownCodes.add(code));
    });

    if (knownCodes.has(first)) {
      return parts.slice(1).join(" ").trim();
    }
  }

  return raw;
}

function gbPlayerMatchesTeam(player, teamName) {
  const expectedCodes = gbExpectedCodes(teamName).map(code =>
    String(code || "").toUpperCase().trim()
  );

  const rawCode = String(
    player.team_code ||
    player.country_code ||
    player.code ||
    ""
  ).toUpperCase().trim();

  if (rawCode && expectedCodes.includes(rawCode)) return true;

  const playerTeam = String(player.team || player.team_name || player.country || "").trim();
  const playerTeamUpper = playerTeam.toUpperCase().trim();

  if (expectedCodes.some(code =>
    playerTeamUpper === code ||
    playerTeamUpper.startsWith(code + " ") ||
    playerTeamUpper.startsWith(code + "-") ||
    playerTeamUpper.includes("(" + code + ")")
  )) {
    return true;
  }
const selectedKey = gbCanonTeam(gbCleanTeamLabel(teamName));
const playerKeyRaw = gbCanonTeam(playerTeam);
const playerKeyClean = gbCanonTeam(gbCleanTeamLabel(playerTeam));

if (selectedKey === "united states") {
  if (
    playerKeyRaw === "united states" ||
    playerKeyClean === "united states" ||
    playerKeyRaw === "usa" ||
    playerKeyClean === "usa" ||
    playerKeyRaw.includes("united states") ||
    playerKeyRaw.includes("usa")
  ) {
    return true;
  }
}

if (selectedKey === "spain") {
  if (
    playerKeyRaw === "spain" ||
    playerKeyClean === "spain" ||
    playerKeyRaw === "esp" ||
    playerKeyClean === "esp" ||
    playerKeyRaw.includes("spain")
  ) {
    return true;
  }
}
  
  const cleanPlayerTeam = gbCleanTeamLabel(playerTeam);
  const cleanSelectedTeam = gbCleanTeamLabel(teamName);

  if (gbTeamMatches(cleanPlayerTeam, cleanSelectedTeam)) return true;

  const wantedNames = gbTeamKeys(cleanSelectedTeam);
  const playerTeamKey = gbCanonTeam(cleanPlayerTeam);

  if (wantedNames.includes(playerTeamKey)) return true;

  return wantedNames.some(nameKey =>
    playerTeamKey === nameKey ||
    playerTeamKey.startsWith(nameKey + " ") ||
    nameKey.startsWith(playerTeamKey + " ")
  );
}
  function gbPlayersForTeam(team) {
  const rows = gbPlayers
    .filter(p => gbPlayerMatchesTeam(p, team))
    .slice()
    .sort((a, b) => String(a.player_name || "").localeCompare(String(b.player_name || ""), "en", { sensitivity: "base" }));

  if (gbCanonTeam(team).includes("united states")) {
    console.log("GB USA DEBUG selected team:", team);
    console.log("GB USA DEBUG expected codes:", gbExpectedCodes(team));
    console.log("GB USA DEBUG possible USA rows:", gbPlayers.filter(p => {
      const blob = JSON.stringify(p).toLowerCase();
      return blob.includes("usa") || blob.includes("united states") || blob.includes('"us"');
    }));
    console.log("GB USA DEBUG matched rows:", rows);
  }

  return rows;
}

  function gbPlayerOptions(team, selected = "") {
    const rows = gbPlayersForTeam(team);
    let html = `<option value="">Select player...</option>`;

    if (!rows.length) {
      html += `<option value="">No squad players found for ${gbEsc(team)} (${gbEsc(gbExpectedCodes(team).join(", "))})</option>`;
      return html;
    }

    if (selected && !rows.some(p => p.player_name === selected)) {
      html += `<option value="${gbEsc(selected)}" selected>${gbEsc(selected)} — existing value</option>`;
    }

    html += rows.map(p => {
      const bits = [];
      if (p.squad_number) bits.push(`#${p.squad_number}`);
      if (p.position) bits.push(p.position);
      if (p.club) bits.push(p.club);
      const detail = bits.length ? ` — ${bits.join(" · ")}` : "";
      return `<option value="${gbEsc(p.player_name)}" ${p.player_name === selected ? "selected" : ""}>${gbEsc(p.player_name)}${gbEsc(detail)}</option>`;
    }).join("");

    return html;
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

  function gbDateLabel(value) {
    if (!value) return "";
    const parts = String(value).split("-");
    if (parts.length !== 3) return value;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  async function gbLoad() {
    const db = gbClient();
    if (!db) return;

    const session = await db.auth.getSession();
    gbSession = session?.data?.session || null;

    const scorerResult = await db
      .from("goal_scorers")
      .select("*")
      .order("created_at", { ascending: false });

    if (scorerResult.error) {
      console.warn("Golden Boot could not load goal_scorers.", scorerResult.error);
      gbRows = [];
    } else {
      gbRows = scorerResult.data || [];
    }

    const playerResult = await db
  .from("squad_players")
  .select("*")
  .order("team", { ascending: true })
  .order("player_name", { ascending: true })
  .range(0, 1999);

    if (playerResult.error) {
      console.warn("Golden Boot could not load squad_players for player dropdown.", playerResult.error);
      gbPlayers = [];
    } else {
      gbPlayers = playerResult.data || [];
    }
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
    const latest = gbRows.slice(0, 6);
    if (!latest.length) return `<p class="gb-muted">No scorer entries yet.</p>`;

    return latest.map(row => `
      <div class="gb-latest-row">
        <strong>${gbEsc(row.player)}</strong>
        <span>${gbFlag(row.team)} ${gbEsc(row.team)}${row.match_code ? ` · ${gbEsc(row.match_code)}` : ""}</span>
        <em>${Number(row.goals || 0)} goal${Number(row.goals || 0) === 1 ? "" : "s"}</em>
      </div>
    `).join("");
  }

  function gbAdminList() {
    if (!gbSession) return "";

    if (!gbRows.length) {
      return `
        <div class="gb-admin-list">
          <h4>Recent scorer entries</h4>
          <p class="gb-muted">No scorer entries to edit yet.</p>
        </div>
      `;
    }

    return `
      <div class="gb-admin-list">
        <h4>Recent scorer entries</h4>
        <div class="gb-admin-rows">
          ${gbRows.slice(0, 12).map(row => `
            <div class="gb-admin-row" data-gb-row="${row.id}">
              <div>
                <strong>${gbEsc(row.player)}</strong>
                <span>${gbFlag(row.team)} ${gbEsc(row.team)}${row.match_code ? ` · ${gbEsc(row.match_code)}` : ""}${row.match_date ? ` · ${gbEsc(gbDateLabel(row.match_date))}` : ""}</span>
              </div>
              <em>${Number(row.goals || 0)} goal${Number(row.goals || 0) === 1 ? "" : "s"}</em>
              <div class="gb-admin-buttons">
                <button type="button" class="button dark gb-edit" data-gb-edit="${row.id}">Edit</button>
                <button type="button" class="button dark gb-delete" data-gb-delete="${row.id}">Delete</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

function gbTeamName(row) {
  const raw = String(
    row?.team ||
    row?.name ||
    row?.country ||
    row?.team_name ||
    row?.nation ||
    ""
  ).trim();

  const parts = raw.split(/\s+/);
  if (parts.length > 1) {
    const first = parts[0].toUpperCase();
    const knownCodes = new Set();

    Object.entries(GB_TEAM_CODE_ALIASES).forEach(([siteCode, fifaCodes]) => {
      knownCodes.add(siteCode);
      fifaCodes.forEach(code => knownCodes.add(code));
    });

    if (knownCodes.has(first)) {
      return parts.slice(1).join(" ").trim();
    }
  }

  return raw;
}

function gbTeamCodeFromRow(row) {
  return String(
    row?.code ||
    row?.team_code ||
    row?.country_code ||
    row?.iso ||
    ""
  ).toUpperCase().trim();
}

function gbTeamFlagFromRow(row) {
  return String(row?.flag || row?.emoji || "");
}

function gbTeamOwnerFromRow(row) {
  return String(row?.owner || row?.manager || row?.player || "");
}

function gbFindTeamRow(teamName) {
  const wanted = gbCanonTeam(gbCleanTeamLabel(teamName));

  return gbTeams().find(t => {
    const rawName = String(t?.team || t?.name || t?.country || t?.team_name || t?.nation || "");
    const cleanName = gbTeamName(t);
    return gbCanonTeam(rawName) === wanted || gbCanonTeam(cleanName) === wanted;
  }) || null;
}
  
function gbTeams() {
  if (typeof teams !== "undefined" && Array.isArray(teams)) return teams;
  if (typeof window.teams !== "undefined" && Array.isArray(window.teams)) return window.teams;
  if (typeof allocations !== "undefined" && Array.isArray(allocations)) return allocations;
  if (typeof window.allocations !== "undefined" && Array.isArray(window.allocations)) return window.allocations;
  if (typeof TEAMS !== "undefined" && Array.isArray(TEAMS)) return TEAMS;
  if (typeof window.TEAMS !== "undefined" && Array.isArray(window.TEAMS)) return window.TEAMS;
  return [];
}
  
function gbSortedTeams() {
  return gbTeams()
    .slice()
    .filter(t => gbTeamName(t))
    .sort((a, b) => gbTeamName(a).localeCompare(gbTeamName(b), "en", { sensitivity: "base" }));
}

function gbTeamOptions(selected = "") {
  return gbSortedTeams().map(t => {
    const name = gbTeamName(t);
    const flag = gbTeamFlagFromRow(t);
    return `
      <option value="${gbEsc(name)}" ${name === selected ? "selected" : ""}>
        ${gbEsc(flag)} ${gbEsc(name)}
      </option>
    `;
  }).join("");
}
  
  function gbAdmin() {
    if (!gbSession) {
      return `<div class="gb-admin-note">Sign in using the main Admin button to add goal scorers.</div>`;
    }

   const defaultTeam = gbTeamName(gbSortedTeams()[0]) || "";

    return `
      <form id="goldenBootForm" class="gb-form">
        <input id="gbMatchDate" type="date">
        <input id="gbMatchCode" type="text" placeholder="Match code, e.g. M73">
        <select id="gbTeam">${gbTeamOptions(defaultTeam)}</select>
        <select id="gbPlayer">${gbPlayerOptions(defaultTeam)}</select>
        <input id="gbGoals" type="number" min="1" value="1" placeholder="Goals">
        <button id="gbSaveBtn" class="button gold" type="submit">Save scorer</button>
        <button id="gbCancelEdit" class="button dark hidden" type="button">Cancel edit</button>
      </form>
      <p id="gbStatus" class="status"></p>
      <p id="gbEditHint" class="gb-edit-hint hidden"></p>
      ${gbAdminList()}
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
        <h3>Admin: Add / fix goal scorers</h3>
        ${gbAdmin()}
      </div>
    `;

    gbWireForm();
  }

  function gbWireForm() {
    const form = document.getElementById("goldenBootForm");
    const teamSelect = document.getElementById("gbTeam");
    const playerSelect = document.getElementById("gbPlayer");
    const cancelEdit = document.getElementById("gbCancelEdit");

    if (form) form.addEventListener("submit", gbSave);
    if (cancelEdit) cancelEdit.addEventListener("click", gbCancelEditMode);

    if (teamSelect && playerSelect) {
      teamSelect.addEventListener("change", () => {
        playerSelect.innerHTML = gbPlayerOptions(teamSelect.value);
        playerSelect.value = "";
      });
    }

    document.querySelectorAll("[data-gb-delete]").forEach(button => {
      button.addEventListener("click", gbDelete);
    });

    document.querySelectorAll("[data-gb-edit]").forEach(button => {
      button.addEventListener("click", gbStartEdit);
    });
  }

  function gbSetEditMode(row) {
    gbEditingId = Number(row.id);

    const teamSelect = document.getElementById("gbTeam");
    const playerSelect = document.getElementById("gbPlayer");

    document.getElementById("gbMatchDate").value = row.match_date || "";
    document.getElementById("gbMatchCode").value = row.match_code || "";
    teamSelect.value = row.team || "";
    playerSelect.innerHTML = gbPlayerOptions(row.team || "", row.player || "");
    playerSelect.value = row.player || "";
    document.getElementById("gbGoals").value = Number(row.goals || 1);

    const saveBtn = document.getElementById("gbSaveBtn");
    const cancelBtn = document.getElementById("gbCancelEdit");
    const hint = document.getElementById("gbEditHint");

    if (saveBtn) saveBtn.textContent = "Update scorer";
    if (cancelBtn) cancelBtn.classList.remove("hidden");
    if (hint) {
      hint.classList.remove("hidden");
      hint.textContent = `Editing: ${row.player} — ${row.team} — ${Number(row.goals || 0)} goal${Number(row.goals || 0) === 1 ? "" : "s"}`;
    }

    playerSelect.focus();
  }

  function gbCancelEditMode() {
    gbEditingId = null;

    const form = document.getElementById("goldenBootForm");
    if (form) form.reset();

    const teamSelect = document.getElementById("gbTeam");
    const playerSelect = document.getElementById("gbPlayer");
    if (teamSelect && playerSelect) {
      playerSelect.innerHTML = gbPlayerOptions(teamSelect.value);
      playerSelect.value = "";
    }

    const goals = document.getElementById("gbGoals");
    if (goals) goals.value = 1;

    const saveBtn = document.getElementById("gbSaveBtn");
    const cancelBtn = document.getElementById("gbCancelEdit");
    const hint = document.getElementById("gbEditHint");

    if (saveBtn) saveBtn.textContent = "Save scorer";
    if (cancelBtn) cancelBtn.classList.add("hidden");
    if (hint) {
      hint.classList.add("hidden");
      hint.textContent = "";
    }
  }

  function gbStartEdit(event) {
    const id = Number(event.currentTarget.getAttribute("data-gb-edit"));
    const row = gbRows.find(r => Number(r.id) === id);
    if (!row) return alert("Could not find that scorer entry.");
    gbSetEditMode(row);
  }

  async function gbSave(event) {
    event.preventDefault();

    const db = gbClient();
    if (!db || !gbSession) return alert("Please sign in first.");

    const match_date = document.getElementById("gbMatchDate").value || null;
    const match_code = document.getElementById("gbMatchCode").value.trim() || null;
    const team = document.getElementById("gbTeam").value;
    const player = document.getElementById("gbPlayer").value;
    const goals = Number(document.getElementById("gbGoals").value);

    if (!team || !player || !Number.isInteger(goals) || goals < 1) {
      return alert("Choose a team, player and valid number of goals.");
    }

    const payload = { match_date, match_code, team, player, goals };

    let error = null;

    if (gbEditingId) {
      const result = await db.from("goal_scorers").update(payload).eq("id", gbEditingId);
      error = result.error;
    } else {
      const result = await db.from("goal_scorers").insert(payload);
      error = result.error;
    }

    if (error) {
      console.error(error);
      return alert(gbEditingId
        ? "Could not update scorer. Check Supabase update policy."
        : "Could not save scorer. Check golden-boot.sql has been run.");
    }

    gbEditingId = null;
    await gbLoad();
    gbRender();
  }

  async function gbDelete(event) {
    const id = Number(event.currentTarget.getAttribute("data-gb-delete"));
    const row = gbRows.find(r => Number(r.id) === id);
    if (!row) return;

    const ok = confirm(`Delete this scorer entry?\n\n${row.player} — ${row.team} — ${row.goals} goal${Number(row.goals) === 1 ? "" : "s"}${row.match_code ? ` — ${row.match_code}` : ""}`);
    if (!ok) return;

    const db = gbClient();
    if (!db || !gbSession) return alert("Please sign in first.");

    const { error } = await db.from("goal_scorers").delete().eq("id", id);

    if (error) {
      console.error(error);
      return alert("Could not delete scorer. Check Supabase delete policy.");
    }

    if (gbEditingId === id) gbEditingId = null;

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
