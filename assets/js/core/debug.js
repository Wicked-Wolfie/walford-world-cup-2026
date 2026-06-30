"use strict";

window.WC = window.WC || {};

WC.debug = {
  enabled: true,

  log(label, data) {
    if (!this.enabled) return;
    console.log(`[WC] ${label}`, data || "");
  },

  warn(label, data) {
    if (!this.enabled) return;
    console.warn(`[WC] ${label}`, data || "");
  },

  error(label, data) {
    console.error(`[WC] ${label}`, data || "");
  }
};
