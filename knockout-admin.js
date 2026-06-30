// Walford Knockout Admin v2.0.0
// Admin-only knockout result + goal scorer entry.
// Saves knockout result and Golden Boot scorer rows together.

(function () {
let kaDb = null;
let kaSession = null;
let kaRows = [];
let kaPlayers = [];
let kaSelectedCode = "";

function kaClient() {
if (kaDb) return kaDb;

const url = window.SUPABASE_URL || (typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : "");
const key = window.SUPABASE_ANON_KEY || (typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : "");

if (!window.supabase || !url || !key) return null;

kaDb = window.supabase.createClient(url, key);
return kaDb;

}

function kaEsc(value) {
return String(value ?? "")
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;");
}

function kaCanon(value) {
return String(value || "")
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "")
.replace(/&/g, "and")
.replace(/[^a-zA-Z0-9 ]/g, " ")
.replace(/\s+/g, " ")
.trim()
.toLowerCase();
}

function kaFlag(teamName) {
try {
if (typeof flag === "function") return flag(teamName) || "";
} catch (e) {}
return "";
}

function kaOwner(teamName) {
try {
if (typeof owner === "function") return owner(teamName) || "";
} catch (e) {}
return "";
}

function kaCompleted(row) {
return row && row.winner && row.score_a !== null && row.score_b !== null;
}

function kaWinner(teamA, teamB, scoreA, scoreB) {
if (Number(scoreA) > Number(scoreB)) return teamA;
if (Number(scoreB) > Number(scoreA)) return teamB;
return "";
}

function kaInsertSection() {
let section = document.getElementById("knockout-admin");

if (!section) {
  section = document.createElement("section");
  section.id = "knockout-admin";
  section.className = "section knockout-admin walford-admin-closed";

  const main = document.querySelector("main");
  if (main) main.appendChild(section);
}

return section;

}

async function kaLoad() {
const db = kaClient();
if (!db) return;

const sessionResult = await db.auth.getSession();
kaSession = sessionResult?.data?.session || null;

const resultRows = await db
  .from("knockout_results")
  .select("*")
  .order("match_code", { ascending: true });

if (resultRows.error) {
  console.error("Could not load knockout admin rows", resultRows.error);
  kaRows = [];
} else {
  kaRows = resultRows.data || [];
}

const playerRowsA = await db
  .from("squad_players")
  .select("*")
  .order("team", { ascending: true })
  .order("player_name", { ascending: true })
  .range(0, 999);

const playerRowsB = await db
  .from("squad_players")
  .select("*")
  .order("team", { ascending: true })
  .order("player_name", { ascending: true })
  .range(1000, 1999);

if (playerRowsA.error || playerRowsB.error) {
  console.warn("Could not load squad players for knockout admin", playerRowsA.error || playerRowsB.error);
  kaPlayers = [];
} else {
  kaPlayers = [
    ...(playerRowsA.data || []),
    ...(playerRowsB.data || [])
  ];
}

}

function kaOptions() {
return kaRows
.filter(row => row.team_a && row.team_b)
.map(row => `         <option value="${kaEsc(row.match_code)}" ${row.match_code === kaSelectedCode ? "selected" : ""}>
          ${kaEsc(row.match_code)} — ${kaEsc(row.team_a)} v ${kaEsc(row.team_b)}         </option>
      `)
.join("");
}

function kaPlayersForTeam(teamName) {
const wanted = kaCanon(teamName);

return kaPlayers
  .filter(player => {
    const rawTeam = player.team || player.team_name || player.country || "";
    return kaCanon(rawTeam) === wanted || kaCanon(rawTeam).includes(wanted) || wanted.includes(kaCanon(rawTeam));
  })
  .sort((a, b) => String(a.player_name || "").localeCompare(String(b.player_name || ""), "en", { sensitivity: "base" }));

}
  
function kaPlayerOptions(teamName) {
  const players = kaPlayersForTeam(teamName);

  if (!players.length) {
    return `<option value="">No players found for ${kaEsc(teamName)}</option>`;
  }

  return `<option value="">Select scorer...</option>` + players.map(player => {
    const bits = [];
    if (player.squad_number) bits.push(`#${player.squad_number}`);
    if (player.position) bits.push(player.position);
    if (player.club) bits.push(player.club);
    const detail = bits.length ? ` — ${bits.join(" · ")}` : "";

    return `<option value="${kaEsc(player.player_name)}">${kaEsc(player.player_name)}${kaEsc(detail)}</option>`;
  }).join("");
}

function kaScorerRow(teamName) {
return `       <div class="ka-scorer-row" data-ka-team="${kaEsc(teamName)}">         <select class="ka-scorer-player">
          ${kaPlayerOptions(teamName)}         </select>         <input class="ka-scorer-goals" type="number" min="1" value="1">         <button class="button dark ka-remove-scorer" type="button">Remove</button>       </div>
    `;
}

function kaCurrentMatch() {
const code = document.getElementById("kaMatchCode")?.value || kaSelectedCode || kaRows[0]?.match_code || "";
return kaRows.find(row => row.match_code === code) || kaRows[0] || null;
}

function kaHistoryRows() {
const rows = kaRows.filter(kaCompleted);

if (!rows.length) {
  return `<p class="status">No knockout results saved yet.</p>`;
}

return rows.map(row => `
  <div class="ka-history-row">
    <strong>${kaEsc(row.match_code)}</strong>
    <span>${kaFlag(row.team_a)} ${kaEsc(row.team_a)} ${row.score_a}–${row.score_b} ${kaFlag(row.team_b)} ${kaEsc(row.team_b)}</span>
    <em>Winner: ${kaFlag(row.winner)} ${kaEsc(row.winner)} (${kaEsc(kaOwner(row.winner) || "Owner TBC")})</em>
    <button class="button dark" type="button" data-ka-edit="${kaEsc(row.match_code)}">Edit</button>
  </div>
`).join("");

}

function kaRender() {
const section = kaInsertSection();

if (!kaSession) {
  section.innerHTML = `
    <div class="section-title">
      <span>Admin HQ</span>
      <h2>Knockout Match Admin</h2>
      <p>Please sign in from the Admin Dashboard first.</p>
    </div>
  `;
  return;
}

const match = kaCurrentMatch();

if (!match) {
  section.innerHTML = `
    <div class="section-title">
      <span>Admin HQ</span>
      <h2>Knockout Match Admin</h2>
      <p>No knockout matches found.</p>
    </div>
  `;
  return;
}

kaSelectedCode = match.match_code;

section.innerHTML = `
  <div class="section-title">
    <span>Admin HQ</span>
    <h2>Knockout Match Admin</h2>
    <p>Enter the knockout score and goal scorers once. This updates the bracket and Golden Boot.</p>
  </div>

  <div class="panel">
    <form id="kaForm" class="ka-form">
      <label>
        Match
        <select id="kaMatchCode">${kaOptions()}</select>
      </label>

      <div class="ka-match-card">
  <div>
    <strong>${kaFlag(match.team_a)} ${kaEsc(match.team_a)}</strong>
    <em>${kaEsc(kaOwner(match.team_a) || "Owner TBC")}</em>
  </div>

  <input id="kaScoreA" type="number" min="0" placeholder="0" value="${match.score_a ?? ""}">

  <span>v</span>

  <input id="kaScoreB" type="number" min="0" placeholder="0" value="${match.score_b ?? ""}">

  <div>
    <strong>${kaFlag(match.team_b)} ${kaEsc(match.team_b)}</strong>
    <em>${kaEsc(kaOwner(match.team_b) || "Owner TBC")}</em>
  </div>
</div>

<div class="ka-pens">
  <label>
    Pens ${kaEsc(match.team_a)}
    <input id="kaPensA" type="number" min="0" placeholder="-" value="${match.pens_a ?? ""}">
  </label>
  <label>
    Pens ${kaEsc(match.team_b)}
    <input id="kaPensB" type="number" min="0" placeholder="-" value="${match.pens_b ?? ""}">
  </label>
</div>
    
      <div class="ka-scorers">
        <h3>Goal Scorers</h3>

        <div class="ka-team-scorers">
          <h4>${kaFlag(match.team_a)} ${kaEsc(match.team_a)}</h4>
          <div id="kaScorersA"></div>
          <button class="button dark" type="button" data-ka-add-scorer="${kaEsc(match.team_a)}" data-ka-target="kaScorersA">Add ${kaEsc(match.team_a)} scorer</button>
        </div>

        <div class="ka-team-scorers">
          <h4>${kaFlag(match.team_b)} ${kaEsc(match.team_b)}</h4>
          <div id="kaScorersB"></div>
          <button class="button dark" type="button" data-ka-add-scorer="${kaEsc(match.team_b)}" data-ka-target="kaScorersB">Add ${kaEsc(match.team_b)} scorer</button>
        </div>
      </div>

      <button class="button gold" type="submit">Save Match + Scorers</button>
    </form>

    <p id="kaStatus" class="status"></p>
  </div>

  <div class="panel">
    <h3>Knockout Results History</h3>
    <div class="ka-history">
      ${kaHistoryRows()}
    </div>
  </div>
`;

kaWire();

if (typeof applyEmojiFlags === "function") {
  applyEmojiFlags();
}

}

function kaAddScorer(teamName, targetId) {
const target = document.getElementById(targetId);
if (!target) return;

target.insertAdjacentHTML("beforeend", kaScorerRow(teamName));
kaWireScorerRemoveButtons();

}

function kaWireScorerRemoveButtons() {
document.querySelectorAll(".ka-remove-scorer").forEach(button => {
button.onclick = () => {
const row = button.closest(".ka-scorer-row");
if (row) row.remove();
};
});
}

function kaWire() {
const form = document.getElementById("kaForm");
const select = document.getElementById("kaMatchCode");

if (form) {
  form.addEventListener("submit", kaSave);
}

if (select) {
  select.addEventListener("change", () => {
    kaSelectedCode = select.value;
    kaRender();
  });
}

document.querySelectorAll("[data-ka-add-scorer]").forEach(button => {
  button.addEventListener("click", () => {
    kaAddScorer(
      button.getAttribute("data-ka-add-scorer"),
      button.getAttribute("data-ka-target")
    );
  });
});

document.querySelectorAll("[data-ka-edit]").forEach(button => {
  button.addEventListener("click", () => {
    kaSelectedCode = button.getAttribute("data-ka-edit");
    kaRender();
    document.getElementById("kaScoreA")?.focus();
  });
});

kaWireScorerRemoveButtons();

}

function kaCollectScorers() {
return Array.from(document.querySelectorAll(".ka-scorer-row"))
.map(row => {
return {
team: row.getAttribute("data-ka-team"),
player: row.querySelector(".ka-scorer-player")?.value || "",
goals: Number(row.querySelector(".ka-scorer-goals")?.value || 0)
};
})
.filter(item => item.team && item.player && Number.isInteger(item.goals) && item.goals > 0);
}

async function kaSave(event) {
event.preventDefault();

const db = kaClient();

if (!db || !kaSession) {
  alert("Please sign in first.");
  return;
}

const code = document.getElementById("kaMatchCode").value;
const row = kaRows.find(r => r.match_code === code);

if (!row) {
  alert("Match not found.");
  return;
}

const scoreA = Number(document.getElementById("kaScoreA").value);
const scoreB = Number(document.getElementById("kaScoreB").value);

if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB)) {
  alert("Enter valid scores.");
  return;
}

const pensAValue = document.getElementById("kaPensA")?.value || "";
const pensBValue = document.getElementById("kaPensB")?.value || "";

const pensA = pensAValue === "" ? null : Number(pensAValue);
const pensB = pensBValue === "" ? null : Number(pensBValue);

if (scoreA === scoreB) {
  if (!Number.isInteger(pensA) || !Number.isInteger(pensB) || pensA === pensB) {
    alert("This match is tied. Enter a valid penalty score with a clear winner.");
    return;
  }
}

const scorers = kaCollectScorers();
const scorerGoalTotal = scorers.reduce((sum, item) => sum + Number(item.goals || 0), 0);
const matchGoalTotal = scoreA + scoreB;

if (scorerGoalTotal !== matchGoalTotal) {
  const ok = confirm(
    `The score has ${matchGoalTotal} goals, but you entered ${scorerGoalTotal} scorer goals.\n\nContinue anyway?`
  );

  if (!ok) return;
}

const winner = scoreA === scoreB
  ? kaWinner(row.team_a, row.team_b, pensA, pensB)
  : kaWinner(row.team_a, row.team_b, scoreA, scoreB);

const payload = {
  match_code: row.match_code,
  round: row.round,
  team_a: row.team_a,
  team_b: row.team_b,
  score_a: scoreA,
  score_b: scoreB,
  pens_a: pensA,
  pens_b: pensB,
  winner
};

const resultSave = await db
  .from("knockout_results")
  .upsert(payload, { onConflict: "match_code" });

if (resultSave.error) {
  console.error("Knockout save error:", resultSave.error);
  alert(JSON.stringify(resultSave.error, null, 2));
  return;
}

await db
  .from("goal_scorers")
  .delete()
  .eq("match_code", code);

if (scorers.length) {
  const scorerRows = scorers.map(item => ({
    match_code: code,
    match_date: null,
    team: item.team,
    player: item.player,
    goals: item.goals
  }));

  const scorerSave = await db
    .from("goal_scorers")
    .insert(scorerRows);

  if (scorerSave.error) {
    console.error(scorerSave.error);
    alert("Result saved, but scorers could not be saved. Check goal_scorers policies.");
    return;
  }
}

document.getElementById("kaStatus").textContent = `Saved ${code}. Winner: ${winner}. Scorers updated.`;

await kaLoad();
kaRender();

}

async function kaStart() {
kaInsertSection();
await kaLoad();
kaRender();
}

document.addEventListener("DOMContentLoaded", () => {
setTimeout(kaStart, 1800);
setTimeout(kaStart, 4500);
});

window.walfordOpenKnockoutAdmin = function () {
location.hash = "#knockout-admin";
kaStart();

setTimeout(() => {
  const section = document.getElementById("knockout-admin");

  if (section) {
    section.classList.remove("walford-admin-closed");
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}, 250);

};
})();
