// Walford Knockout Admin v1.0.0
// Proper admin-only knockout result entry and edit screen.

(function () {
  let kaDb = null;
  let kaSession = null;
  let kaRows = [];

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

    const { data, error } = await db
      .from("knockout_results")
      .select("*")
      .order("match_code", { ascending: true });

    if (error) {
      console.error("Could not load knockout admin rows", error);
      kaRows = [];
      return;
    }

    kaRows = data || [];
  }

  function kaOptions() {
    return kaRows
      .filter(row => row.team_a && row.team_b)
      .map(row => `
        <option value="${kaEsc(row.match_code)}">
          ${kaEsc(row.match_code)} — ${kaEsc(row.team_a)} v ${kaEsc(row.team_b)}
        </option>
      `)
      .join("");
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
          <h2>Knockout Result Entry</h2>
          <p>Please sign in from the Admin Dashboard first.</p>
        </div>
      `;
      return;
    }

    section.innerHTML = `
      <div class="section-title">
        <span>Admin HQ</span>
        <h2>Knockout Result Entry</h2>
        <p>Enter or amend knockout results. Winners move forward automatically on the public bracket.</p>
      </div>

      <div class="panel">
        <form id="kaForm" class="ka-form">
          <select id="kaMatchCode">
            ${kaOptions()}
          </select>
          <input id="kaScoreA" type="number" min="0" placeholder="A">
          <span>v</span>
          <input id="kaScoreB" type="number" min="0" placeholder="B">
          <button class="button gold" type="submit">Save Knockout Result</button>
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
  }

  function kaFillEdit(matchCode) {
    const row = kaRows.find(r => r.match_code === matchCode);
    if (!row) return;

    document.getElementById("kaMatchCode").value = row.match_code;
    document.getElementById("kaScoreA").value = row.score_a ?? "";
    document.getElementById("kaScoreB").value = row.score_b ?? "";

    document.getElementById("kaStatus").textContent =
      `Editing ${row.match_code}: ${row.team_a} v ${row.team_b}`;
  }

  function kaWire() {
    const form = document.getElementById("kaForm");

    if (form) {
      form.addEventListener("submit", kaSave);
    }

    document.querySelectorAll("[data-ka-edit]").forEach(button => {
      button.addEventListener("click", () => {
        kaFillEdit(button.getAttribute("data-ka-edit"));
      });
    });
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

    if (scoreA === scoreB) {
      alert("Knockout matches need a winner. Enter the post-penalty winner score.");
      return;
    }

    const winner = kaWinner(row.team_a, row.team_b, scoreA, scoreB);

    const payload = {
      match_code: row.match_code,
      round: row.round,
      team_a: row.team_a,
      team_b: row.team_b,
      score_a: scoreA,
      score_b: scoreB,
      winner
    };

    const { error } = await db
      .from("knockout_results")
      .upsert(payload, { onConflict: "match_code" });

    if (error) {
      console.error(error);
      alert("Could not save knockout result.");
      return;
    }

    document.getElementById("kaStatus").textContent = `Saved ${code}. Winner: ${winner}`;

    await kaLoad();
    kaRender();

    if (typeof wkStart === "function") {
      wkStart();
    }
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
