// Walford V4.7 Knockout Phase 1
// Replaces knockout-auto.js only.
// Fixes Champion card display and adds knockout result history.
// Requires knockout_results table from V4.5.

const WALFORD_KNOCKOUT = {
  r32: [
    ["M73", "Round of 32", "Group A Runner-up", "Group B Runner-up"],
    ["M74", "Round of 32", "Group E Winner", "Best 3rd Place"],
    ["M75", "Round of 32", "Group F Winner", "Group C Runner-up"],
    ["M76", "Round of 32", "Group C Winner", "Group F Runner-up"],
    ["M77", "Round of 32", "Group I Winner", "Best 3rd Place"],
    ["M78", "Round of 32", "Group E Runner-up", "Group I Runner-up"],
    ["M79", "Round of 32", "Group A Winner", "Best 3rd Place"],
    ["M80", "Round of 32", "Group L Winner", "Best 3rd Place"],
    ["M81", "Round of 32", "Group D Winner", "Best 3rd Place"],
    ["M82", "Round of 32", "Group G Winner", "Best 3rd Place"],
    ["M83", "Round of 32", "Group K Runner-up", "Group L Runner-up"],
    ["M84", "Round of 32", "Group H Winner", "Group J Runner-up"],
    ["M85", "Round of 32", "Group B Winner", "Best 3rd Place"],
    ["M86", "Round of 32", "Group J Winner", "Group H Runner-up"],
    ["M87", "Round of 32", "Group K Winner", "Best 3rd Place"],
    ["M88", "Round of 32", "Group D Runner-up", "Group G Runner-up"]
  ],
  r16: [
    ["M89", "Round of 16", "Winner M74", "Winner M77"],
    ["M90", "Round of 16", "Winner M73", "Winner M75"],
    ["M91", "Round of 16", "Winner M76", "Winner M78"],
    ["M92", "Round of 16", "Winner M79", "Winner M80"],
    ["M93", "Round of 16", "Winner M83", "Winner M84"],
    ["M94", "Round of 16", "Winner M81", "Winner M82"],
    ["M95", "Round of 16", "Winner M86", "Winner M88"],
    ["M96", "Round of 16", "Winner M85", "Winner M87"]
  ],
  qf: [
    ["M97", "Quarter-final", "Winner M89", "Winner M90"],
    ["M98", "Quarter-final", "Winner M93", "Winner M94"],
    ["M99", "Quarter-final", "Winner M91", "Winner M92"],
    ["M100", "Quarter-final", "Winner M95", "Winner M96"]
  ],
  sf: [
    ["M101", "Semi-final", "Winner M97", "Winner M98"],
    ["M102", "Semi-final", "Winner M99", "Winner M100"]
  ],
  final: [
    ["FINAL", "Final", "Winner M101", "Winner M102"]
  ]
};

let wkResults = {};
let wkDb = null;
let wkSession = null;

function wkInitDb() {
  if (wkDb) return wkDb;
  if (window.supabase && typeof SUPABASE_URL === "string" && typeof SUPABASE_ANON_KEY === "string") {
    wkDb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return wkDb;
}

function wkAllMatches() {
  return [
    ...WALFORD_KNOCKOUT.r32,
    ...WALFORD_KNOCKOUT.r16,
    ...WALFORD_KNOCKOUT.qf,
    ...WALFORD_KNOCKOUT.sf,
    ...WALFORD_KNOCKOUT.final
  ];
}

function wkFlag(teamName) {
  try {
    if (typeof flag === "function") return flag(teamName) || "";
  } catch(e) {}
  return "";
}

function wkOwner(teamName) {
  try {
    if (typeof owner === "function") return owner(teamName) || "";
  } catch(e) {}
  return "";
}

function wkCleanTeamName(label) {
  return String(label || "")
    .replace(/^[^\wA-ZÀ-ž]+/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function wkGroupStatsSafe() {
  try {
    if (typeof groupStats === "function") return groupStats();
  } catch(e) {}
  return [];
}

function wkGroupTop(groupLetter, position) {
  const all = wkGroupStatsSafe();
  const groupRows = all.filter(t => t.group === groupLetter);
  return groupRows[position - 1] || null;
}

function wkResolveSlot(slot) {
  const winnerRef = String(slot).match(/^Winner (M\d+|FINAL)$/);
  if (winnerRef) {
    const result = wkResults[winnerRef[1]];
    if (result && result.winner) return result.winner;
    return slot;
  }

  const groupWinner = String(slot).match(/^Group ([A-L]) Winner$/);
  if (groupWinner) {
    const team = wkGroupTop(groupWinner[1], 1);
    return team ? team.team : slot;
  }

  const groupRunner = String(slot).match(/^Group ([A-L]) Runner-up$/);
  if (groupRunner) {
    const team = wkGroupTop(groupRunner[1], 2);
    return team ? team.team : slot;
  }

  return slot;
}

function wkIsPlaceholder(label) {
  return /^Winner /.test(label) || /^Group /.test(label) || label === "Best 3rd Place" || label === "TBC";
}

function wkIsRealTeam(label) {
  return !wkIsPlaceholder(label);
}

function wkTeamLine(label, matchResult, side) {
  const resolved = wkResolveSlot(label);
  const clean = wkCleanTeamName(resolved);
  const real = wkIsRealTeam(resolved);
  const resultScore = matchResult ? (side === "a" ? matchResult.score_a : matchResult.score_b) : null;
  const isWinner = matchResult && matchResult.winner === clean;
  const ownerText = real ? wkOwner(clean) : "TBC";
  const icon = real ? wkFlag(clean) : "";
  const waitingClass = real ? "" : "waiting";

  return `
    <div class="wk-team ${isWinner ? "winner" : ""} ${waitingClass}">
      <span>${icon} ${clean}</span>
      <em>${resultScore !== null && resultScore !== undefined ? resultScore : ownerText}</em>
    </div>
  `;
}

function wkCard(match) {
  const [code, round, slotA, slotB] = match;
  const result = wkResults[code];
  return `
    <article class="wk-match ${result ? "played" : ""}">
      <small>${code}${result ? " • completed" : ""}</small>
      ${wkTeamLine(slotA, result, "a")}
      ${wkTeamLine(slotB, result, "b")}
    </article>
  `;
}

function wkRound(title, key) {
  return `
    <div class="wk-round">
      <h3>${title}</h3>
      <div class="wk-list">
        ${WALFORD_KNOCKOUT[key].map(wkCard).join("")}
      </div>
    </div>
  `;
}

function wkInsertSection() {
  if (document.getElementById("knockout")) return;

  const section = document.createElement("section");
  section.id = "knockout";
  section.className = "section";
  section.innerHTML = `
    <div class="section-title">
      <span>Road to Glory</span>
      <h2>Knockout Bracket</h2>
      <p>Round of 32 through to the Final. Winners progress automatically when knockout results are saved.</p>
    </div>

    <div class="wk-notice">
      <strong>Projection mode:</strong>
      Group slots come from current group standings. Saved knockout results move winners into the next round.
    </div>

    <div id="wkAdminPanel" class="wk-admin"></div>

    <div class="wk-bracket"></div>

    <div id="wkResultsHistory" class="wk-history"></div>
  `;

  const banter = document.getElementById("banter");
  if (banter && banter.parentNode) {
    banter.parentNode.insertBefore(section, banter);
  } else {
    document.querySelector("main")?.appendChild(section);
  }
}

function wkRenderBracket() {
  wkInsertSection();
  const bracket = document.querySelector("#knockout .wk-bracket");
  if (!bracket) return;

  bracket.innerHTML = `
    ${wkRound("Round of 32", "r32")}
    ${wkRound("Round of 16", "r16")}
    ${wkRound("Quarter-finals", "qf")}
    ${wkRound("Semi-finals", "sf")}
    ${wkRound("Final", "final")}
  `;

  wkRenderChampion();
  wkRenderHistory();
  wkRenderAdmin();
}

function wkRenderChampion() {
  const finalResult = wkResults.FINAL;
  const finalRound = document.querySelector("#knockout .wk-round:last-child");
  if (!finalRound) return;

  let champion = document.getElementById("wkChampionCard");
  if (!champion) {
    champion = document.createElement("div");
    champion.id = "wkChampionCard";
    champion.className = "wk-champion-card";
    finalRound.appendChild(champion);
  }

  if (finalResult && finalResult.winner) {
    champion.innerHTML = `
      <span>Champion</span>
      <strong>${wkFlag(finalResult.winner)} ${finalResult.winner}</strong>
      <em>${wkOwner(finalResult.winner) || "Owner TBC"}</em>
    `;
  } else {
    const finalists = WALFORD_KNOCKOUT.final[0].slice(2).map(wkResolveSlot);
    const readable = finalists.filter(wkIsRealTeam).map(t => `${wkFlag(t)} ${t}`).join(" v ");
    champion.innerHTML = `
      <span>Champion</span>
      <strong>Awaiting Final</strong>
      <em>${readable || "Finalists TBC"}</em>
    `;
  }
}

function wkRenderHistory() {
  const target = document.getElementById("wkResultsHistory");
  if (!target) return;

  const rows = Object.values(wkResults)
    .sort((a, b) => String(a.match_code).localeCompare(String(b.match_code), undefined, { numeric: true }));

  if (!rows.length) {
    target.innerHTML = `
      <div class="wk-history-box">
        <h3>Knockout Results History</h3>
        <p>No knockout results saved yet.</p>
      </div>
    `;
    return;
  }

  target.innerHTML = `
    <div class="wk-history-box">
      <h3>Knockout Results History</h3>
      <div class="wk-history-list">
        ${rows.map(r => `
          <div class="wk-history-row">
            <strong>${r.match_code}</strong>
            <span>${wkFlag(r.team_a)} ${r.team_a} ${r.score_a}–${r.score_b} ${wkFlag(r.team_b)} ${r.team_b}</span>
            <em>Winner: ${wkFlag(r.winner)} ${r.winner} (${wkOwner(r.winner) || "Owner TBC"})</em>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function wkResolvedMatchTeams(code) {
  const match = wkAllMatches().find(m => m[0] === code);
  if (!match) return null;
  const teamA = wkCleanTeamName(wkResolveSlot(match[2]));
  const teamB = wkCleanTeamName(wkResolveSlot(match[3]));
  return { code: match[0], round: match[1], teamA, teamB };
}

async function wkLoadResults() {
  const db = wkInitDb();
  if (!db) return;

  const { data: sessionData } = await db.auth.getSession();
  wkSession = sessionData?.session || null;

  const { data, error } = await db.from("knockout_results").select("*").order("id", { ascending: true });
  if (error) {
    console.warn("Knockout results not loaded. Have you run knockout_results_table.sql?", error);
    wkResults = {};
    return;
  }

  wkResults = Object.fromEntries((data || []).map(r => [r.match_code, r]));
}

function wkAvailableMatches() {
  return wkAllMatches()
    .map(m => wkResolvedMatchTeams(m[0]))
    .filter(m => m && wkIsRealTeam(m.teamA) && wkIsRealTeam(m.teamB));
}

function wkRenderAdmin() {
  const admin = document.getElementById("wkAdminPanel");
  if (!admin) return;

  if (!wkSession) {
    admin.innerHTML = `
      <div class="wk-admin-note">
        Sign in using the main Admin button to enter knockout results.
      </div>
    `;
    return;
  }

  const options = wkAvailableMatches()
    .map(m => `<option value="${m.code}">${m.code} — ${m.teamA} v ${m.teamB}</option>`)
    .join("");

  admin.innerHTML = `
    <div class="wk-admin-box">
      <h3>Knockout Result Entry</h3>
      <form id="wkResultForm">
        <select id="wkMatchCode">${options}</select>
        <input id="wkScoreA" type="number" min="0" placeholder="A">
        <span>v</span>
        <input id="wkScoreB" type="number" min="0" placeholder="B">
        <button class="button gold" type="submit">Save Knockout Result</button>
      </form>
      <p id="wkStatus" class="status"></p>
    </div>
  `;

  const form = document.getElementById("wkResultForm");
  if (form) form.addEventListener("submit", wkSaveResult);
}

async function wkSaveResult(event) {
  event.preventDefault();

  const db = wkInitDb();
  if (!db || !wkSession) return alert("Please sign in first.");

  const code = document.getElementById("wkMatchCode").value;
  const scoreA = Number(document.getElementById("wkScoreA").value);
  const scoreB = Number(document.getElementById("wkScoreB").value);
  const match = wkResolvedMatchTeams(code);

  if (!match) return alert("Match not available yet.");
  if (match.teamA === match.teamB) return alert("Invalid match.");
  if (scoreA === scoreB) return alert("Knockout matches need a winner. Enter the post-penalty winner score.");
  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB)) return alert("Enter valid scores.");

  const winner = scoreA > scoreB ? match.teamA : match.teamB;

  const payload = {
    match_code: code,
    round: match.round,
    team_a: match.teamA,
    team_b: match.teamB,
    score_a: scoreA,
    score_b: scoreB,
    winner
  };

  const { error } = await db
    .from("knockout_results")
    .upsert(payload, { onConflict: "match_code" });

  if (error) {
    console.error(error);
    return alert("Could not save knockout result. Check the SQL table and RLS policies.");
  }

  document.getElementById("wkScoreA").value = "";
  document.getElementById("wkScoreB").value = "";

  await wkLoadResults();
  wkRenderBracket();
}

async function wkStart() {
  wkInsertSection();
  await wkLoadResults();
  wkRenderBracket();
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(wkStart, 1600);
});
