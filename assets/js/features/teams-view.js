function renderTeams(teamTotalsFn) {
  const q = (el("teamSearch").value || "").toLowerCase();

  el("teamTable").innerHTML = `
    <div class="table-row table-head">
      <div>Team</div>
      <div>Owner</div>
      <div>Match</div>
      <div>Bonus</div>
      <div>Total</div>
      <div>Stage</div>
    </div>
  ` + teamTotalsFn()
    .filter(t => (t.team + t.owner + t.group).toLowerCase().includes(q))
    .map(t => `
      <div class="table-row">
        <div>${WC.teams.flag(t.team)} <strong>${t.team}</strong></div>
        <div>${t.owner}</div>
        <div>${t.match}</div>
        <div>${t.bonus}</div>
        <div class="total">${t.total}</div>
        <div>${t.stage}</div>
      </div>
    `)
    .join("");
}

window.WC = window.WC || {};
window.WC.features = window.WC.features || {};
window.WC.features.renderTeams = renderTeams;