function renderResults() {
  el("resultsList").innerHTML = results.length
    ? results.slice().reverse().map(m => {
        const a = Number(m.scoreA);
        const b = Number(m.scoreB);
        const pa = a > b ? 3 : a === b ? 1 : 0;
        const pb = b > a ? 3 : a === b ? 1 : 0;

        return `
          <div class="result-item">
            <div>
              <strong>${window.WC.teams.flag(m.teamA)} ${m.teamA}</strong> v
              <strong>${window.WC.teams.flag(m.teamB)} ${m.teamB}</strong><br>
              <span>${m.date} • ${WC.teams.owner(m.teamA)} +${pa}, ${WC.teams.owner(m.teamB)} +${pb}</span>
            </div>
            <div class="result-score">${a}-${b}</div>
          </div>
        `;
      }).join("")
    : "<p>No results yet.</p>";
}

window.WC = window.WC || {};
window.WC.features = window.WC.features || {};
window.WC.features.renderResults = renderResults;