"use strict";

window.WC = window.WC || {};

window.WC.teams = {

    aliases: {
  USA: ["USA","US","United States","United States of America"],
  ESP: ["ESP","ES","Spain"],
  SUI: ["SUI","CH","Switzerland"],
  KOR: ["KOR","KR","South Korea","Korea Republic"],
  CIV: ["CIV","CI","Ivory Coast","Côte d'Ivoire"],
  COD: ["COD","CD","DR Congo","Congo DR"],
  ENG: ["ENG","GB-ENG","England"],
  SCO: ["SCO","GB-SCT","Scotland"],
  TUR: ["TUR","TR","Türkiye","Turkey"],
  GER: ["GER","DE","Germany"],
  BRA: ["BRA","BR","Brazil"],
  MEX: ["MEX","MX","Mexico"],
  JPN: ["JPN","JP","Japan"],
  URU: ["URU","UY","Uruguay"]
},

    normalise(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");
    },

    sameTeam(a, b) {

        const aa = this.normalise(a);
        const bb = this.normalise(b);

        if (!aa || !bb) return false;

        if (aa === bb) return true;

        for (const list of Object.values(this.aliases)) {

            const keys = list.map(v => this.normalise(v));

            if (keys.includes(aa) && keys.includes(bb))
                return true;
        }

        return false;
    },

    fallbackForTeam(team, code) {

    const nameKey = this.normalise(team);
    const codeKey = String(code || "").toUpperCase();

    return (window.FALLBACK_TEAMS || []).find(t =>
        this.normalise(t.team) === nameKey ||
        String(t.code || "").toUpperCase() === codeKey ||
        this.sameTeam(t.team, team) ||
        this.sameTeam(t.code, code)
    );

},
    find(team) {

        const teams = window.WC.state.get("teams");

        return teams.find(t =>
            this.sameTeam(t.team, team) ||
            this.sameTeam(t.code, team)
        );

    },

    owner(team) {

        const t = this.find(team);

            if (t) return t.owner;

        const fallback = (window.FALLBACK_TEAMS || []).find(x =>
            this.sameTeam(x.team, team) ||
            this.sameTeam(x.code, team)
    );

        return fallback ? fallback.owner : "";

    },

    flag(team) {

        const t = this.find(team);

        return t ? t.flag : "";

    }

};
