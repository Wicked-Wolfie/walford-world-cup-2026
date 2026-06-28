// Walford global flag fix v5.8.12
// Fixes flags across Fixture Centre, Daily Results, Knockout, Groups and tables.

(function () {
  const ENGLAND_FLAG = "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
  const SCOTLAND_FLAG = "🏴󠁧󠁢󠁳󠁣󠁴󠁿";

  const FLAG_MAP = {
    "Mexico": "🇲🇽",
    "South Africa": "🇿🇦",
    "South Korea": "🇰🇷",
    "Korea Republic": "🇰🇷",
    "Czechia": "🇨🇿",

    "Canada": "🇨🇦",
    "Bosnia and Herzegovina": "🇧🇦",
    "Qatar": "🇶🇦",
    "Switzerland": "🇨🇭",

    "Brazil": "🇧🇷",
    "Morocco": "🇲🇦",
    "Haiti": "🇭🇹",
    "Scotland": SCOTLAND_FLAG,

    "United States": "🇺🇸",
    "USA": "🇺🇸",
    "Paraguay": "🇵🇾",
    "Australia": "🇦🇺",
    "Turkey": "🇹🇷",
    "Türkiye": "🇹🇷",

    "Germany": "🇩🇪",
    "Curacao": "🇨🇼",
    "Curaçao": "🇨🇼",
    "Ivory Coast": "🇨🇮",
    "Ecuador": "🇪🇨",

    "Netherlands": "🇳🇱",
    "Japan": "🇯🇵",
    "Sweden": "🇸🇪",
    "Tunisia": "🇹🇳",

    "Belgium": "🇧🇪",
    "Egypt": "🇪🇬",
    "Iran": "🇮🇷",
    "New Zealand": "🇳🇿",

    "Spain": "🇪🇸",
    "Cape Verde": "🇨🇻",
    "Saudi Arabia": "🇸🇦",
    "Uruguay": "🇺🇾",

    "France": "🇫🇷",
    "Senegal": "🇸🇳",
    "Iraq": "🇮🇶",
    "Norway": "🇳🇴",

    "Argentina": "🇦🇷",
    "Algeria": "🇩🇿",
    "Austria": "🇦🇹",
    "Jordan": "🇯🇴",

    "Portugal": "🇵🇹",
    "DR Congo": "🇨🇩",
    "Congo DR": "🇨🇩",
    "Uzbekistan": "🇺🇿",
    "Colombia": "🇨🇴",

    "England": ENGLAND_FLAG,
    "Croatia": "🇭🇷",
    "Ghana": "🇬🇭",
    "Panama": "🇵🇦"
  };

  function cleanTeamName(value) {
    return String(value || "")
      .replace(/^[^\wA-ZÀ-ž]+/u, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function walfordFlag(teamName) {
    const clean = cleanTeamName(teamName);

    if (FLAG_MAP[clean]) {
      return FLAG_MAP[clean];
    }

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
