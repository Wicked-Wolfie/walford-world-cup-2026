// Walford V5.8.2 Homepage Knockout Tracker
// Add-on file. Does not replace knockout-auto.js.
// Shows latest knockout result, next scheduled knockout slot, and road-to-final headline.
// Group-stage slots stay as placeholders until knockout results are actually saved.

(function () {
  const KNOCKOUT_MATCHES = [
    ["M73", "Round of 32", "Group A Winner", "Group B Runner-up"],
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
    ["M88", "Round of 32", "Group D Runner-up", "Group G Runner-up"],
    ["M89", "Round of 16", "Winner M74", "Winner M77"],
    ["M90", "Round of 16", "Winner M73", "Winner M75"],
    ["M91", "Round of 16", "Winner M76", "Winner M78"],
    ["M92", "Round of 16", "Winner M79", "Winner M80"],
    ["M93", "Round of 16", "Winner M83", "Winner M84"],
    ["M94", "Round of 16", "Winner M81", "Winner M82"],
    ["M95", "Round of 16", "Winner M86", "Winner M88"],
    ["M96", "Round of 16", "Winner M85", "Winner M87"],
    ["M97", "Quarter-final", "Winner M89", "Winner M90"],
    ["M98", "Quarter-final", "Winner M93", "Winner M94"],
    ["M99", "Quarter-final", "Winner M91", "Winner M92"],
    ["M100", "Quarter-final", "Winner M95", "Winner M96"],
    ["M101", "Semi-final", "Winner M97", "Winner M98"],
    ["M102", "Semi-final", "Winner M99", "Winner M100"],
    ["FINAL", "Final", "Winner M101", "Winner M102"]
  ];

  let db = null;
  let knockoutResults = {};

  function hFlag(team) {
    try {
      return typeof flag === "function" ? flag(team) || "" : "";
    } catch (e) {
      return "";
    }
  }

  function hOwner(team) {
    try {
      return typeof owner === "function" ? owner(team) || "" : "";
    } catch (e) {
      return "";
    }
  }

  function hClean(label) {
    return String(label || "")
      .replace(/^[^\wA-ZÀ-ž]+/u, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function hSlotLabel(slot) {
    return String(slot || "")
      .replace(/^Group ([A-L]) Winner$/, "Winner Group $1")
      .replace(/^Group ([A-L]) Runner-up$/, "Runner-up Group $1");
  }

  function hResolveSlot(slot) {
    const winnerRef = String(slot).match(/^Winner (M\d+|FINAL)$/);

    if (winnerRef) {
      const result = knockoutResults[winnerRef[1]];
      return result && result.winner ? result.winner : slot;
    }

    return hSlotLabel(slot);
  }

  function hResolvedMatch(match) {
const row = knockoutResults[match[0]];
const teamA = row && row.team_a ? hClean(row.team_a) : hClean(hResolveSlot(match[2]));
const teamB = row && row.team_b ? hClean(row.team_b) : hClean(hResolveSlot(match[3]));

const played = Boolean(
row &&
row.winner &&
row.score_a !== null &&
row.score_b !== null
);

return {
code: match[0],
round: match[1],
teamA,
teamB,
played
};
}


  function hCreateClient() {
    if (db) return db;

    const url =
      window.SUPABASE_URL ||
      (typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : "");

    const key =
      window.SUPABASE_ANON_KEY ||
      (typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : "");

    if (!window.supabase || !url || !key) return null;

    db = window.supabase.createClient(url, key);
    return db;
  }

  async function hLoadKnockoutResults() {
    const client = hCreateClient();
    if (!client) return [];

    const { data, error } = await client
      .from("knockout_results")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.warn("Homepage knockout tracker could not load knockout results", error);
      return [];
    }

    knockoutResults = Object.fromEntries((data || []).map(r => [r.match_code, r]));
    return data || [];
  }

  function hLatestResult(rows) {
const completed = (rows || []).filter(row =>
row &&
row.winner &&
row.score_a !== null &&
row.score_b !== null
);

if (!completed.length) return null;

return completed
.slice()
.sort((a, b) => Number(b.id || 0) - Number(a.id || 0))[0];
}


  function hBestLiveRoadMatch() {
    const preferred = [
      "FINAL",
      "M101",
      "M102",
      "M97",
      "M98",
      "M99",
      "M100",
      "M89",
      "M90",
      "M91",
      "M92",
      "M93",
      "M94",
      "M95",
      "M96",
      "M73"
    ];

    for (const code of preferred) {
      const match = KNOCKOUT_MATCHES.find(m => m[0] === code);
      if (!match) continue;

      const resolved = hResolvedMatch(match);

      if (!resolved.played) {
        return resolved;
      }
    }

    return hNextAvailableMatch();
  }

  function hRenderResultCard(latest) {
    if (!latest) {
      return `
        <article class="home-ko-card">
          <span>Latest Knockout Result</span>
          <strong>No knockout results yet</strong>
          <em>Once a result is saved, it will appear here.</em>
        </article>
      `;
    }

    return `
      <article class="home-ko-card">
        <span>Latest Knockout Result</span>
        <strong>${hFlag(latest.team_a)} ${latest.team_a} ${latest.score_a}–${latest.score_b} ${hFlag(latest.team_b)} ${latest.team_b}</strong>
        <em>Winner: ${hFlag(latest.winner)} ${latest.winner} (${hOwner(latest.winner) || "Owner TBC"})</em>
      </article>
    `;
  }

  function hRenderNextCard(nextMatch) {
    if (!nextMatch) {
      return `
        <article class="home-ko-card">
          <span>Next Knockout Slot</span>
          <strong>Waiting for knockout stage</strong>
          <em>No knockout slots available yet.</em>
        </article>
      `;
    }

    return `
      <article class="home-ko-card">
        <span>Next Knockout Slot</span>
        <strong>${nextMatch.code}: ${hFlag(nextMatch.teamA)} ${nextMatch.teamA} v ${hFlag(nextMatch.teamB)} ${nextMatch.teamB}</strong>
        <em>${nextMatch.round}</em>
      </article>
    `;
  }

  function hRenderRoadCard(roadMatch) {
    if (!roadMatch) {
      return `
        <article class="home-ko-card">
          <span>Road to the Final</span>
          <strong>Bracket warming up</strong>
          <em>Awaiting knockout stage.</em>
        </article>
      `;
    }

    return `
      <article class="home-ko-card featured">
        <span>Road to the Final</span>
        <strong>${roadMatch.code}: ${hFlag(roadMatch.teamA)} ${roadMatch.teamA} v ${hFlag(roadMatch.teamB)} ${roadMatch.teamB}</strong>
        <em>${roadMatch.round}</em>
      </article>
    `;
  }

  function hInsertSection(html) {
    let section = document.getElementById("homeKnockoutTracker");

    if (!section) {
      section = document.createElement("section");
      section.id = "homeKnockoutTracker";
      section.className = "home-ko section";

      const main = document.querySelector("main");
      const hero = document.querySelector(".hero");
      const leaderboard = document.getElementById("leaderboard");

      if (hero && hero.parentNode) {
        hero.parentNode.insertBefore(section, hero.nextSibling);
      } else if (leaderboard && leaderboard.parentNode) {
        leaderboard.parentNode.insertBefore(section, leaderboard);
      } else if (main) {
        main.insertBefore(section, main.firstChild);
      } else {
        document.body.appendChild(section);
      }
    }

    section.innerHTML = html;
  }

  async function hStart() {
    const rows = await hLoadKnockoutResults();
    const latest = hLatestResult(rows);
    const nextMatch = hNextAvailableMatch();
    const roadMatch = hBestLiveRoadMatch();

    hInsertSection(`
      <div class="section-title home-ko-title">
        <span>Road to Glory</span>
        <h2>Knockout Tracker</h2>
        <p>Latest knockout result, next scheduled slot, and the road to the final.</p>
      </div>

      <div class="home-ko-grid">
        ${hRenderResultCard(latest)}
        ${hRenderNextCard(nextMatch)}
        ${hRenderRoadCard(roadMatch)}
      </div>
    `);
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(hStart, 1900);
  });
})();
