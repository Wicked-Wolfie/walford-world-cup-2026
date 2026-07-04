// Walford V1.0.0 Knockout Banter
// Shows daily knockout banter and teams sent home packing.
// Reads completed knockout matches from Supabase knockout_results.

(function () {
  let kbDb = null;

  function kbClient() {
    if (kbDb) return kbDb;

    const url =
      window.SUPABASE_URL ||
      (typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : "");

    const key =
      window.SUPABASE_ANON_KEY ||
      (typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : "");

    if (!window.supabase || !url || !key) return null;

    kbDb = window.supabase.createClient(url, key);
    return kbDb;
  }

  function kbEsc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function kbClean(value) {
    return String(value || "").trim();
  }

  function kbNorm(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "")
      .trim();
  }

  function kbFlag(teamName) {
    try {
    return window.WC?.teams?.flag(teamName) || "";
    } catch (_) {
     return "";
    }
  } 

  function kbOwner(teamName) {
  try {
    const team = String(teamName || "").trim();

    if (!team) return "";

    const coreOwner = window.WC?.teams?.owner(team) || "";
    if (coreOwner) {
      return window.WC?.helpers?.ownerName
        ? window.WC.helpers.ownerName(coreOwner)
        : coreOwner;
    }

    const allTeams = [
      ...(window.WC?.state?.get ? window.WC.state.get("teams") : []),
      ...(window.FALLBACK_TEAMS || [])
    ];

    const found = allTeams.find(t =>
      window.WC?.teams?.sameTeam
        ? window.WC.teams.sameTeam(t.team, team) || window.WC.teams.sameTeam(t.code, team)
        : String(t.team || "").trim().toLowerCase() === team.toLowerCase()
    );

    if (found && found.owner) {
      return window.WC?.helpers?.ownerName
        ? window.WC.helpers.ownerName(found.owner)
        : found.owner;
    }

    return "";
  } catch (e) {
    return "";
  }
}
  
  function kbRoundName(value) {
    return String(value || "Knockout")
      .replace("Quarter-final", "Quarter-final")
      .replace("Semi-final", "Semi-final");
  }

  function kbCompleted(row) {
    return Boolean(
      row &&
      row.winner &&
      row.score_a !== null &&
      row.score_b !== null
    );
  }

  function kbLoser(row) {
    const teamA = kbClean(row.team_a);
    const teamB = kbClean(row.team_b);
    const winner = kbClean(row.winner);

    if (!winner) return "";

    if (kbNorm(teamA) === kbNorm(winner)) return teamB;
    if (kbNorm(teamB) === kbNorm(winner)) return teamA;

    return "";
  }

  function kbWinnerLine(row) {
  const winner = kbClean(row.winner);
  const loser = kbLoser(row);
  const winnerOwner = kbOwner(winner) || "Owner TBC";
  const loserOwner = kbOwner(loser) || "Owner TBC";
  const scoreA = Number(row.score_a);
  const scoreB = Number(row.score_b);
  const pensA = row.pens_a === null || row.pens_a === undefined ? null : Number(row.pens_a);
  const pensB = row.pens_b === null || row.pens_b === undefined ? null : Number(row.pens_b);
  const hadPens = pensA !== null && pensB !== null;
  const margin = Math.abs(scoreA - scoreB);

  let lines = [];

  if (hadPens) {
    lines = [
      `${winnerOwner} survives the penalty lottery. ${loserOwner} is left staring into the middle distance.`,
      `${winner} held their nerve from the spot. ${loser} are now packing with trembling hands.`,
      `${winnerOwner} wins the shootout chaos. ${loserOwner} may need a lie down.`,
      `Penalties decided it, and ${winnerOwner} walks away smiling while ${loserOwner} gets the airport transfer.`,
      `${winner} scrape through on pens. ${loser} leave with heartbreak, drama and absolutely no refund.`
    ];
  } else if (margin >= 3) {
    lines = [
      `${winnerOwner} did not just win — they made a public statement. ${loserOwner} has been humbled.`,
      `${winner} turned this into a demolition job. ${loser} have been swept into the departure lounge.`,
      `${winnerOwner} enjoyed that far too much. ${loserOwner} is now avoiding the group chat.`,
      `${winner} were ruthless. ${loser} were basically luggage by full time.`,
      `${winnerOwner} marches on after a proper thumping. ${loserOwner} may claim the Wi-Fi went down.`
    ];
  } else if (margin === 1) {
    lines = [
      `${winnerOwner} edges through by the skin of their teeth. ${loserOwner} exits muttering about fine margins.`,
      `${winner} nicked it. ${loser} are out, and ${loserOwner} will be replaying that one all night.`,
      `${winnerOwner} survives a nerve-shredder. ${loserOwner} gets heartbreak with extra salt.`,
      `${winner} squeezed through. ${loser} go home wondering what might have been.`,
      `${winnerOwner} is still alive. ${loserOwner} has joined the unlucky losers club.`
    ];
  } else {
    lines = [
      `${winnerOwner} marches on. ${loserOwner} has been handed a suitcase and a sad little wave.`,
      `${winnerOwner} survives the chaos. ${loserOwner} is officially on the flight home.`,
      `${winnerOwner} keeps dreaming of glory. ${loserOwner} starts the painful post-tournament debrief.`,
      `${winnerOwner} advances. ${loserOwner} exits with dignity, sort of.`,
      `${winnerOwner} is still alive. ${loserOwner} has gone home packing and pretending not to care.`
    ];
  }

  return lines[Math.abs(kbMatchNumber(row) + kbNorm(winner).length) % lines.length];
}

  function kbPackingLine(row) {
  const loser = kbLoser(row);
  const winner = kbClean(row.winner);
  const loserOwner = kbOwner(loser) || "Owner TBC";
  const winnerOwner = kbOwner(winner) || "Owner TBC";
  const pensA = row.pens_a === null || row.pens_a === undefined ? null : Number(row.pens_a);
  const pensB = row.pens_b === null || row.pens_b === undefined ? null : Number(row.pens_b);
  const hadPens = pensA !== null && pensB !== null;

  let lines = [];

  if (hadPens) {
    lines = [
      `${loserOwner}'s ${loser} are out on penalties. That is not a defeat, that is emotional vandalism.`,
      `${loser} lost the shootout and ${loserOwner} lost a little piece of their soul.`,
      `${winnerOwner}'s ${winner} win on pens. ${loserOwner} now has a lifelong grudge against twelve yards.`,
      `${loser} are gone after penalties. ${loserOwner} may never trust a spot kick again.`,
      `${loserOwner} loses ${loser} in the cruellest way possible. The suitcase is packed through tears.`
    ];
  } else {
    lines = [
      `${loserOwner}'s ${loser} have been sent home by ${winner}. No refunds. No excuses.`,
      `${loser} are out. ${loserOwner} is now available for punditry and quiet sobbing.`,
      `${winnerOwner}'s ${winner} packed off ${loser}. ${loserOwner} may need a moment.`,
      `${loser} have left the building. ${loserOwner}'s trophy dream is now in a carrier bag.`,
      `${loserOwner} loses ${loser}. The suitcase is zipped, the dream is done.`,
      `${loser} are officially tournament furniture now. ${loserOwner} can only watch from the sofa.`,
      `${loserOwner}'s ${loser} have joined the gone-home gallery. Brutal, but fair.`,
      `${loser} are eliminated. ${loserOwner} has entered the acceptance phase, probably.`
    ];
  }

  return lines[Math.abs(kbMatchNumber(row) + kbNorm(loser).length) % lines.length];
}

 function kbScoreLine(row) {
  const pensA = row.pens_a === null || row.pens_a === undefined ? null : Number(row.pens_a);
  const pensB = row.pens_b === null || row.pens_b === undefined ? null : Number(row.pens_b);
  const pensText = pensA !== null && pensB !== null ? ` (${pensA}–${pensB} pens)` : "";

  return `${kbFlag(row.team_a)} ${kbEsc(row.team_a)} ${Number(row.score_a)}–${Number(row.score_b)} ${kbFlag(row.team_b)} ${kbEsc(row.team_b)}${pensText}`;
}

function kbMatchNumber(row) {
  const code = String(row?.match_code || "");
  const found = code.match(/\d+/);
  return found ? Number(found[0]) : 0;
}

async function kbLoadRows() {
  const db = kbClient();
  if (!db) return [];

  const { data, error } = await db
    .from("knockout_results")
    .select("*");

  if (error) {
    console.warn("Could not load knockout banter.", error);
    return [];
  }

  return (data || [])
    .filter(kbCompleted)
    .sort((a, b) => {
      const matchDiff = kbMatchNumber(b) - kbMatchNumber(a);
      if (matchDiff !== 0) return matchDiff;

      return Number(b.id || 0) - Number(a.id || 0);
    });
}

  function kbInsertSection() {
    let section = document.getElementById("knockoutBanter");

    if (!section) {
      section = document.createElement("section");
      section.id = "knockoutBanter";
      section.className = "section knockout-banter-section";

      const knockout = document.getElementById("knockout");
      const banter = document.getElementById("banter");

      if (knockout && knockout.parentNode) {
        knockout.parentNode.insertBefore(section, knockout.nextSibling);
      } else if (banter && banter.parentNode) {
        banter.parentNode.insertBefore(section, banter);
      } else {
        document.querySelector("main")?.appendChild(section);
      }
    }

    return section;
  }

  function kbRender(rows) {
    if (!rows.length) return;

    const section = kbInsertSection();
    const latest = rows[0];

    section.innerHTML = `
      <div class="section-title">
        <span>Knockout chaos</span>
        <h2>Daily Knockout Banter</h2>
        <p>Every knockout result brings glory for one owner and a long, awkward trip home for another.</p>
      </div>

      <div class="knockout-banter-grid">
        <article class="knockout-banter-card featured">
          <span>Latest knockout drama</span>
          <h3>${kbEsc(latest.match_code)} · ${kbEsc(kbRoundName(latest.round))}</h3>
          <strong>${kbScoreLine(latest)}</strong>
          <p>${kbEsc(kbWinnerLine(latest))}</p>
        </article>

        <article class="knockout-banter-card packing">
          <span>Sent home packing</span>
          <h3>${kbFlag(kbLoser(latest))} ${kbEsc(kbLoser(latest))}</h3>
          <strong>${kbEsc(kbOwner(kbLoser(latest)) || "Owner TBC")}</strong>
          <p>${kbEsc(kbPackingLine(latest))}</p>
        </article>
      </div>

      <div class="sent-home-list">
        <h3>Teams already sent home</h3>
        <div class="sent-home-grid">
          ${rows.map(row => {
            const loser = kbLoser(row);
            return `
              <article class="sent-home-card">
                <span>${kbEsc(row.match_code)}</span>
                <strong>${kbFlag(loser)} ${kbEsc(loser)}</strong>
                <em>${kbEsc(kbOwner(loser) || "Owner TBC")}</em>
                <p>${kbEsc(kbPackingLine(row))}</p>
              </article>
            `;
          }).join("")}
        </div>
      </div>
    `;

    if (typeof applyEmojiFlags === "function") {
      applyEmojiFlags();
    }
  }

  async function kbStart() {
    const rows = await kbLoadRows();
    kbRender(rows);
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(kbStart, 2600);
  });
})();
