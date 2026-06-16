// Walford V5.8.1 Match Result + Scorers - real squad_players columns only
// Uses proper player select dropdowns inside scorer rows.

(function () {
  let msDb = null;
  let msSession = null;
  let msTeams = [];
  let msPlayers = [];
  let msRowCounter = 0;

  function msClient() {
    if (msDb) return msDb;

    const url =
      window.SUPABASE_URL ||
      (typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : "");

    const key =
      window.SUPABASE_ANON_KEY ||
      (typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : "");

    if (!window.supabase || !url || !key) return null;

    msDb = window.supabase.createClient(url, key);
    return msDb;
  }

  function msEsc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }



  function msCanonTeam(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, "and")
      .replace(/[^a-zA-Z0-9 ]/g, " ")
      .replace(/\b(fc|cf|the)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  const MS_TEAM_CODE_ALIASES = {
    "MX": ["MEX", "MX"],
    "KR": ["KOR"],
    "CZ": ["CZE"],
    "ZA": ["RSA", "SAF"],
    "CH": ["SUI"],
    "CA": ["CAN"],
    "QA": ["QAT"],
    "BA": ["BIH"],
    "GB-SCT": ["SCO"],
    "MA": ["MAR"],
    "BR": ["BRA"],
    "HT": ["HTI"],
    "US": ["USA", "US"],
    "AU": ["AUS"],
    "TR": ["TUR"],
    "PY": ["PAR"],
    "DE": ["GER"],
    "CI": ["CIV", "ICO"],
    "EC": ["ECU"],
    "CW": ["CUW"],
    "SE": ["SWE"],
    "JP": ["JPN"],
    "NL": ["NED"],
    "TN": ["TUN"],
    "BE": ["BEL"],
    "EG": ["EGY"],
    "IR": ["IRI"],
    "NZ": ["NZL"],
    "ES": ["ESP"],
    "CV": ["CPV", "CV"],
    "SA": ["KSA"],
    "UY": ["URU"],
    "FR": ["FRA"],
    "SN": ["SEN"],
    "IQ": ["IRQ"],
    "NO": ["NOR"],
    "AR": ["ARG"],
    "DZ": ["DZA", "ALG"],
    "AT": ["AUT"],
    "JO": ["JOR"],
    "PT": ["POR"],
    "CD": ["COD", "DRC"],
    "UZ": ["UZB"],
    "CO": ["COL"],
    "GB-ENG": ["ENG"],
    "HR": ["CRO"],
    "GH": ["GHA"],
    "PA": ["PAN"]
  };

  const MS_TEAM_NAME_ALIASES = {
    "mexico": ["mexico"],
    "south korea": ["south korea", "korea republic", "republic of korea", "korea"],
    "czechia": ["czechia", "czech republic"],
    "south africa": ["south africa"],
    "switzerland": ["switzerland"],
    "canada": ["canada"],
    "qatar": ["qatar"],
    "bosnia and herzegovina": ["bosnia and herzegovina", "bosnia herzegovina", "bosnia"],
    "scotland": ["scotland"],
    "morocco": ["morocco"],
    "brazil": ["brazil"],
    "haiti": ["haiti"],
    "united states": ["united states", "usa", "u s a", "united states of america", "usmnt"],
    "australia": ["australia"],
    "turkiye": ["turkiye", "turkey", "türkiye"],
    "paraguay": ["paraguay"],
    "germany": ["germany"],
    "ivory coast": ["ivory coast", "cote d ivoire", "cote divoire", "côte d ivoire"],
    "ecuador": ["ecuador"],
    "curacao": ["curacao", "curaçao"],
    "sweden": ["sweden"],
    "japan": ["japan"],
    "netherlands": ["netherlands", "holland"],
    "tunisia": ["tunisia"],
    "belgium": ["belgium"],
    "egypt": ["egypt"],
    "iran": ["iran", "iran islamic republic"],
    "new zealand": ["new zealand"],
    "spain": ["spain"],
    "cape verde": ["cape verde", "cabo verde"],
    "saudi arabia": ["saudi arabia", "saudi"],
    "uruguay": ["uruguay"],
    "france": ["france"],
    "senegal": ["senegal"],
    "iraq": ["iraq"],
    "norway": ["norway"],
    "argentina": ["argentina"],
    "algeria": ["algeria"],
    "austria": ["austria"],
    "jordan": ["jordan"],
    "portugal": ["portugal"],
    "dr congo": ["dr congo", "d r congo", "congo dr", "democratic republic of congo", "congo democratic republic"],
    "uzbekistan": ["uzbekistan"],
    "colombia": ["colombia"],
    "england": ["england"],
    "croatia": ["croatia"],
    "ghana": ["ghana"],
    "panama": ["panama"]
  };

function msFallbackTeams() {
  if (typeof teams !== "undefined" && Array.isArray(teams)) return teams;
  if (typeof window.teams !== "undefined" && Array.isArray(window.teams)) return window.teams;
  if (typeof allocations !== "undefined" && Array.isArray(allocations)) return allocations;
  if (typeof window.allocations !== "undefined" && Array.isArray(window.allocations)) return window.allocations;
  if (typeof TEAMS !== "undefined" && Array.isArray(TEAMS)) return TEAMS;
  if (typeof window.TEAMS !== "undefined" && Array.isArray(window.TEAMS)) return window.TEAMS;
  if (typeof allTeams !== "undefined" && Array.isArray(allTeams)) return allTeams;
  if (typeof window.allTeams !== "undefined" && Array.isArray(window.allTeams)) return window.allTeams;
  return [];
}
  
  function msTeamCode(teamName) {
    const row = msFallbackTeams().find(t => t.team === teamName);
    const code = String(row?.code || "").toUpperCase();
    return code;
  }

  function msExpectedCodes(teamName) {
    const allocationCode = msTeamCode(teamName);
    const codes = new Set();
    if (allocationCode) codes.add(allocationCode);
    (MS_TEAM_CODE_ALIASES[allocationCode] || []).forEach(code => codes.add(code));
    return Array.from(codes);
  }

  function msTeamKeys(team) {
    const key = msCanonTeam(team);
    const keys = new Set([key]);
    (MS_TEAM_NAME_ALIASES[key] || []).forEach(name => keys.add(msCanonTeam(name)));

    // Also map common code-looking team values.
    const upper = String(team || "").toUpperCase().trim();
    Object.entries(MS_TEAM_CODE_ALIASES).forEach(([siteCode, fifaCodes]) => {
      if (upper === siteCode || fifaCodes.includes(upper)) {
        const siteTeam = msFallbackTeams().find(t => String(t.code || "").toUpperCase() === siteCode);
        if (siteTeam) {
          keys.add(msCanonTeam(siteTeam.team));
          (MS_TEAM_NAME_ALIASES[msCanonTeam(siteTeam.team)] || []).forEach(name => keys.add(msCanonTeam(name)));
        }
      }
    });

    return Array.from(keys);
  }

  function msTeamMatches(a, b) {
    const aKeys = msTeamKeys(a);
    const bKeys = msTeamKeys(b);
    return aKeys.some(key => bKeys.includes(key));
  }

  function msPlayerMatchesTeam(player, teamName) {
    const expectedCodes = msExpectedCodes(teamName);
    const rawCode = String(player.team_code || "").toUpperCase().trim();

    if (rawCode && expectedCodes.includes(rawCode)) return true;

    const playerTeam = String(player.team || "");
    if (msTeamMatches(playerTeam, teamName)) return true;

    // Last-resort: some imports put the code at the start of the team label, e.g. "USA United States".
    const wantedKeys = msTeamKeys(teamName);
    const playerKey = msCanonTeam(playerTeam.replace(/^[A-Z]{2,3}\s+/, ""));
    return wantedKeys.includes(playerKey);
  }

  function msPlayersForTeam(teamName) {
    return msPlayers
      .filter(p => msPlayerMatchesTeam(p, teamName))
      .slice()
      .sort((a, b) =>
        String(a.player_name || "").localeCompare(String(b.player_name || ""), "en", { sensitivity: "base" })
      );
  }

  function msPlayerOptionsForTeam(teamName, selected = "") {
    const rows = msPlayersForTeam(teamName);

    let html = `<option value="">Select player...</option>`;

    if (!rows.length) {
      html += `<option value="">No squad players found for ${msEsc(teamName)} (${msEsc(msExpectedCodes(teamName).join(", "))})</option>`;
      return html;
    }

    if (selected && !rows.some(p => p.player_name === selected)) {
      html += `<option value="${msEsc(selected)}" selected>${msEsc(selected)} — existing value</option>`;
    }

    html += rows.map(p => {
      const bits = [];
      if (p.squad_number) bits.push(`#${p.squad_number}`);
      if (p.position) bits.push(p.position);
      if (p.club) bits.push(p.club);
      const detail = bits.length ? ` — ${bits.join(" · ")}` : "";
      return `<option value="${msEsc(p.player_name)}" ${p.player_name === selected ? "selected" : ""}>${msEsc(p.player_name)}${msEsc(detail)}</option>`;
    }).join("");

    return html;
  }

  async function msLoad() {
    const db = msClient();
    if (!db) return;

    const session = await db.auth.getSession();
    msSession = session?.data?.session || null;

    msTeams = msFallbackTeams().slice().sort((a, b) =>
      String(a.team || "").localeCompare(String(b.team || ""), "en", { sensitivity: "base" })
    );

    const { data, error } = await db
      .from("squad_players")
      .select("team,team_code,player_name,shirt_name,position,club,squad_number")
      .order("team", { ascending: true })
      .order("player_name", { ascending: true });

    if (!error && data) {
      msPlayers = data;
    } else {
      msPlayers = [];
      console.warn("Combined admin could not load squad_players.", error);
    }
  }

  function msInsert() {
    let section = document.getElementById("match-scorers-admin");
    if (!section) {
      section = document.createElement("section");
      section.id = "match-scorers-admin";
      section.className = "section match-scorers-admin";

      const matchCentre = document.getElementById("match-centre");
      if (matchCentre && matchCentre.parentNode) {
        matchCentre.parentNode.insertBefore(section, matchCentre);
      } else {
        document.querySelector("main")?.appendChild(section);
      }
    }
    return section;
  }

  function msRender() {
    const section = msInsert();

    if (!msSession) {
      section.innerHTML = `
        <div class="section-title">
          <span>Admin Shortcut</span>
          <h2>Match Result + Scorers</h2>
          <p>Sign in using the main Admin button to save a result and Golden Boot scorers together.</p>
        </div>
        <div class="ms-panel">
          <strong>Admin sign-in required</strong>
          <p>Once signed in, this panel saves the match result and scorer entries in one go.</p>
        </div>
      `;
      return;
    }

    const firstTeam = msTeams[0]?.team || "";
    const secondTeam = msTeams[1]?.team || "";

    section.innerHTML = `
      <div class="section-title">
        <span>Admin Shortcut</span>
        <h2>Match Result + Scorers</h2>
        <p>Save the match result and Golden Boot scorer entries together.</p>
      </div>

      <div class="ms-panel">
        <form id="msForm" class="ms-form">
          <div class="ms-result-grid">
            <label>
              Match date
              <input id="msMatchDate" type="date" required>
            </label>

            <label>
              Match code
              <input id="msMatchCode" type="text" placeholder="e.g. M75">
            </label>

            <label>
              Team A
              <select id="msTeamA" required>${msTeamOptions(firstTeam)}</select>
            </label>

            <label>
              Score A
              <input id="msScoreA" type="number" min="0" value="0" required>
            </label>

            <label>
              Score B
              <input id="msScoreB" type="number" min="0" value="0" required>
            </label>

            <label>
              Team B
              <select id="msTeamB" required>${msTeamOptions(secondTeam)}</select>
            </label>
          </div>

          <div class="ms-scorer-head">
            <div>
              <h3>Goal scorers</h3>
              <p>Add one row per scorer. Use goals > 1 for braces, hat-tricks, etc.</p>
            </div>
            <button id="msAddScorer" class="button dark" type="button">Add scorer row</button>
          </div>

          <div id="msScorerRows" class="ms-scorer-rows"></div>

          <div class="ms-actions">
            <button class="button gold" type="submit">Save result + scorers</button>
            <button id="msClearRows" class="button dark" type="button">Clear scorers</button>
          </div>

          <p id="msStatus" class="status"></p>
        </form>
      </div>
    `;

    document.getElementById("msAddScorer").addEventListener("click", () => msAddScorerRow());
    document.getElementById("msClearRows").addEventListener("click", () => {
      document.getElementById("msScorerRows").innerHTML = "";
      msRowCounter = 0;
      msAddScorerRow();
    });
    document.getElementById("msForm").addEventListener("submit", msSaveAll);

    msAddScorerRow(firstTeam);
  }

  function msAddScorerRow(defaultTeam = "") {
    const container = document.getElementById("msScorerRows");
    if (!container) return;

    msRowCounter += 1;
    const selected = defaultTeam || document.getElementById("msTeamA")?.value || msTeams[0]?.team || "";

    const row = document.createElement("div");
    row.className = "ms-scorer-row";
    row.innerHTML = `
      <select class="msScorerTeam">${msTeamOptions(selected)}</select>
      <select class="msScorerPlayer">${msPlayerOptionsForTeam(selected)}</select>
      <input class="msScorerGoals" type="number" min="1" value="1" placeholder="Goals">
      <button class="button dark msRemoveScorer" type="button">Remove</button>
    `;

    container.appendChild(row);

    const teamSelect = row.querySelector(".msScorerTeam");
    const playerSelect = row.querySelector(".msScorerPlayer");

    teamSelect.addEventListener("change", () => {
      playerSelect.innerHTML = msPlayerOptionsForTeam(teamSelect.value);
      playerSelect.value = "";
    });

    row.querySelector(".msRemoveScorer").addEventListener("click", () => row.remove());
  }

  function msCollectedScorers() {
    const rows = Array.from(document.querySelectorAll("#msScorerRows .ms-scorer-row"));
    return rows.map(row => {
      const team = row.querySelector(".msScorerTeam").value;
      const player = row.querySelector(".msScorerPlayer").value;
      const goals = Number(row.querySelector(".msScorerGoals").value);
      return { team, player, goals };
    }).filter(s => s.team && s.player && Number.isInteger(s.goals) && s.goals > 0);
  }

  async function msSaveAll(event) {
    event.preventDefault();

    const db = msClient();
    if (!db || !msSession) return alert("Please sign in first.");

    const status = document.getElementById("msStatus");
    status.textContent = "Saving...";

    const match_date = document.getElementById("msMatchDate").value;
    const match_code = document.getElementById("msMatchCode").value.trim() || null;
    const team_a = document.getElementById("msTeamA").value;
    const team_b = document.getElementById("msTeamB").value;
    const score_a = Number(document.getElementById("msScoreA").value);
    const score_b = Number(document.getElementById("msScoreB").value);
    const scorers = msCollectedScorers();

    if (!match_date || !team_a || !team_b || team_a === team_b) {
      status.textContent = "";
      return alert("Choose a date and two different teams.");
    }

    if (!Number.isInteger(score_a) || !Number.isInteger(score_b) || score_a < 0 || score_b < 0) {
      status.textContent = "";
      return alert("Enter valid scores.");
    }

    const totalScorerGoals = scorers.reduce((sum, s) => sum + Number(s.goals || 0), 0);
    const totalMatchGoals = score_a + score_b;

    if (scorers.length && totalScorerGoals !== totalMatchGoals) {
      const ok = confirm(`The scorers total ${totalScorerGoals} goals, but the match score totals ${totalMatchGoals} goals.\n\nSave anyway?`);
      if (!ok) {
        status.textContent = "";
        return;
      }
    }

    const { data: existing, error: findError } = await db
      .from("results")
      .select("id,team_a,team_b")
      .eq("match_date", match_date)
      .or(`and(team_a.eq.${team_a},team_b.eq.${team_b}),and(team_a.eq.${team_b},team_b.eq.${team_a})`)
      .limit(1);

    if (findError) {
      console.warn("Could not check for existing result, will try inserting.", findError);
    }

    let resultError = null;

    if (existing && existing.length) {
      const update = await db
        .from("results")
        .update({ match_date, team_a, team_b, score_a, score_b })
        .eq("id", existing[0].id);
      resultError = update.error;
    } else {
      const insert = await db
        .from("results")
        .insert({ match_date, team_a, team_b, score_a, score_b });
      resultError = insert.error;
    }

    if (resultError) {
      console.error(resultError);
      status.textContent = "";
      return alert("Could not save match result. Use the original Match Centre form for the result, then try scorers again.");
    }

    if (match_code) {
      const del = await db.from("goal_scorers").delete().eq("match_code", match_code);
      if (del.error) {
        console.error(del.error);
        status.textContent = "";
        return alert("Result saved, but could not clear old scorers for this match code.");
      }
    }

    if (scorers.length) {
      const payload = scorers.map(s => ({
        match_date,
        match_code,
        team: s.team,
        player: s.player,
        goals: s.goals
      }));

      const scorerInsert = await db.from("goal_scorers").insert(payload);
      if (scorerInsert.error) {
        console.error(scorerInsert.error);
        status.textContent = "";
        return alert("Result saved, but scorer entries failed. Check the Golden Boot table/policies.");
      }
    }

    status.textContent = "Saved result and scorers.";
    setTimeout(() => location.reload(), 900);
  }

  async function msStart() {
    await msLoad();
    msRender();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(msStart, 3000);
  });
})();
