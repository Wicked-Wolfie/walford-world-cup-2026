function renderDraw() {
  el("drawGrid").innerHTML = OWNERS
    .map(o => `
      <article class="draw-card">
        <h3>${o}</h3>
        ${teams
          .filter(t => t.owner === o)
          .map(t => `<span class="pill">${window.WC.teams.flag(t.team)} ${t.team}</span>`)
          .join("")}
      </article>
    `)
    .join("");
}
window.WC = window.WC || {};
window.WC.features = window.WC.features || {};
window.WC.features.renderDraw = renderDraw;