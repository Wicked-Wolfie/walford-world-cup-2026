// Walford Admin Audit
// Read-only admin check for match results and Golden Boot scorer entries.
// Own goals do not count for Golden Boot.

(function () {
  let aaDb = null;
  let aaResults = [];
  let aaScorers = [];

  let aaScorerSortField = "match_date";
  let aaScorerSortDirection = "desc";

  let aaStartTimer = null;

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
      .select("id,match_date,team_a,team_b,score_a,score_b,own_goals")
      .order("match_date", { ascending: false })
      .limit(300);

    const scorersQuery = await db
      .from("goal_scorers")
      .select("*")
      .order("match_date", { ascending: false })
      .limit(800);

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

  function aaOwnGoalsForResult(result) {
  return Number(result.own_goals || 0);
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

  function aaExpectedGbGoals(result) {
    const resultGoals = aaResultGoalTotal(result);
    const ownGoals = aaOwnGoalsForResult(result);

    return Math.max(0, resultGoals - ownGoals);
  }

  function aaScorerGoalTotal(rows) {
    return rows.reduce((sum, row) => sum + aaGoals(row), 0);
  }

  function aaStatus(result, scorerRows) {
    const expectedGbGoals = aaExpectedGbGoals(result);
    const scorerGoals = aaScorerGoalTotal(scorerRows);
    const ownGoals = aaOwnGoalsForResult(result);

    if (expectedGbGoals === scorerGoals && ownGoals > 0) {
      return `<span style="color: #7CFF9B; font-weight: 900;">OK - own goal</span>`;
    }

    if (expectedGbGoals === scorerGoals) {
      return `<span style="color: #7CFF9B; font-weight: 900;">OK</span>`;
    }

    if (scorerGoals < expectedGbGoals) {
      return `<span style="color: #FFD35A; font-weight: 900;">Missing ${expectedGbGoals - scorerGoals}</span>`;
    }

    return `<span style="color: #FF7A7A; font-weight: 900;">Extra ${scorerGoals - expectedGbGoals}</span>`;
  }

  function aaSortValue(row, field) {
    if (field === "match_date") return String(row.match_date || "");
    if (field === "team") return String(row.team || "").toLowerCase();
    if (field === "player") return String(aaPlayerName(row) || "").toLowerCase();
    if (field === "goals") return Number(row.goals || 0);

    return "";
  }

  function aaSortedScorers() {
    return aaScorers.slice().sort((a, b) => {
      const valueA = aaSortValue(a, aaScorerSortField);
      const valueB = aaSortValue(b, aaScorerSortField);

      let result = 0;

      if (typeof valueA === "number" && typeof valueB === "number") {
        result = valueA - valueB;
      } else {
        result = String(valueA).localeCompare(String(valueB));
      }

      if (aaScorerSortDirection === "desc") {
        result = result * -1;
      }

      if (result !== 0) return result;

      return String(a.created_at || "").localeCompare(String(b.created_at || ""));
    });
  }

  function aaSortHeader(field, label) {
    const arrow =
      aaScorerSortField === field
        ? aaScorerSortDirection === "asc"
          ? " ▲"
          : " ▼"
        : "";

    return `
      <button
        type="button"
        data-aa-sort="${field}"
        style="
          background: transparent;
          border: 0;
          color: inherit;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
          padding: 0;
        "
      >${label}${arrow}</button>
    `;
  }

  function aaWireSortButtons() {
    document.querySelectorAll("[data-aa-sort]").forEach(button => {
      button.addEventListener("click", () => {
        const field = button.getAttribute("data-aa-sort");

        if (aaScorerSortField === field) {
          aaScorerSortDirection = aaScorerSortDirection === "asc" ? "desc" : "asc";
        } else {
          aaScorerSortField = field;
          aaScorerSortDirection = field === "match_date" ? "desc" : "asc";
        }

        aaRender();
      });
    });
  }

  function aaRenderResultRows() {
    if (!aaResults.length) {
      return `<p class="status">No match results found.</p>`;
    }

    return `
      <div class="panel" style="margin-top: 14px; overflow-x: auto;">
        <h3>Match Results Check</h3>
        <p class="status">
          Expected GB goals = result goals minus own goals. Own-goal players do not need to be named.
        </p>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Date</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Match</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Result goals</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Own goals</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Expected GB</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">GB goals</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Status</th>
            </tr>
          </thead>
          <tbody>
            ${aaResults.map(result => {
              const scorerRows = aaScorersForResult(result);
              const resultGoals = aaResultGoalTotal(result);
              const ownGoals = aaOwnGoalsForResult(result);
              const expectedGbGoals = aaExpectedGbGoals(result);
              const scorerGoals = aaScorerGoalTotal(scorerRows);

              return `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08);">${aaEsc(aaDateLabel(result.match_date))}</td>
                  <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    ${aaEsc(result.team_a)} ${Number(result.score_a || 0)}-${Number(result.score_b || 0)} ${aaEsc(result.team_b)}
                  </td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.08);">${resultGoals}</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.08);">${ownGoals}</td>
                  <td style="padding: 8px; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.08);">${expectedGbGoals}</td>
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
        <h3>Golden Boot Entries</h3>
        <p class="status">Click Date, Team, Player or Goals to sort.</p>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">${aaSortHeader("match_date", "Date")}</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">Match code</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">${aaSortHeader("team", "Team")}</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">${aaSortHeader("player", "Player")}</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.15);">${aaSortHeader("goals", "Goals")}</th>
            </tr>
          </thead>
          <tbody>
            ${aaSortedScorers().map(row => `
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
        <p>Read-only check. Own goals are allowed for in the audit and do not count towards Golden Boot.</p>
      </div>

      ${aaRenderResultRows()}
      ${aaRenderScorerRows()}
    `;

    aaWireSortButtons();

    if (typeof window.walfordPlayerFacesApply === "function") {
      window.walfordPlayerFacesApply();
    }
  }

  async function aaStart() {
    if (
      location.hash !== "#admin-dashboard" &&
      location.hash !== "#match-scorers-admin" &&
      location.hash !== "#results-editor-admin" &&
      location.hash !== "#golden-boot-admin"
    ) {
      return;
    }

    await aaLoad();
    aaRender();
  }

  function aaScheduleStart() {
    clearTimeout(aaStartTimer);

    aaStartTimer = setTimeout(() => {
      aaStart();
    }, 500);
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(aaStart, 1800);
    setTimeout(aaStart, 4500);
    setTimeout(aaStart, 8000);
    setTimeout(aaStart, 12000);

    const observer = new MutationObserver(() => {
      const dashboard = document.getElementById("admin-dashboard");
      const auditPanel = document.getElementById("adminAuditPanel");

      if (dashboard && !auditPanel) {
        aaScheduleStart();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });

  window.addEventListener("hashchange", () => {
    setTimeout(aaStart, 300);
    setTimeout(aaStart, 1200);
    setTimeout(aaStart, 2500);
  });
})();
