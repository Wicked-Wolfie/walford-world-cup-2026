function renderToday(fixturesArg) {
  const fixtureList = fixturesArg || window.FALLBACK_FIXTURES || [];
  const games = fixtureList.filter(f => f.date === el("todayDate").value);

  el("todayMatches").innerHTML = games.length
    ? games.map(f => {
        const oa = WC.teams.owner(f.team_a);
        const ob = WC.teams.owner(f.team_b);

        return `
          <article class="today-card">
            <div class="today-time">${f.time || "TBC"} GMT</div>
            <h3>${window.WC.teams.flag(f.team_a)} ${f.team_a} v ${window.WC.teams.flag(f.team_b)} ${f.team_b}</h3>
            <div class="owners-line">${oa} v ${ob}</div>
            <p class="banter-copy">“${WC.features.banterFor(oa, ob, f.team_a, f.team_b)}”</p>
          </article>
        `;
      }).join("")
    : "<p>No fixtures loaded for this date yet.</p>";
}

window.WC = window.WC || {};
window.WC.features = window.WC.features || {};
window.WC.features.renderToday = renderToday;