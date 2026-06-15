// Walford V4.3 Knockout Bracket Auto Section
// Separate file. Does not modify app.js or Supabase.
// Injects a knockout bracket section before Banter and calculates current group position placeholders.

const WALFORD_KNOCKOUT_MATCHES = {
  r32: [
    ["M73", "Group A Runner-up", "Group B Runner-up"],
    ["M74", "Group E Winner", "Best 3rd Place"],
    ["M75", "Group F Winner", "Group C Runner-up"],
    ["M76", "Group C Winner", "Group F Runner-up"],
    ["M77", "Group I Winner", "Best 3rd Place"],
    ["M78", "Group E Runner-up", "Group I Runner-up"],
    ["M79", "Group A Winner", "Best 3rd Place"],
    ["M80", "Group L Winner", "Best 3rd Place"],
    ["M81", "Group D Winner", "Best 3rd Place"],
    ["M82", "Group G Winner", "Best 3rd Place"],
    ["M83", "Group K Runner-up", "Group L Runner-up"],
    ["M84", "Group H Winner", "Group J Runner-up"],
    ["M85", "Group B Winner", "Best 3rd Place"],
    ["M86", "Group J Winner", "Group H Runner-up"],
    ["M87", "Group K Winner", "Best 3rd Place"],
    ["M88", "Group D Runner-up", "Group G Runner-up"]
  ],
  r16: [
    ["M89", "Winner M74", "Winner M77"],
    ["M90", "Winner M73", "Winner M75"],
    ["M91", "Winner M76", "Winner M78"],
    ["M92", "Winner M79", "Winner M80"],
    ["M93", "Winner M83", "Winner M84"],
    ["M94", "Winner M81", "Winner M82"],
    ["M95", "Winner M86", "Winner M88"],
    ["M96", "Winner M85", "Winner M87"]
  ],
  qf: [
    ["M97", "Winner M89", "Winner M90"],
    ["M98", "Winner M93", "Winner M94"],
    ["M99", "Winner M91", "Winner M92"],
    ["M100", "Winner M95", "Winner M96"]
  ],
  sf: [
    ["M101", "Winner M97", "Winner M98"],
    ["M102", "Winner M99", "Winner M100"]
  ],
  final: [
    ["Final", "Winner M101", "Winner M102"]
  ]
};

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

function wkGroupStatsSafe() {
  try {
    if (typeof groupStats === "function") return groupStats();
  } catch(e) {}
  return [];
}

function wkGroupTop(groupLetter, position) {
  const all = wkGroupStatsSafe();
  const groupRows = all.filter(t => t.group === groupLetter);
  if (!groupRows.length) return null;
  return groupRows[position - 1] || null;
}

function wkResolveSlot(slot) {
  const winner = slot.match(/^Group ([A-L]) Winner$/);
  if (winner) {
    const team = wkGroupTop(winner[1], 1);
    if (team) return `${team.flag || wkFlag(team.team)} ${team.team}`;
  }

  const runner = slot.match(/^Group ([A-L]) Runner-up$/);
  if (runner) {
    const team = wkGroupTop(runner[1], 2);
    if (team) return `${team.flag || wkFlag(team.team)} ${team.team}`;
  }

  return slot;
}

function wkTeamLine(label) {
  const resolved = wkResolveSlot(label);
  const isPlaceholder = resolved === label;
  const ownerText = isPlaceholder ? "TBC" : wkOwner(resolved.replace(/^[^\w]*\s?/, ""));
  return `
    <div class="wk-team">
      <span>${resolved}</span>
      <em>${ownerText || "TBC"}</em>
    </div>
  `;
}

function wkCard(match) {
  return `
    <article class="wk-match">
      <small>${match[0]}</small>
      ${wkTeamLine(match[1])}
      ${wkTeamLine(match[2])}
    </article>
  `;
}

function wkRound(title, key) {
  return `
    <div class="wk-round">
      <h3>${title}</h3>
      <div class="wk-list">
        ${WALFORD_KNOCKOUT_MATCHES[key].map(wkCard).join("")}
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
      <p>Round of 32 through to the Final. Group winners and runners-up are projected from the current live group tables.</p>
    </div>

    <div class="wk-notice">
      <strong>Projection mode:</strong>
      Bracket slots update from current group standings. Final confirmed places will lock in once the group stage is complete.
    </div>

    <div class="wk-bracket">
      ${wkRound("Round of 32", "r32")}
      ${wkRound("Round of 16", "r16")}
      ${wkRound("Quarter-finals", "qf")}
      ${wkRound("Semi-finals", "sf")}
      ${wkRound("Final", "final")}
    </div>
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
  const old = document.getElementById("knockout");
  if (!old) return;

  const bracket = old.querySelector(".wk-bracket");
  if (!bracket) return;

  bracket.innerHTML = `
    ${wkRound("Round of 32", "r32")}
    ${wkRound("Round of 16", "r16")}
    ${wkRound("Quarter-finals", "qf")}
    ${wkRound("Semi-finals", "sf")}
    ${wkRound("Final", "final")}
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(wkRenderBracket, 1500);
});
