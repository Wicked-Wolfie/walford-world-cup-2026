const OWNERS = ["David", "Dubs", "Lottie", "Dan", "Matt", "Marnie", "Myles"];
const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const STAGES = {
  "Group Stage": 0,
  "Round of 16": 3,
  "Quarter-final": 6,
  "Semi-final": 10,
  "Final": 15,
  "Winner": 25,
  "Eliminated": 0
};

let db = null;
let teams = window.FALLBACK_TEAMS || [];
let results = [];
let fixtures = window.FALLBACK_FIXTURES || [];
let session = null;
let activeGroup = "A";

function ready() {
  return window.supabase &&
    typeof SUPABASE_ANON_KEY === "string" &&
    !SUPABASE_ANON_KEY.includes("PASTE_");
}

if (ready()) {
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function el(id) {
  return document.getElementById(id);
}

function makeEmojiFlag(code) {
  return String.fromCodePoint(
    ...String(code || "")
      .toUpperCase()
      .split("")
      .map(char => 127397 + char.charCodeAt(0))
  );
}

const ENGLAND_FLAG = '<img class="team-flag-img" src="https://flagcdn.com/24x18/gb-eng.png" alt="England">';
const SCOTLAND_FLAG = '<img class="team-flag-img" src="https://flagcdn.com/24x18/gb-sct.png" alt="Scotland">';

const WALFORD_FLAG_CODES = {
  "Mexico": "MX",
  "South Africa": "ZA",
  "South Korea": "KR",
  "Korea Republic": "KR",
  "Czechia": "CZ",

  "Canada": "CA",
  "Bosnia and Herzegovina": "BA",
  "Qatar": "QA",
  "Switzerland": "CH",

  "Brazil": "BR",
  "Morocco": "MA",
  "Haiti": "HT",
  "Scotland": "SCOTLAND",

  "United States": "US",
  "USA": "US",
  "Paraguay": "PY",
  "Australia": "AU",
  "Turkey": "TR",
  "Türkiye": "TR",

  "Germany": "DE",
  "Curacao": "CW",
  "Curaçao": "CW",
  "Ivory Coast": "CI",
  "Ecuador": "EC",

  "Netherlands": "NL",
  "Japan": "JP",
  "Sweden": "SE",
  "Tunisia": "TN",

  "Belgium": "BE",
  "Egypt": "EG",
  "Iran": "IR",
  "New Zealand": "NZ",

  "Spain": "ES",
  "Cape Verde": "CV",
  "Saudi Arabia": "SA",
  "Uruguay": "UY",

  "France": "FR",
  "Senegal": "SN",
  "Iraq": "IQ",
  "Norway": "NO",

  "Argentina": "AR",
  "Algeria": "DZ",
  "Austria": "AT",
  "Jordan": "JO",

  "Portugal": "PT",
  "DR Congo": "CD",
  "Congo DR": "CD",
  "Uzbekistan": "UZ",
  "Colombia": "CO",

  "England": "ENGLAND",
  "Croatia": "HR",
  "Ghana": "GH",
  "Panama": "PA"
};

function flag(n) {
  const teamName = String(n || "").trim();
  const code = WALFORD_FLAG_CODES[teamName];

  if (code === "ENGLAND") return ENGLAND_FLAG;
  if (code === "SCOTLAND") return SCOTLAND_FLAG;
  if (code) return makeEmojiFlag(code);

  const fallback = WC.teams.fallbackForTeam(teamName);
  const fallbackCode = fallback?.code;

  if (fallbackCode === "GB-ENG") return ENGLAND_FLAG;
  if (fallbackCode === "GB-SCT") return SCOTLAND_FLAG;
  if (fallbackCode && /^[A-Z]{2}$/.test(fallbackCode)) return makeEmojiFlag(fallbackCode);

  const storedFlag = teams.find(x => x.team === teamName)?.flag || fallback?.flag || "";

  if (storedFlag && storedFlag !== "🏴" && !/^[A-Z]{2,3}$/.test(storedFlag)) {
    return storedFlag;
  }

  return "";
}

function applyEmojiFlags() {
  if (window.twemoji) {
    twemoji.parse(document.body, {
      folder: "svg",
      ext: ".svg"
    });
  }
}

async function loadData() {
  if (db) {
    const { data: td } = await db
      .from("teams")
      .select("*")
      .order("id");
    
    if (td?.length) {
  teams = td.map(t => {
    const fb = window.WC.teams.fallbackForTeam(t.team, t.flag) || {};
    return {
      id: t.id,
      code: fb.code || t.flag || "",
      flag: flag(t.team) || t.flag || fb.flag || "",
      team: t.team,
      owner: WC.helpers.ownerName(t.owner || fb.owner || ""),
      stage: t.stage || "Group Stage",
      group: fb.group || "?"
    };
  });
}
    const { data: md, error: me } = await db
      .from("results")
      .select("*")
      .order("match_date", { ascending: true })
      .order("id", { ascending: true });

    if (!me) {
      results = (md || []).map(r => ({
        id: r.id,
        date: r.match_date,
        teamA: r.team_a,
        teamB: r.team_b,
        scoreA: r.score_a,
        scoreB: r.score_b
      }));
    }

    const { data: fd, error: fe } = await db
      .from("fixtures")
      .select("*")
      .order("match_date", { ascending: true })
      .order("kickoff_gmt", { ascending: true });

    if (!fe && fd?.length) {
      fixtures = fd.map(f => ({
        date: f.match_date,
        time: String(f.kickoff_gmt || "").slice(0, 5),
        team_a: f.team_a,
        team_b: f.team_b
      }));
    }

    const { data: sess } = await db.auth.getSession();
    session = sess.session;
  }

  render();
}

function groupStats() {
  const stats = Object.fromEntries(
    teams.map(t => [
      t.team,
      {
        ...t,
        P: 0,
        W: 0,
        D: 0,
        L: 0,
        GF: 0,
        GA: 0,
        GD: 0,
        Pts: 0
      }
    ])
  );

  results.forEach(m => {
    const a = Number(m.scoreA);
    const b = Number(m.scoreB);
    const A = stats[m.teamA];
    const B = stats[m.teamB];

    if (!A || !B) return;

    A.P++;
    B.P++;
    A.GF += a;
    A.GA += b;
    B.GF += b;
    B.GA += a;

    if (a > b) {
      A.W++;
      B.L++;
      A.Pts += 3;
    } else if (a < b) {
      B.W++;
      A.L++;
      B.Pts += 3;
    } else {
      A.D++;
      B.D++;
      A.Pts++;
      B.Pts++;
    }
  });

  Object.values(stats).forEach(s => {
    s.GD = s.GF - s.GA;
  });

  return Object.values(stats).sort(
    (a, b) =>
      b.Pts - a.Pts ||
      b.GD - a.GD ||
      b.GF - a.GF ||
      a.team.localeCompare(b.team)
  );
}

function teamTotals() {
  const gs = Object.fromEntries(groupStats().map(s => [s.team, s]));

  return teams.map(t => {
    const g = gs[t.team] || {};
    const bonus = STAGES[t.stage || "Group Stage"] || 0;

    return {
      ...t,
      match: g.Pts || 0,
      bonus,
      total: (g.Pts || 0) + bonus,
      stage: t.stage || "Group Stage",
      gd: g.GD || 0
    };
  });
}

function leaderboardData() {
  const scores = Object.fromEntries(OWNERS.map(o => [o, 0]));

  teamTotals().forEach(t => {
    scores[t.owner] = (scores[t.owner] || 0) + t.total;
  });

  return OWNERS.map(o => ({
    owner: o,
    total: scores[o] || 0,
    teams: teams.filter(t => t.owner === o).length
  })).sort((a, b) => b.total - a.total || a.owner.localeCompare(b.owner));
}

function fillSelects() {
  const opts = teams
    .map(t => `<option value="${t.team}">${t.flag} ${t.team}</option>`)
    .join("");

  ["teamA", "teamB", "fixtureTeamA", "fixtureTeamB", "knockoutTeamA", "knockoutTeamB"].forEach(id => {
    const s = el(id);
    if (s && s.innerHTML !== opts) s.innerHTML = opts;
  });
}

function render() {
  fillSelects();

  if (el("todayDate") && !el("todayDate").value) {
    el("todayDate").value = WC.helpers.todayISO();
  }

  const lb = leaderboardData();
  const totals = teamTotals().sort(
    (a, b) => b.total - a.total || a.team.localeCompare(b.team)
  );
  const top = totals[0] || {};
  const gs = groupStats();

  el("currentLeader").textContent = lb[0]?.owner || "-";
  el("currentLeaderPoints").textContent = (lb[0]?.total || 0) + " pts";
  el("leaderStat").textContent = `${lb[0]?.owner || "-"} (${lb[0]?.total || 0})`;
  el("matchStat").textContent = results.length;
  el("nationStat").textContent = top.team ? `${top.flag} ${top.team} (${top.total})` : "-";

  const todayGames = fixtures.filter(f => f.date === el("todayDate").value);
  el("feudStat").textContent = todayGames[0]
    ? `${WC.teams.owner(todayGames[0].team_a)} v ${WC.teams.owner(todayGames[0].team_b)}`
    : "-";

  el("leaderboard").innerHTML = lb
    .map((r, i) => `
      <div class="leader-row">
        <div class="rank">${i + 1}</div>
        <div><strong>${r.owner}</strong><br><span>${r.teams} teams</span></div>
        <div class="pts">${r.total}</div>
      </div>
    `)
    .join("");

  const max = Math.max(1, ...lb.map(x => x.total));

  el("chart").innerHTML = lb
    .map(r => `
      <div class="bar-row">
        <strong>${r.owner}</strong>
        <div class="bar" style="width:${Math.max(4, r.total / max * 100)}%"></div>
        <span>${r.total}</span>
      </div>
    `)
    .join("");

  renderToday();
  renderGroups(gs);
  renderOverall(gs);
  renderResults();
  renderTeams();
  renderDraw();
  renderBanter(lb, totals, todayGames);
  renderAdmin();
  applyEmojiFlags();
}

function tableMarkup(rows) {
  return `
    <div class="table-row table-head">
      <div>Team</div>
      <div>Owner</div>
      <div>P</div>
      <div>W</div>
      <div>D</div>
      <div>L</div>
      <div>GF</div>
      <div>GA</div>
      <div>GD</div>
      <div>Pts</div>
    </div>
  ` + rows.map(s => `
    <div class="table-row">
      <div>${s.flag} <strong>${s.team}</strong></div>
      <div>${s.owner}</div>
      <div>${s.P}</div>
      <div>${s.W}</div>
      <div>${s.D}</div>
      <div>${s.L}</div>
      <div>${s.GF}</div>
      <div>${s.GA}</div>
      <div>${s.GD}</div>
      <div class="pts-cell">${s.Pts}</div>
    </div>
  `).join("");
}

function renderGroups(gs) {
  el("groupTabs").innerHTML = GROUPS
    .map(g => `
      <button class="group-tab ${g === activeGroup ? "active" : ""}" type="button" data-group="${g}">
        Group ${g}
      </button>
    `)
    .join("");

  el("groupTables").innerHTML = `
    <div class="group-card">
      <h3>Group ${activeGroup}</h3>
      ${tableMarkup(gs.filter(s => s.group === activeGroup))}
    </div>
  `;

  document.querySelectorAll(".group-tab").forEach(btn => {
    btn.onclick = () => {
      activeGroup = btn.dataset.group;
      renderGroups(groupStats());
    };
  });
}

function renderOverall(gs) {
  const q = (el("groupSearch").value || "").toLowerCase();

  el("overallTable").innerHTML = tableMarkup(
    gs.filter(s => (s.team + s.owner + s.group).toLowerCase().includes(q))
  );
}

function renderToday() {
  const games = fixtures.filter(f => f.date === el("todayDate").value);

  el("todayMatches").innerHTML = games.length
    ? games.map(f => {
        const oa = WC.teams.owner(f.team_a);
        const ob = WC.teams.owner(f.team_b);

        return `
          <article class="today-card">
            <div class="today-time">${f.time || "TBC"} GMT</div>
            <h3>${flag(f.team_a)} ${f.team_a} v ${flag(f.team_b)} ${f.team_b}</h3>
            <div class="owners-line">${oa} v ${ob}</div>
            <p class="banter-copy">“${banterFor(oa, ob, f.team_a, f.team_b)}”</p>
          </article>
        `;
      }).join("")
    : "<p>No fixtures loaded for this date yet.</p>";
}

function renderResults() {
  el("resultsList").innerHTML = results.length
    ? results.slice().reverse().map(m => {
        const a = Number(m.scoreA);
        const b = Number(m.scoreB);
        const pa = a > b ? 3 : a === b ? 1 : 0;
        const pb = b > a ? 3 : a === b ? 1 : 0;

        return `
          <div class="result-item">
            <div>
              <strong>${flag(m.teamA)} ${m.teamA}</strong> v
              <strong>${flag(m.teamB)} ${m.teamB}</strong><br>
              <span>${m.date} • ${WC.teams.owner(m.teamA)} +${pa}, ${WC.teams.owner(m.teamB)} +${pb}</span>
            </div>
            <div class="result-score">${a}-${b}</div>
          </div>
        `;
      }).join("")
    : "<p>No results yet.</p>";
}

function renderTeams() {
  const q = (el("teamSearch").value || "").toLowerCase();

  el("teamTable").innerHTML = `
    <div class="table-row table-head">
      <div>Team</div>
      <div>Owner</div>
      <div>Match</div>
      <div>Bonus</div>
      <div>Total</div>
      <div>Stage</div>
    </div>
  ` + teamTotals()
    .filter(t => (t.team + t.owner + t.group).toLowerCase().includes(q))
    .map(t => `
      <div class="table-row">
        <div>${t.flag} <strong>${t.team}</strong></div>
        <div>${t.owner}</div>
        <div>${t.match}</div>
        <div>${t.bonus}</div>
        <div class="total">${t.total}</div>
        <div>${t.stage}</div>
      </div>
    `)
    .join("");
}

function renderDraw() {
  el("drawGrid").innerHTML = OWNERS
    .map(o => `
      <article class="draw-card">
        <h3>${o}</h3>
        ${teams
          .filter(t => t.owner === o)
          .map(t => `<span class="pill">${t.flag} ${t.team}</span>`)
          .join("")}
      </article>
    `)
    .join("");
}

function renderBanter(lb, totals, todayGames) {
  const dRank = lb.findIndex(x => x.owner === "David") + 1;
  const dPts = lb.find(x => x.owner === "David")?.total || 0;
  const eng = totals.find(t => t.team === "England") || {};
  const feud = todayGames[0];

  el("banterFavourite").textContent = `${lb[0]?.owner || "-"}, ${lb[0]?.total || 0} pts`;
  el("banterFlop").textContent = `${lb[lb.length - 1]?.owner || "-"}, ${lb[lb.length - 1]?.total || 0} pts`;
  el("banterDavid").textContent = `${dRank}${WC.helpers.suffix(dRank)} place, ${(lb[0]?.total || 0) - dPts} behind`;
  el("banterEngland").textContent = `${eng.stage || "Group Stage"}, ${eng.total || 0} pts`;
  el("banterTeam").textContent = totals[0] ? `${totals[0].flag} ${totals[0].team}, ${totals[0].total} pts` : "-";
  el("banterFeud").textContent = feud
    ? `${WC.teams.owner(feud.team_a)} v ${WC.teams.owner(feud.team_b)} - ${banterFor(WC.teams.owner(feud.team_a), WC.teams.owner(feud.team_b), feud.team_a, feud.team_b)}`
    : "Awaiting today's fixtures";
}

function renderAdmin() {
  el("loginForm").classList.toggle("hidden", !!session);
  el("resultForm").classList.toggle("hidden", !session);
  el("fixtureForm").classList.toggle("hidden", !session);
  el("logoutBtn").classList.toggle("hidden", !session);
  el("adminStatus").textContent = session
    ? `Signed in as ${session.user.email}`
    : db
      ? "Sign in to enter scores and fixtures."
      : "Supabase key not set yet.";
}

function banterFor(a, b, ta, tb) {
  if (a === b) {
    return `${a} has both teams here. Guaranteed points, guaranteed smugness.`;
  }

  const pair = [a, b].sort().join("|");

  const lines = {
    "David|Dubs": "Domestic derby. Winner controls the remote and the moral high ground.",
    "David|Lottie": "Dad versus daughter. Family pride is on the line.",
    "Dubs|Lottie": "Mum versus daughter. Someone is getting a pointed WhatsApp afterwards.",
    "David|Matt": "Father versus son. The old guard meets Uncle Big Apple.",
    "Dubs|Matt": "Mum versus son. Dubs expects respect, Matt expects points.",
    "Dan|Lottie": "Husband versus wife. A peaceful evening is not guaranteed.",
    "Dan|David": "Son-in-law trying to impress the father-in-law. Dangerous territory.",
    "Dan|Dubs": "Dan attempting to stay in Dubs' good books. Again.",
    "Dan|Marnie": "Dad versus daughter. No pocket money points available.",
    "Dan|Myles": "Dad versus son. Tactical lecture incoming either way.",
    "Lottie|Marnie": "Mum versus daughter. No mercy expected.",
    "Lottie|Myles": "Mum versus son. Myles has been warned.",
    "Marnie|Myles": "Sibling rivalry has reached World Cup level.",
    "Marnie|Matt": "Uncle Matt from the Big Apple faces Marnie. Transatlantic bragging rights.",
    "Matt|Myles": "Uncle Matt attempts to teach Myles a footballing lesson from New York.",
    "Dubs|Marnie": "Grandmother versus granddaughter. Dubs may be smiling, but she wants the points.",
    "David|Marnie": "Grandad versus granddaughter. Miracle Watch meets next generation ambition.",
    "Dubs|Myles": "Grandmother versus grandson. Myles should expect absolutely no sympathy.",
    "David|Myles": "Grandad versus grandson. David's Miracle Watch faces youthful confidence."
  };

  return lines[pair] || `${a} versus ${b}. ${ta} and ${tb} have been dragged into family politics.`;
}

// Team Odds - v5.8.12
function getWalfordSupabaseClient() {
  if (typeof db !== "undefined" && db && typeof db.from === "function") return db;
  if (window.supabaseClient && typeof window.supabaseClient.from === "function") return window.supabaseClient;
  if (window.supabase && typeof window.supabase.from === "function") return window.supabase;
  if (typeof supabase !== "undefined" && supabase && typeof supabase.from === "function") return supabase;
  return null;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}

function formatOddsUpdatedAt(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
function isWalfordRealKnockoutTeam(name) {
  const clean = String(name || "").trim();

  if (!clean) return false;
  if (clean === "TBC") return false;
  if (/^Winner /i.test(clean)) return false;
  if (/^Runner-up Group /i.test(clean)) return false;
  if (/^Group /i.test(clean)) return false;
  if (/^Best 3rd Place/i.test(clean)) return false;

  return true;
}

async function loadAliveKnockoutTeamNames(client) {
  const { data, error } = await client
    .from("knockout_results")
    .select("match_code, team_a, team_b, score_a, score_b, winner")
    .order("match_code", { ascending: true });

  if (error) {
    console.warn("Could not load knockout teams for odds.", error);
    return [];
  }

  const knockoutTeams = new Set();
  const eliminatedTeams = new Set();

  (data || []).forEach(row => {
    const teamA = String(row.team_a || "").trim();
    const teamB = String(row.team_b || "").trim();
    const winner = String(row.winner || "").trim();

    if (isWalfordRealKnockoutTeam(teamA)) {
      knockoutTeams.add(teamA);
    }

    if (isWalfordRealKnockoutTeam(teamB)) {
      knockoutTeams.add(teamB);
    }

    const completed = Boolean(
      winner &&
      row.score_a !== null &&
      row.score_b !== null
    );

    if (completed) {
      if (teamA && winner && WC.teams.normalise(teamA) !== WC.teams.normalise(winner)) {
        eliminatedTeams.add(WC.teams.normalise(teamA));
      }

      if (teamB && winner && WC.teams.normalise(teamB) !== WC.teams.normalise(winner)) {
        eliminatedTeams.add(WC.teams.normalise(teamB));
      }

      knockoutTeams.add(winner);
    }
  });

  return Array.from(knockoutTeams).filter(team =>
    !eliminatedTeams.has(WC.teams.normalise(team))
  );
}

async function loadTeamOdds() {
  const statusEl = document.getElementById("team-odds-status");
  const gridEl = document.getElementById("team-odds-grid");

  if (!statusEl || !gridEl) return;

  const client = getWalfordSupabaseClient();

  if (!client) {
    statusEl.textContent = "Team odds unavailable: Supabase client not found.";
    statusEl.classList.add("is-error");
    return;
  }

  statusEl.textContent = "Loading team odds...";
  statusEl.classList.remove("is-error");
  gridEl.innerHTML = "";

  const { data: oddsData, error: oddsError } = await client
    .from("team_odds")
    .select("id, team_id, odds_fractional, odds_decimal, implied_probability, market, source, updated_at")
    .eq("is_active", true)
    .eq("market", "winner")
    .order("odds_decimal", { ascending: true, nullsFirst: false });

  if (oddsError) {
    console.error("Error loading team odds:", oddsError);
    statusEl.textContent = "Could not load team odds.";
    statusEl.classList.add("is-error");
    return;
  }

  if (!oddsData || oddsData.length === 0) {
    statusEl.textContent = "No team odds added yet.";
    return;
  }

  const { data: teamsData, error: teamsError } = await client
  .from("teams")
  .select("id, team, flag, owner")
  .order("team", { ascending: true });

if (teamsError) {
  console.error("Error loading teams for odds:", teamsError);
  statusEl.textContent = "Could not load team names for odds.";
  statusEl.classList.add("is-error");
  return;
}

const aliveKnockoutNames = await loadAliveKnockoutTeamNames(client);
const aliveKnockoutKeys = new Set(
  aliveKnockoutNames.map(name => WC.teams.normalise(name))
);

const teamsForOdds = aliveKnockoutKeys.size
  ? (teamsData || []).filter(team =>
      aliveKnockoutKeys.has(WC.teams.normalise(team.team))
    )
  : (teamsData || []);

const oddsByTeamId = {};
(oddsData || []).forEach(row => {
  oddsByTeamId[row.team_id] = row;
});

const allOddsRows = teamsForOdds.map(team => {
  return {
    teamData: team,
    oddsData: oddsByTeamId[team.id] || null
  };
}).sort((a, b) => {
  const ao = a.oddsData?.odds_decimal ? Number(a.oddsData.odds_decimal) : 9999;
  const bo = b.oddsData?.odds_decimal ? Number(b.oddsData.odds_decimal) : 9999;
  return ao - bo || a.teamData.team.localeCompare(b.teamData.team);
});
  const teamsById = {};
  (teamsData || []).forEach(team => {
    teamsById[team.id] = team;
  });

  statusEl.textContent = "";

  gridEl.innerHTML = allOddsRows.map(function (item) {
  const team = item.teamData || {};
  const row = item.oddsData || {};
  const teamName = team.team || "Unknown team";
  const fallbackTeam = WC.teams.fallbackForTeam(teamName, team.flag) || {};
  const teamFlag = flag(teamName) || team.flag || fallbackTeam.flag || "";
  const teamOwner = WC.helpers.ownerName(team.owner || fallbackTeam.owner || "");

  const hasOdds = !!row.odds_fractional;
  const decimal = row.odds_decimal ? Number(row.odds_decimal).toFixed(2) : "";
  const probability = row.implied_probability ? Number(row.implied_probability).toFixed(2) : "";
  const updated = formatOddsUpdatedAt(row.updated_at);

  return `
    <article class="team-odds-card ${hasOdds ? "" : "team-odds-card-tbc"}">
     <div class="team-odds-team">${teamFlag} ${escapeHtml(teamName)}</div>
      ${teamOwner ? `<div class="team-odds-owner">${escapeHtml(teamOwner)}</div>` : ""}

      <div class="team-odds-main">
        <span class="team-odds-fractional">${hasOdds ? escapeHtml(row.odds_fractional) : "Odds TBC"}</span>
        ${decimal ? `<span class="team-odds-decimal">Decimal ${escapeHtml(decimal)}</span>` : ""}
      </div>

      ${probability ? `<div class="team-odds-probability">Implied chance: ${escapeHtml(probability)}%</div>` : ""}
      ${updated ? `<div class="team-odds-updated">Updated ${escapeHtml(updated)}</div>` : ""}
    </article>
  `;
}).join("");

  applyEmojiFlags();
}

document.addEventListener("DOMContentLoaded", () => {
  el("adminToggle").onclick = () => {
    el("adminPanel").classList.remove("hidden");
    el("match-centre").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  el("teamSearch").oninput = renderTeams;
  el("groupSearch").oninput = () => renderOverall(groupStats());
  el("todayDate").onchange = render;
  el("showTodayBtn").onclick = renderToday;

  el("loginForm").onsubmit = async e => {
    e.preventDefault();

    if (!db) return alert("Supabase key not configured.");

    const { error } = await db.auth.signInWithPassword({
      email: el("email").value,
      password: el("password").value
    });

    if (error) return alert(error.message);

    await loadData();
    await loadTeamOdds();
  };

  el("logoutBtn").onclick = async () => {
    if (db) await db.auth.signOut();

    await loadData();
    await loadTeamOdds();
  };

  el("resultForm").onsubmit = async e => {
    e.preventDefault();

    if (!session) return alert("Please sign in first.");

    const payload = {
      match_date: el("matchDate").value,
      team_a: el("teamA").value,
      team_b: el("teamB").value,
      score_a: Number(el("scoreA").value),
      score_b: Number(el("scoreB").value)
    };

    if (payload.team_a === payload.team_b) {
      return alert("Choose two different teams.");
    }

    const { error } = await db.from("results").insert([payload]);

    if (error) {
      console.error(error);
      return alert("Could not save result. Check results insert policy.");
    }

    el("scoreA").value = "";
    el("scoreB").value = "";

    await loadData();
    await loadTeamOdds();
  };

    el("knockoutResultForm").onsubmit = async e => {
    e.preventDefault();

    if (!session) return alert("Please sign in first.");

    const teamA = el("knockoutTeamA").value;
    const teamB = el("knockoutTeamB").value;
    const scoreA = Number(el("knockoutScoreA").value);
    const scoreB = Number(el("knockoutScoreB").value);

    if (teamA === teamB) {
      return alert("Choose two different teams.");
    }

    if (scoreA === scoreB) {
      return alert("Knockout games need a winner. For penalties, enter the winner manually in Supabase for now.");
    }

    const payload = {
      match_code: el("knockoutMatchCode").value.trim(),
      team_a: teamA,
      team_b: teamB,
      score_a: scoreA,
      score_b: scoreB,
      winner: scoreA > scoreB ? teamA : teamB
    };

    if (!payload.match_code) {
      return alert("Enter a match code, for example R32-01.");
    }

    const { error } = await db
      .from("knockout_results")
      .upsert([payload], { onConflict: "match_code" });

    if (error) {
      console.error(error);
      return alert("Could not save knockout result.");
    }

    el("knockoutScoreA").value = "";
    el("knockoutScoreB").value = "";

    alert("Knockout result saved.");

    await loadData();
    await loadTeamOdds();

    if (typeof window.renderHomeKnockoutTracker === "function") {
      window.renderHomeKnockoutTracker();
    }

    if (typeof window.renderKnockoutAuto === "function") {
      window.renderKnockoutAuto();
    }
  };
  
  el("fixtureForm").onsubmit = async e => {
    e.preventDefault();

    if (!session) return alert("Please sign in first.");

    const payload = {
      match_date: el("fixtureDate").value,
      kickoff_gmt: el("fixtureTime").value,
      team_a: el("fixtureTeamA").value,
      team_b: el("fixtureTeamB").value
    };

    if (payload.team_a === payload.team_b) {
      return alert("Choose two different teams.");
    }

    const { error } = await db.from("fixtures").insert([payload]);

    if (error) {
      console.error(error);
      return alert("Could not save fixture. Check fixtures insert policy.");
    }

    await loadData();
    await loadTeamOdds();
  };

  loadData().then(loadTeamOdds);
});

// Walford V5.5.3 Alphabetical Dropdown Sorter
// Keeps admin team dropdowns alphabetical without changing the saved data.
(function () {
  const TEAM_SELECT_IDS = [
    "teamA",
    "teamB",
    "fixtureTeamA",
    "fixtureTeamB",
    "msTeamA",
    "msTeamB"
  ];

  function normaliseLabel(option) {
    return String(option.textContent || option.label || option.value || "")
      .replace(/^[^\wA-Za-zÀ-ÿ]+/g, "")
      .trim();
  }

  function sortSelect(select) {
    if (!select || select.dataset.walfordSorted === "yes") return;

    const current = select.value;
    const options = Array.from(select.options || []);

    if (options.length < 2) return;

    const placeholders = options.filter(option => !option.value);
    const realOptions = options
      .filter(option => option.value)
      .sort((a, b) => normaliseLabel(a).localeCompare(normaliseLabel(b), "en", {
        sensitivity: "base"
      }));

    select.innerHTML = "";
    placeholders.forEach(option => select.appendChild(option));
    realOptions.forEach(option => select.appendChild(option));

    if (current) select.value = current;
    select.dataset.walfordSorted = "yes";
  }

  function sortKnownSelects() {
    TEAM_SELECT_IDS.forEach(id => sortSelect(document.getElementById(id)));

    document.querySelectorAll(
      "select.msScorerTeam, #gbTeam, select[id^='team'], select[id^='fixtureTeam']"
    ).forEach(sortSelect);
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(sortKnownSelects, 500);
    setTimeout(sortKnownSelects, 1800);
    setTimeout(sortKnownSelects, 3500);
  });

  window.addEventListener("walford:goldenboot-rendered", () => {
    setTimeout(sortKnownSelects, 50);
  });

  window.addEventListener("walford:sort-dropdowns", () => {
    document.querySelectorAll("select").forEach(select => {
      delete select.dataset.walfordSorted;
    });

    sortKnownSelects();
  });
})();
