// V3.6 Knockout Bracket
// This adds a starter bracket using official slot names.
// Later we can auto-fill these from group standings.

const KNOCKOUT_BRACKET = {
  r32: [
    ["Match 73", "Group A Runner-up", "Group B Runner-up"],
    ["Match 74", "Group E Winner", "Best 3rd place"],
    ["Match 75", "Group F Winner", "Group C Runner-up"],
    ["Match 76", "Group C Winner", "Group F Runner-up"],
    ["Match 77", "Group I Winner", "Best 3rd place"],
    ["Match 78", "Group E Runner-up", "Group I Runner-up"],
    ["Match 79", "Group A Winner", "Best 3rd place"],
    ["Match 80", "Group L Winner", "Best 3rd place"],
    ["Match 81", "Group D Winner", "Best 3rd place"],
    ["Match 82", "Group G Winner", "Best 3rd place"],
    ["Match 83", "Group K Runner-up", "Group L Runner-up"],
    ["Match 84", "Group H Winner", "Group J Runner-up"],
    ["Match 85", "Group B Winner", "Best 3rd place"],
    ["Match 86", "Group J Winner", "Group H Runner-up"],
    ["Match 87", "Group K Winner", "Best 3rd place"],
    ["Match 88", "Group D Runner-up", "Group G Runner-up"]
  ],
  r16: [
    ["Match 89", "Winner M74", "Winner M77"],
    ["Match 90", "Winner M73", "Winner M75"],
    ["Match 91", "Winner M76", "Winner M78"],
    ["Match 92", "Winner M79", "Winner M80"],
    ["Match 93", "Winner M83", "Winner M84"],
    ["Match 94", "Winner M81", "Winner M82"],
    ["Match 95", "Winner M86", "Winner M88"],
    ["Match 96", "Winner M85", "Winner M87"]
  ],
  qf: [
    ["Match 97", "Winner M89", "Winner M90"],
    ["Match 98", "Winner M93", "Winner M94"],
    ["Match 99", "Winner M91", "Winner M92"],
    ["Match 100", "Winner M95", "Winner M96"]
  ],
  sf: [
    ["Match 101", "Winner M97", "Winner M98"],
    ["Match 102", "Winner M99", "Winner M100"]
  ],
  final: [
    ["Final", "Winner M101", "Winner M102"]
  ]
};

function bracketCard(match) {
  return `
    <div class="bracket-match">
      <small>${match[0]}</small>
      <div class="bracket-team"><strong>${match[1]}</strong><span>TBC</span></div>
      <div class="bracket-team"><strong>${match[2]}</strong><span>TBC</span></div>
    </div>
  `;
}

function renderKnockoutBracket() {
  const map = {
    "bracket-r32": KNOCKOUT_BRACKET.r32,
    "bracket-r16": KNOCKOUT_BRACKET.r16,
    "bracket-qf": KNOCKOUT_BRACKET.qf,
    "bracket-sf": KNOCKOUT_BRACKET.sf,
    "bracket-final": KNOCKOUT_BRACKET.final
  };

  Object.entries(map).forEach(([id, matches]) => {
    const target = document.getElementById(id);
    if (target) target.innerHTML = matches.map(bracketCard).join("");
  });
}

document.addEventListener("DOMContentLoaded", renderKnockoutBracket);
