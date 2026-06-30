"use strict";

window.WC = window.WC || {};

window.WC.state = {
  teams: [],
  fixtures: [],
  results: [],
  players: [],
  scorers: [],

  set(key, value) {
    this[key] = Array.isArray(value) ? value : [];
  },

  get(key) {
    return Array.isArray(this[key]) ? this[key] : [];
  },

  reset() {
    this.teams = [];
    this.fixtures = [];
    this.results = [];
    this.players = [];
    this.scorers = [];
  }
};
