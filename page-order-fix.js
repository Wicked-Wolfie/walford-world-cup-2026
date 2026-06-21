// Walford V5.8.5 Page Order Fix
// Forces public homepage sections into the preferred group-stage order.

(function () {
  function pofSectionByHeading(words) {
    const sections = Array.from(document.querySelectorAll("section"));

    return sections.find(section => {
      const text = (section.textContent || "").toLowerCase();
      return words.every(word => text.includes(word.toLowerCase()));
    });
  }

  function pofFindFixtureFocus() {
    return (
      document.getElementById("today") ||
      document.getElementById("fixtures") ||
      document.getElementById("fixture-centre") ||
      document.getElementById("fixtureCentre") ||
      document.querySelector(".fixture-centre") ||
      document.querySelector(".fixtures") ||
      pofSectionByHeading(["fixture", "focus"])
    );
  }

  function pofMoveToMainInOrder(sections) {
    const main = document.querySelector("main");
    if (!main) return;

    sections.forEach(section => {
      if (section && section.parentNode) {
        main.appendChild(section);
      }
    });
  }

  function pofApply() {
    const fixtureFocus = pofFindFixtureFocus();
    const dailyBanter = document.getElementById("daily-banter");
    const syndicateStandings = document.getElementById("standings");
    const goldenBoot = document.getElementById("golden-boot");
    const officialVideo = document.getElementById("walford-tv");
    const knockoutTracker = document.getElementById("homeKnockoutTracker");
    const knockoutBracket = document.getElementById("knockout");

    const groups = document.getElementById("groups");
    const allTable = document.getElementById("all-table");
    const squadHub = document.getElementById("squad-hub");
    const teamTracker = document.getElementById("teams");
    const sweepstakeDraw = document.getElementById("draw");
    const matchCentre = document.getElementById("match-centre");
    const banterCentre = document.getElementById("banter");
    const adminDashboard = document.getElementById("admin-dashboard");

    pofMoveToMainInOrder([
      fixtureFocus,
      dailyBanter,
      syndicateStandings,
      goldenBoot,
      officialVideo,
      knockoutTracker,
      knockoutBracket,
      groups,
      allTable,
      squadHub,
      teamTracker,
      sweepstakeDraw,
      matchCentre,
      banterCentre,
      adminDashboard
    ]);
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(pofApply, 1500);
    setTimeout(pofApply, 3000);
    setTimeout(pofApply, 5000);
    setTimeout(pofApply, 8000);
  });

  window.addEventListener("hashchange", () => {
    setTimeout(pofApply, 500);
    setTimeout(pofApply, 1500);
  });
})();
