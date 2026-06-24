document.addEventListener("DOMContentLoaded", () => {
  el("adminToggle").onclick = () => {
    el("adminPanel").classList.remove("hidden");
    el("match-centre").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  el("teamSearch").oninput = renderTeams;
  el("groupSearch").oninput = () => renderOverall(groupStats());
  el("todayDate").onchange = render;
  el("showTodayBtn").onclick = renderToday;

  el("loginForm").onsubmit = async e => {
    e.preventDefault();

    if (!db) return alert("Supabase key not configured.");

    const { error } = await db.auth.signInWithPassword({
      email: el("email").value,
      password: el("password").value
    });

    if (error) return alert(error.message);

    await loadData();
    await loadTeamOdds();
  };

  el("logoutBtn").onclick = async () => {
    if (db) await db.auth.signOut();

    await loadData();
    await loadTeamOdds();
  };

  el("resultForm").onsubmit = async e => {
    e.preventDefault();

    if (!session) return alert("Please sign in first.");

    const payload = {
      match_date: el("matchDate").value,
      team_a: el("teamA").value,
      team_b: el("teamB").value,
      score_a: Number(el("scoreA").value),
      score_b: Number(el("scoreB").value)
    };

    if (payload.team_a === payload.team_b) {
      return alert("Choose two different teams.");
    }

    const { error } = await db.from("results").insert([payload]);

    if (error) {
      console.error(error);
      return alert("Could not save result. Check results insert policy.");
    }

    el("scoreA").value = "";
    el("scoreB").value = "";

    await loadData();
    await loadTeamOdds();
  };

  el("fixtureForm").onsubmit = async e => {
    e.preventDefault();

    if (!session) return alert("Please sign in first.");

    const payload = {
      match_date: el("fixtureDate").value,
      kickoff_gmt: el("fixtureTime").value,
      team_a: el("fixtureTeamA").value,
      team_b: el("fixtureTeamB").value
    };

    if (payload.team_a === payload.team_b) {
      return alert("Choose two different teams.");
    }

    const { error } = await db.from("fixtures").insert([payload]);

    if (error) {
      console.error(error);
      return alert("Could not save fixture. Check fixtures insert policy.");
    }

    await loadData();
    await loadTeamOdds();
  };

  loadData().then(loadTeamOdds);
});
