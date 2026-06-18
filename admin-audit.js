// Walford Admin Audit
// Read-only admin check for match results and Golden Boot scorer entries.

(function () {
  let aaDb = null;
  let aaResults = [];
  let aaScorers = [];

  function aaClient() {
    if (aaDb) return aaDb;

    const url =
      window.SUPABASE_URL ||
      (typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : "");

    const key =
      window.SUPABASE_ANON_KEY ||
      (typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : "");

    if (!window.supabase || !url || !key) return null;

    aaDb = window.supabase.createClient(url, key);
    return aaDb;
  }

  function aaEsc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function aaDateLabel(value) {
    if (!value) return "No date";
    const parts = String(value).split("-");
    if (parts.length !== 3) return value;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  async function aaIsSignedIn() {
    const db = aaClient();
    if (!db) return false;

    const result = await db.auth.getSession();
    return !!result?.data?.session;
  }

  async function aaLoad() {
    const db = aaClient();
    if (!db) return;

    const signedIn = await aaIsSignedIn();
    if (!signedIn) {
      aaResults = [];
      aaScorers = [];
      return;
    }

    const resultsQuery = await db
      .from("results")
      .select("id,match_date,team_a,team_b,score_a,score_b")
      .order("match_date", { ascending: false })
      .limit(300);

    const scorersQuery = await db
      .from("goal_scorers")
      .select("*")
      .order("match_date", { ascending: false })
      .limit(500);

    if (resultsQuery.error) {
      console.warn("Admin audit could not load results.", resultsQuery.error);
      aaResults = [];
    } else {
      aaResults = resultsQuery.data || [];
    }

    if (scorersQuery.error) {
      console.warn("Admin audit could not load goal_scorers.", scorersQuery.error);
      aaScorers = [];
    } else {
      aaScorers = scorersQuery.data || [];
    }
  }

  function aaPlayerName(row) {
    return row.player_name || row.player || row.scorer || row.shirt_name || "";
  }

  function aaGoals(row) {
    return Number(row.goals || 0);
  }

  function aaScorersForResult(result) {
    return aaScorers.filter(row => {
      const sameDate = String(row.match_date || "") === String(result.match_date || "");
      const sameTeam =
        String(row.team || "") === String(result.team_a || "") ||
        String(row.team || "") === String(result.team_b || "");

      return sameDate && sameTeam;
    });
  }

  function aaResultGoalTotal(result) {
    return Number(result.score_a || 0) + Number(result.score_b || 0);
  }

  function aaScorerGoalTotal(rows) {
    return rows.reduce((sum, row) => sum + aaGoals(row), 0);
  }

  function aaStatus(result, scorerRows) {
    const resultGoals = aaResultGoalTotal(result);
    const scorerGoals = aaScorerGoalTotal(scorerRows);

    if (resultGoals === scorerGoals) {
      return `<span style="color: #7CFF9B; font-weight: 900;">OK</span>`;
    }

    if (scorerGoals < resultGoals) {
      return `<span style="color: #FFD35A; font-weight: 900;">Missing ${resultGoals - scorerGoals}</span>`;
    }

    return `<span style="color: #FF7A7A; font-weight: 900;">Extra ${scorerGoals - resultGoals}</span>`;
  }

  function aaRenderResultRows() {
    if (!aaResults.length) {
      return `<p class="status">No match results found.</p>`;
    }

    return `
      <div class="panel" style="margin-top: 14px; overflow-x: auto;">
        <h3>Match Results Check</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Date</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Match</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Result goals</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">GB goals</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Status</th>
            </tr>
          </thead>
          <tbody>
            ${aaResults.map(result => {
              const scorerRows = aaScorersForResult(result);
              const resultGoals = aaResultGoalTotal(result);
              const scorerGoals = aaScorerGoalTotal(scorerRows);

              return `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08);">${aaEsc(aaDateLabel(result.match_date))}</td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    ${aaEsc(result.team_a)} ${Number(result.score_a || 0)}-${Number(result.score_b || 0)} ${aaEsc(result.team_b)}
                  </td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.08);">${resultGoals}</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.08);">${scorerGoals}</td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08);">${aaStatus(result, scorerRows)}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function aaRenderScorerRows() {
    if (!aaScorers.length) {
      return `<p class="status">No Golden Boot scorer entries found.</p>`;
    }

    return `
      <div class="panel" style="margin-top: 14px; overflow-x: auto;">
        <h3>Golden Boot Entries by Date</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Date</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Match code</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Team</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Player</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Goals</th>
            </tr>
          </thead>
          <tbody>
            ${aaScorers.map(row => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08);">${aaEsc(aaDateLabel(row.match_date))}</td>
                <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08);">${aaEsc(row.match_code || "")}</td>
                <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08);">${aaEsc(row.team || "")}</td>
                <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08);">${aaEsc(aaPlayerName(row))}</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.08);">${aaGoals(row)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function aaRender() {
    const dashboard = document.getElementById("admin-dashboard");
    if (!dashboard) return;

    let panel = document.getElementById("adminAuditPanel");

    if (!panel) {
      panel = document.createElement("div");
      panel.id = "adminAuditPanel";
      panel.className = "admin-audit";
      dashboard.appendChild(panel);
    }

    panel.innerHTML = `
      <div class="section-title" style="margin-top: 28px;">
        <span>Admin Audit</span>
        <h2>Results and Golden Boot Check</h2>
        <p>Read-only check. Result goals should usually match Golden Boot goals, unless there was an own goal.</p>
      </div>

      ${aaRenderResultRows()}
      ${aaRenderScorerRows()}
    `;
  }

  async function aaStart() {
    if (
      location.hash !== "#admin-dashboard" &&
      location.hash !== "#match-scorers-admin" &&
      location.hash !== "#results-editor-admin"
    ) {
      return;
    }

    await aaLoad();
    aaRender();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(aaStart, 1800);
    setTimeout(aaStart, 4500);
    setInterval(aaStart, 5000);
  });

  window.addEventListener("hashchange", () => {
    setTimeout(aaStart, 300);
    setTimeout(aaStart, 1200);
  });
})();
