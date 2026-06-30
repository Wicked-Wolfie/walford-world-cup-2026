"use strict";

window.WC = window.WC || {};

WC.format = {
  date(value) {
    if (!value) return "";
    const parts = String(value).split("-");
    if (parts.length !== 3) return String(value);
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  },

  time(value) {
    return String(value || "").slice(0, 5);
  },

  score(a, b) {
    if (a === null || a === undefined || b === null || b === undefined) {
      return "v";
    }
    return `${a} - ${b}`;
  },

  percent(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "";
    return `${n.toFixed(1)}%`;
  }
};
