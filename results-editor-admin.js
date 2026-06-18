// Walford Results Editor Admin
// Lets admin correct result date and score from the website.

(function () {
  let reDb = null;
  let reSession = null;
  let reResults = [];
  let reEditingId = null;

  function reClient() {
    if (reDb) return reDb;

    const url =
      window.SUPABASE_URL ||
      (typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : "");

    const key =
      window.SUPABASE_ANON_KEY ||
      (typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : "");

    if (!window.supabase || !url || !key) return null;

    reDb = window.supabase.createClient(url, key);
    return reDb;
  }

  function reEsc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function reDateLabel(value) {
    if (!value) return "";
    const parts = String(value).split("-");
    if (parts.length !== 3) return value;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function reFlag(teamName) {
    try {
      if (typeof flag === "function") return flag(teamName) || "";
    } catch (e) {}

    const lists = [
      typeof teams !== "undefined" ? teams : null,
      window.teams,
      typeof allocations !== "undefined" ? allocations : null,
      window.allocations,
      typeof TEAMS !== "undefined" ? TEAMS : null,
      window.TEAMS
    ];

    for (const list of lists) {
      if (!Array.isArray(list)) continue;
      const row = list.find(t => t.team === teamName || t.name === teamName || t.country === teamName);
      if (row) return row.flag || row.emoji || "";
    }

    return "";
  }

  async function reLoad() {
    const db = reClient();
    if (!db) return;

    const session = await db.auth.getSession();
    reSession = session?.data?.session || null;

    if (!reSession) {
      reResults = [];
      return;
    }

    const { data, error } = await db
      .from("results")
      .select("id,match_date,team_a,team_b,score_a,score_b")
      .order("match_date", { ascending: false })
      .limit(80);

    if (error) {
      console.warn("Result editor could not load results.", error);
      reResults = [];
    } else {
      reResults = data || [];
    }
  }

  function reInsert() {
    let section = document.getElementById("results-editor-admin");
    if (!section) {
      section = document.createElement("section");
      section.id = "results-editor-admin";
      section.className = "section results-editor-admin";

      const matchScorers = document.getElementById("match-scorers-admin");
      if (matchScorers && matchScorers.parentNode) {
        matchScorers.parentNode.insertBefore(section, matchScorers.nextSibling);
      } else {
        const matchCentre = document.getElementById("match-centre");
        if (matchCentre && matchCentre.parentNode) {
          matchCentre.parentNode.insertBefore(section, matchCentre);
        } else {
          document.querySelector("main")?.appendChild(section);
        }
      }
    }
    return section;
  }

  function reEditorForm() {
    if (!reEditingId) return "";

    const row = reResults.find(r => Number(r.id) === Number(reEditingId));
    if (!row) return "";

    return `
      <div class="ms-panel">
        <h3>Editing result</h3>
        <p>Use this to correct the date or score. If scorer entries exist for this match, their date will be moved too.</p>

        <form id="reEditForm" class="ms-form">
          <div class="ms-result-grid">
            <label>
              Match date
              <input id="reMatchDate" type="date" value="${reEsc(row.match_date || "")}" required>
            </label>

            <label>
              Team A
              <input type="text" value="${reEsc(row.team_a || "")}" disabled>
            </label>

            <label>
              Score A
              <input id="reScoreA" type="number" min="0" value="${Number(row.score_a || 0)}" required>
            </label>

            <label>
              Score B
              <input id="reScoreB" type="number" min="0" value="${Number(row.score_b || 0)}" required>
            </label>

            <label>
              Team B
              <input type="text" value="${reEsc(row.team_b || "")}" disabled>
            </label>
          </div>

          <div class="ms-actions">
            <button class="button gold" type="submit">Save correction</button>
            <button id="reCancelEdit" class="button dark" type="button">Cancel</button>
          </div>

          <p id="reStatus" class="status"></p>
        </form>
      </div>
    `;
  }

  function reResultsList() {
    if (!reResults.length) {
      return `<p class="gb-muted">No results found yet.</p>`;
    }

    return `
      <div class="gb-admin-list">
        <h4>Recent results</h4>
        <div class="gb-admin-rows">
          ${reResults.map(row => `
            <div class="gb-admin-row">
              <div>
                <strong>${reEsc(reDateLabel(row.match_date))}</strong>
                <span>
                  ${reEsc(reFlag(row.team_a))} ${reEsc(row.team_a)}
                  ${Number(row.score_a || 0)}-${Number(row.score_b || 0)}
                  ${reEsc(reFlag(row.team_b))} ${reEsc(row.team_b)}
                </span>
              </div>
              <div class="gb-admin-buttons">
                <button class="button dark re-edit-result" type="button" data-re-edit="${row.id}">Edit</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function reRender() {
    const section = reInsert();

    if (!reSession) {
      section.innerHTML = "";
      return;
    }

    section.innerHTML = `
      <div class="section-title">
        <span>Admin Shortcut</span>
        <h2>Edit Existing Result</h2>
        <p>Correct a result date or score without using Supabase SQL.</p>
      </div>

      ${reEditorForm()}

      <div class="ms-panel">
        ${reResultsList()}
      </div>
    `;

    reWire();
  }

  function reWire() {
    document.querySelectorAll(".re-edit-result").forEach(button => {
      button.addEventListener("click", () => {
        reEditingId = Number(button.getAttribute("data-re-edit"));
        reRender();
      });
    });

    const cancel = document.getElementById("reCancelEdit");
    if (cancel) {
      cancel.addEventListener("click", () => {
        reEditingId = null;
        reRender();
      });
    }

    const form = document.getElementById("reEditForm");
    if (form) {
      form.addEventListener("submit", reSaveEdit);
    }
  }

  async function reSaveEdit(event) {
    event.preventDefault();

    const db = reClient();
    if (!db || !reSession) return alert("Please sign in first.");

    const row = reResults.find(r => Number(r.id) === Number(reEditingId));
    if (!row) return alert("Could not find that result.");

    const status = document.getElementById("reStatus");
    if (status) status.textContent = "Saving correction...";

    const oldDate = row.match_date;
    const newDate = document.getElementById("reMatchDate").value;
    const scoreA = Number(document.getElementById("reScoreA").value);
    const scoreB = Number(document.getElementById("reScoreB").value);

    if (!newDate) {
      if (status) status.textContent = "";
      return alert("Choose a match date.");
    }

    if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) {
      if (status) status.textContent = "";
      return alert("Enter valid scores.");
    }

    const resultUpdate = await db
      .from("results")
      .update({
        match_date: newDate,
        score_a: scoreA,
        score_b: scoreB
      })
      .eq("id", row.id);

    if (resultUpdate.error) {
      console.error(resultUpdate.error);
      if (status) status.textContent = "";
      return alert("Could not update the result.");
    }

    if (oldDate && oldDate !== newDate) {
      const scorerUpdate = await db
        .from("goal_scorers")
        .update({ match_date: newDate })
        .eq("match_date", oldDate)
        .in("team", [row.team_a, row.team_b]);

      if (scorerUpdate.error) {
        console.error(scorerUpdate.error);
        if (status) status.textContent = "";
        return alert("Result date changed, but scorer dates could not be updated. Check Golden Boot manually.");
      }
    }

    if (status) status.textContent = "Correction saved.";

    reEditingId = null;
    await reLoad();
    reRender();

    setTimeout(() => location.reload(), 700);
  }

  async function reStart() {
    await reLoad();
    reRender();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(reStart, 3300);
  });
})();
