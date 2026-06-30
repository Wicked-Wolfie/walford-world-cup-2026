"use strict";

window.WC = window.WC || {};

window.WC.data = {
  fallbackTeams() {
    return Array.isArray(window.FALLBACK_TEAMS)
      ? window.FALLBACK_TEAMS
      : [];
  },

  fallbackFixtures() {
    return Array.isArray(window.FALLBACK_FIXTURES)
      ? window.FALLBACK_FIXTURES
      : [];
  },

  teams() {
    const list = this.fallbackTeams();
    window.WC.state.set("teams", list);
    return list;
  },

  fixtures() {
    const list = this.fallbackFixtures();
    window.WC.state.set("fixtures", list);
    return list;
  }
};
