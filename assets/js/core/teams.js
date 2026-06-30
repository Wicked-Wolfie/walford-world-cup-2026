"use strict";

window.WC = window.WC || {};

window.WC.teams = {
  aliases: {
    USA: ["USA", "US", "United States", "United States of America"],
    SUI: ["SUI", "CH", "Switzerland"],
    KOR: ["KOR", "KR", "South Korea", "Korea Republic"],
    CIV: ["CIV", "Ivory Coast", "Côte d'Ivoire"],
    COD: ["COD", "DR Congo", "Congo DR"]
  },

  normalise(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  },

  sameTeam(a, b) {
    const aa = this.normalise(a);
    const bb = this.normalise(b);
    if (!aa || !bb) return false;
    if (aa === bb) return true;

    return Object.values(this.aliases).some(list => {
      const keys = list.map(x => this.normalise(x));
      return keys.includes(aa) && keys.includes(bb);
    });
  }
};
