"use strict";

window.WC = window.WC || {};

WC.render = {
  empty(title, message) {
    return `
      <div class="wc-empty">
        <strong>${WC.dom.esc(title)}</strong>
        <span>${WC.dom.esc(message)}</span>
      </div>
    `;
  },

  badge(text) {
    return `<span class="wc-badge">${WC.dom.esc(text)}</span>`;
  },

  teamName(team) {
    const found = WC.teams.find(team);
    if (!found) return WC.dom.esc(team);
    return `${WC.dom.esc(found.flag || "")} ${WC.dom.esc(found.team || team)}`;
  },

  owner(team) {
    const owner = WC.teams.owner(team);
    return WC.helpers.ownerName(owner);
  },

  goals(value) {
    const n = WC.helpers.number(value, 0);
    return `${n} goal${n === 1 ? "" : "s"}`;
  }
};
