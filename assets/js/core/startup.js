"use strict";

window.WC = window.WC || {};

window.WC.startup = {
  init() {
    if (window.WC.data) {
      window.WC.data.teams();
      window.WC.data.fixtures();
    }

    console.log("WC V6 Core loaded", {
      teams: window.WC.state.get("teams").length,
      fixtures: window.WC.state.get("fixtures").length
    });
  }
};

window.WC.startup.init();
