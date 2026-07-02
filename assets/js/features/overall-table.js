function tableMarkup(rows) {
  return `
    <div class="table-row table-head">
      <div>Team</div>
      <div>Owner</div>
      <div>P</div>
      <div>W</div>
      <div>D</div>
      <div>L</div>
      <div>GF</div>
      <div>GA</div>
      <div>GD</div>
      <div>Pts</div>
    </div>
  ` + rows.map(s => `
    <div class="table-row">
      <div>${WC.teams.flag(s.team)} <strong>${s.team}</strong></div>
      <div>${s.owner}</div>
      <div>${s.P}</div>
      <div>${s.W}</div>
      <div>${s.D}</div>
      <div>${s.L}</div>
      <div>${s.GF}</div>
      <div>${s.GA}</div>
      <div>${s.GD}</div>
      <div class="pts-cell">${s.Pts}</div>
    </div>
  `).join("");
}

function renderOverall(gs) {
  const q = (el("groupSearch").value || "").toLowerCase();

  el("overallTable").innerHTML = tableMarkup(
    gs.filter(s => (s.team + s.owner + s.group).toLowerCase().includes(q))
  );
}

window.WC = window.WC || {};
window.WC.features = window.WC.features || {};
window.WC.features.tableMarkup = tableMarkup;
window.WC.features.renderOverall = renderOverall;