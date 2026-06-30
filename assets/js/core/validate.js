"use strict";

window.WC = window.WC || {};

WC.validate = {
  required(value) {
    return String(value || "").trim().length > 0;
  },

  score(value) {
    const n = Number(value);
    return Number.isInteger(n) && n >= 0;
  },

  goals(value) {
    const n = Number(value);
    return Number.isInteger(n) && n > 0;
  },

  date(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
  }
};
