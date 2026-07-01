"use strict";

window.WC = window.WC || {};

window.WC.helpers = {
  ownerName(name) {
    if (name === "Debbie") return "Dubs";
    if (name === "Charlotte") return "Lottie";
    return name || "";
  },

  number(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  },

  dateKey(value) {
    return String(value || "").slice(0, 10);
  },
  
  todayISO() {
  return new Date().toISOString().slice(0, 10);
  },

  suffix(n) {
  return n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
},
  
  sortByDateTime(a, b) {
    const ax = `${a.date || ""} ${a.time || ""}`;
    const bx = `${b.date || ""} ${b.time || ""}`;
    return ax.localeCompare(bx);
  },

  groupBy(list, key) {
    return (list || []).reduce((acc, item) => {
      const value = item[key] || "Other";
      acc[value] = acc[value] || [];
      acc[value].push(item);
      return acc;
    }, {});
  }
};
