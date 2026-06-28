// Walford global flag fix v5.8.14
// Fixes flags across Fixture Centre, Daily Results, Knockout, Groups and tables.
// England and Scotland are built from code points to avoid hidden Unicode paste problems.

(function () {
  function makeFlag(code) {
    return String.fromCodePoint(
      ...code.toUpperCase().split("").map(char => 127397 + char.charCodeAt(0))
    );
  }

  const ENGLAND_FLAG = String.fromCodePoint(
    0x1F3F4,
    0xE0067,
    0xE0062,
    0xE0065,
    0xE006E,
    0xE0067,
    0xE007F
  );

  const SCOTLAND_FLAG = String.fromCodePoint(
    0x1F3F4,
    0xE0067,
    0xE0062,
    0xE0073,
    0xE0063,
    0xE0074,
    0xE007F
  );

  const FLAG_CODES = {
    "Mexico": "MX",
    "South Africa": "ZA",
    "South Korea": "KR",
    "Korea Republic": "KR",
    "Czechia": "CZ",

    "Canada": "CA",
    "Bosnia and Herzegovina": "BA",
    "Qatar": "QA",
    "Switzerland": "CH",

    "Brazil": "BR",
    "Morocco": "MA",
    "Haiti": "HT",
    "Scotland": "SCOTLAND",

    "United States": "US",
    "USA": "US",
    "Paraguay": "PY",
    "Australia": "AU",
    "Turkey": "TR",
    "Türkiye": "TR",

    "Germany": "DE",
    "Curacao": "CW",
    "Curaçao": "CW",
    "Ivory Coast": "CI",
    "Ecuador": "EC",

    "Netherlands": "NL",
    "Japan": "JP",
    "Sweden": "SE",
    "Tunisia": "TN",

    "Belgium": "BE",
    "Egypt": "EG",
    "Iran": "IR",
    "New Zealand": "NZ",

    "Spain": "ES",
    "Cape Verde": "CV",
    "Saudi Arabia": "SA",
    "Uruguay": "UY",

    "France": "FR",
    "Senegal": "SN",
    "Iraq": "IQ",
    "Norway": "NO",

    "Argentina": "AR",
    "Algeria": "DZ",
    "Austria": "AT",
    "Jordan": "JO",

    "Portugal": "PT",
    "DR Congo": "CD",
    "Congo DR": "CD",
    "Uzbekistan": "UZ",
    "Colombia": "CO",

    "England": "ENGLAND",
    "Croatia": "HR",
    "Ghana": "GH",
    "Panama": "PA"
  };

  function cleanTeamName(value) {
    return String(value || "")
      .replace(/^[^\wA-ZÀ-ž]+/u, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function walfordFlag(teamName) {
    const clean = cleanTeamName(teamName);
    const code = FLAG_CODES[clean];

    if (code === "ENGLAND") return ENGLAND_FLAG;
    if (code === "SCOTLAND") return SCOTLAND_FLAG;
    if (code) return makeFlag(code);

    const teams = window.FALLBACK_TEAMS || window.teams || window.TEAMS || [];
    const found = teams.find(t =>
      cleanTeamName(t.team) === clean ||
      cleanTeamName(t.name) === clean
    );

    if (found && found.flag && found.flag !== "🏴") {
      return found.flag;
    }

    return "";
  }

  window.walfordFlag = walfordFlag;
  window.flag = walfordFlag;

  if (Array.isArray(window.FALLBACK_TEAMS)) {
    window.FALLBACK_TEAMS = window.FALLBACK_TEAMS.map(team => {
      const fixedFlag = walfordFlag(team.team || team.name);

      if (fixedFlag) {
        return {
          ...team,
          flag: fixedFlag
        };
      }

      return team;
    });
  }
})();
