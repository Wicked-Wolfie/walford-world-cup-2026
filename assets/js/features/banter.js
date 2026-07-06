function leaderDisplayName(owner) {
  const names = {
    Charlotte: "Lottie",
    Debbie: "Dubs"
  };

  return names[owner] || owner;
}

function leaderChangeBanter(currentLeader) {
  if (!currentLeader) return "";

  const storageKey = "walfordLastLeader";
  let previousLeader = "";

  try {
    previousLeader = localStorage.getItem(storageKey) || "";
    localStorage.setItem(storageKey, currentLeader);
  } catch (error) {
    console.warn("Leader change banter storage unavailable.", error);
    return "";
  }

  if (!previousLeader || previousLeader === currentLeader) {
    return "";
  }

  const oldName = leaderDisplayName(previousLeader);
  const newName = leaderDisplayName(currentLeader);

  const lines = [
    `${oldName} has lost his 👑 All hail ${newName} 🙇`,
    `${oldName} has been knocked off the throne 👑 ${newName} takes command.`,
    `Breaking news: ${oldName}'s reign is over. ${newName} is now top dog.`,
    `${newName} has stolen the crown from ${oldName}. Family WhatsApp will be unbearable.`,
    `${oldName} slips. ${newName} rises. The syndicate has a new ruler.`
  ];

  return lines[Math.floor(Math.random() * lines.length)];
}

function renderBanter(lb, totals, todayGames) {
  const dRank = lb.findIndex(x => x.owner === "David") + 1;
  const dPts = lb.find(x => x.owner === "David")?.total || 0;
  const eng = totals.find(t => t.team === "England") || {};
  const feud = todayGames[0] || knockoutFeudToday();

  const currentLeader = lb[0]?.owner || "";
  const leadChange = leaderChangeBanter(currentLeader);
  const leaderBanterEl = el("leaderChangeBanter");

  if (leaderBanterEl) {
    leaderBanterEl.textContent = leadChange || "";
  }

  el("banterFavourite").textContent =
    `${leaderDisplayName(lb[0]?.owner) || "-"}, ${lb[0]?.total || 0} pts`;

  el("banterFlop").textContent =
    `${leaderDisplayName(lb[lb.length - 1]?.owner) || "-"}, ${lb[lb.length - 1]?.total || 0} pts`;

  el("banterDavid").textContent =
    `${dRank}${WC.helpers.suffix(dRank)} place, ${(lb[0]?.total || 0) - dPts} behind`;

  el("banterEngland").innerHTML =
    `${window.WC.teams.flag("England")} ${eng.stage || "Group Stage"}, ${eng.total || 0} pts`;

  el("banterTeam").innerHTML =
    totals[0]
      ? `${window.WC.teams.flag(totals[0].team)} ${totals[0].team}, ${totals[0].total} pts`
      : "-";

  if (feud) {
    const ownerA = WC.teams.owner(feud.team_a);
    const ownerB = WC.teams.owner(feud.team_b);

    el("banterFeud").textContent =
      `${leaderDisplayName(ownerA)} v ${leaderDisplayName(ownerB)} - ${WC.features.banterFor(ownerA, ownerB, feud.team_a, feud.team_b)}`;
  } else {
    el("banterFeud").textContent = "Awaiting today's fixtures";
  }
}

function knockoutFeudToday() {
  const today = el("todayDate")?.value || WC.helpers.todayISO();

  const games = {
    "2026-07-03": [
      { team_a: "Australia", team_b: "Egypt" },
      { team_a: "Argentina", team_b: "Cape Verde" }
    ],
    "2026-07-04": [
      { team_a: "Colombia", team_b: "Ghana" },
      { team_a: "Canada", team_b: "Morocco" },
      { team_a: "Paraguay", team_b: "France" }
    ],
    "2026-07-05": [
      { team_a: "Brazil", team_b: "Norway" }
    ],
    "2026-07-06": [
      { team_a: "Mexico", team_b: "England" },
      { team_a: "Portugal", team_b: "Spain" },
      { team_a: "United States", team_b: "Belgium" }
    ]
  };

  return games[today]?.[0] || null;
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

window.WC = window.WC || {};
window.WC.features = window.WC.features || {};
window.WC.features.renderBanter = renderBanter;
window.WC.features.banterFor = banterFor;