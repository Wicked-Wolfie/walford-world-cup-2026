 "use strict";

window.WC = window.WC || {};

WC.config = {
  version: "6.0.0",
  appName: "Walford World Cup 2026",

  selectors: {
    main: "main",
    adminButton: "#adminToggle, #adminBtn, .admin-btn",
    goldenBoot: "#golden-boot",
    squadHub: "#squad-hub",
    matchCentre: "#match-centre",
    knockout: "#knockout"
  },

  points: {
    groupWin: 3,
    groupDraw: 1,
    groupLoss: 0,
    roundOf32: 2,
    roundOf16: 3,
    quarterFinal: 6,
    semiFinal: 10,
    final: 15,
    winner: 25
  }
};
