// Walford V5.8.1 Daily Results & Cheeky Banter
// Public homepage section.
// Shows latest match results with light-hearted syndicate banter.

(function () {
  let dbBanter = null;

  function dbCreateClient() {
    if (dbBanter) return dbBanter;

    const url =
      window.SUPABASE_URL ||
      (typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : "");

    const key =
      window.SUPABASE_ANON_KEY ||
      (typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : "");

    if (!window.supabase || !url || !key) return null;

    dbBanter = window.supabase.createClient(url, key);
    return dbBanter;
  }

  function dbEsc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function dbDateLabel(value) {
    if (!value) return "Date TBC";

    const parts = String(value).split("-");
    if (parts.length !== 3) return value;

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function dbFlag(team) {
    try {
      return typeof flag === "function" ? flag(team) || "" : "";
    } catch (e) {
      return "";
    }
  }

  function dbOwner(team) {
    try {
      const name = typeof owner === "function" ? owner(team) || "" : "";
      return name || "Syndicate TBC";
    } catch (e) {
      return "Syndicate TBC";
    }
  }

  function dbWinner(result) {
    const scoreA = Number(result.score_a || 0);
    const scoreB = Number(result.score_b || 0);

    if (scoreA > scoreB) {
      return {
        team: result.team_a,
        owner: dbOwner(result.team_a),
        goals: scoreA,
        against: scoreB
      };
    }

    if (scoreB > scoreA) {
      return {
        team: result.team_b,
        owner: dbOwner(result.team_b),
        goals: scoreB,
        against: scoreA
      };
    }

    return null;
  }

  function dbLoser(result) {
    const scoreA = Number(result.score_a || 0);
    const scoreB = Number(result.score_b || 0);

    if (scoreA > scoreB) {
      return {
        team: result.team_b,
        owner: dbOwner(result.team_b),
        goals: scoreB,
        against: scoreA
      };
    }

    if (scoreB > scoreA) {
      return {
        team: result.team_a,
        owner: dbOwner(result.team_a),
        goals: scoreA,
        against: scoreB
      };
    }

    return null;
  }

  function dbBanterLine(result) {
    const scoreA = Number(result.score_a || 0);
    const scoreB = Number(result.score_b || 0);
    const totalGoals = scoreA + scoreB;
    const margin = Math.abs(scoreA - scoreB);

    const winner = dbWinner(result);
    const loser = dbLoser(result);

    const teamA = result.team_a || "Team A";
    const teamB = result.team_b || "Team B";
    const ownerA = dbOwner(teamA);
    const ownerB = dbOwner(teamB);

    if (scoreA === 0 && scoreB === 0) {
      return `${ownerA} and ${ownerB} have agreed to call that one “tactical”. Everyone else may call it 90 minutes missing from their lives.`;
    }

    if (scoreA === scoreB) {
      return `${ownerA} and ${ownerB} both escape with a point. Nobody gets bragging rights, but both can still pretend they were unlucky.`;
    }

    if (winner && loser && margin >= 5) {
      return `${winner.owner}'s ${winner.team} have gone full demolition job. ${loser.owner}'s ${loser.team} may want to check if defending is still allowed.`;
    }

    if (winner && loser && margin >= 3) {
      return `${winner.owner}'s ${winner.team} made that look a bit too easy. ${loser.owner}'s ${loser.team} are probably requesting a recount.`;
    }

    if (winner && loser && totalGoals >= 5) {
      return `${winner.owner}'s ${winner.team} win the shootout. ${loser.owner}'s ${loser.team} contributed to the chaos but forgot the happy ending.`;
    }

    if (winner && loser && margin === 1 && totalGoals >= 3) {
      return `${winner.owner}'s ${winner.team} nick it in a proper nerve-shredder. ${loser.owner}'s ${loser.team} were close enough to be annoying.`;
    }

    if (winner && loser && margin === 1) {
      return `${winner.owner}'s ${winner.team} get the job done by the slimmest margin. ${loser.owner}'s ${loser.team} will be filing this under “nearly”.`;
    }

    if (winner && loser) {
      return `${winner.owner}'s ${winner.team} take the points. ${loser.owner}'s ${loser.team} take the excuses.`;
    }

    return `The result is in. The syndicates can now begin the completely calm and reasonable post-match analysis.`;
  }

  async function dbLoadResults() {
    const client = dbCreateClient();
    if (!client) return [];

    const { data, error } = await client
      .from("results")
      .select("id,match_date,team_a,team_b,score_a,score_b")
      .order("match_date", { ascending: false })
      .order("id", { ascending: false })
      .limit(12);

    if (error) {
      console.warn("Daily banter could not load results.", error);
      return [];
    }

    return data || [];
  }

  function dbResultCard(result) {
    const teamA = result.team_a || "";
    const teamB = result.team_b || "";
    const scoreA = Number(result.score_a || 0);
    const scoreB = Number(result.score_b || 0);

    return `
      <article class="daily-banter-card">
        <div class="daily-banter-date">${dbEsc(dbDateLabel(result.match_date))}</div>

        <div class="daily-banter-score">
          <strong>${dbEsc(dbFlag(teamA))} ${dbEsc(teamA)}</strong>
          <span>${scoreA}–${scoreB}</span>
          <strong>${dbEsc(dbFlag(teamB))} ${dbEsc(teamB)}</strong>
        </div>

        <div class="daily-banter-owners">
          ${dbEsc(dbOwner(teamA))} v ${dbEsc(dbOwner(teamB))}
        </div>

        <p>${dbEsc(dbBanterLine(result))}</p>
      </article>
    `;
  }

  function dbInstallCss() {
    if (document.getElementById("dailyBanterCss")) return;

    const style = document.createElement("style");
    style.id = "dailyBanterCss";
    style.textContent = `
      .daily-banter-section {
        margin-top: 28px;
      }

      .daily-banter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 14px;
      }

      .daily-banter-card {
        border: 1px solid rgba(255,255,255,0.14);
        border-radius: 18px;
        padding: 16px;
        background: rgba(255,255,255,0.06);
        box-shadow: 0 12px 30px rgba(0,0,0,0.18);
      }

      .daily-banter-date {
        font-size: 0.78rem;
        opacity: 0.72;
        margin-bottom: 8px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .daily-banter-score {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 10px;
        align-items: center;
        margin-bottom: 8px;
      }

      .daily-banter-score strong {
        font-size: 0.95rem;
        line-height: 1.2;
      }

      .daily-banter-score strong:last-child {
        text-align: right;
      }

      .daily-banter-score span {
        font-size: 1.25rem;
        font-weight: 950;
        color: #ffd35a;
      }

      .daily-banter-owners {
        font-size: 0.82rem;
        opacity: 0.78;
        margin-bottom: 10px;
        font-weight: 800;
      }

      .daily-banter-card p {
        margin: 0;
        line-height: 1.45;
      }
    `;

    document.head.appendChild(style);
  }

  function dbInsertSection(results) {
    if (!results.length) return;

    dbInstallCss();

    let section = document.getElementById("daily-banter");

    if (!section) {
      section = document.createElement("section");
      section.id = "daily-banter";
      section.className = "section daily-banter-section";

      const main = document.querySelector("main");
      const knockout = document.getElementById("knockout");
      const leaderboard = document.getElementById("leaderboard");
      const banter = document.getElementById("banter");

      if (knockout && knockout.parentNode) {
        knockout.parentNode.insertBefore(section, knockout);
      } else if (leaderboard && leaderboard.parentNode) {
        leaderboard.parentNode.insertBefore(section, leaderboard.nextSibling);
      } else if (banter && banter.parentNode) {
        banter.parentNode.insertBefore(section, banter);
      } else if (main) {
        main.appendChild(section);
      } else {
        document.body.appendChild(section);
      }
    }

    section.innerHTML = `
      <div class="section-title">
        <span>Matchday Mischief</span>
        <h2>Daily Results & Cheeky Banter</h2>
        <p>The scores are official. The comments are absolutely not.</p>
      </div>

      <div class="daily-banter-grid">
        ${results.map(dbResultCard).join("")}
      </div>
    `;
  }

  async function dbStart() {
    const results = await dbLoadResults();
    dbInsertSection(results);
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(dbStart, 2200);
  });
})();
