function renderGroups(gs) {
  el("groupTabs").innerHTML = GROUPS
    .map(g => `
      <button class="group-tab ${g === activeGroup ? "active" : ""}" type="button" data-group="${g}">
        Group ${g}
      </button>
    `)
    .join("");

  el("groupTables").innerHTML = `
    <div class="group-card">
      <h3>Group ${activeGroup}</h3>
      ${WC.features.tableMarkup(gs.filter(s => s.group === activeGroup))}
    </div>
  `;

  document.querySelectorAll(".group-tab").forEach(btn => {
    btn.onclick = () => {
      activeGroup = btn.dataset.group;
      WC.features.renderGroups(window.WC.features.groupStatsFn());
    };
  });
}

window.WC = window.WC || {};
window.WC.features = window.WC.features || {};

window.WC.features.renderGroups = renderGroups;
window.WC.features.setGroupStatsFn = function (fn) {
  window.WC.features.groupStatsFn = fn;
};