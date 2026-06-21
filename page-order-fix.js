// Walford V5.8.4 Page Order Fix
// Forces public homepage sections into the preferred group-stage order.

(function () {
  function pofSectionByHeading(words) {
    const sections = Array.from(document.querySelectorAll("section"));

    return sections.find(section => {
      const text = (section.textContent || "").toLowerCase();
      return words.every(word => text.includes(word.toLowerCase()));
    });
  }

  function pofMoveAfter(section, afterSection) {
    if (!section || !afterSection || !afterSection.parentNode) return;
    if (section === afterSection) return;

    afterSection.parentNode.insertBefore(section, afterSection.nextSibling);
  }

  function pofMoveBefore(section, beforeSection) {
    if (!section || !beforeSection || !beforeSection.parentNode) return;
    if (section === beforeSection) return;

    beforeSection.parentNode.insertBefore(section, beforeSection);
  }

  function pofMoveToBottom(section) {
    const main = document.querySelector("main");
    if (!main || !section) return;

    main.appendChild(section);
  }

  function pofApply() {
    const fixtureFocus =
      document.getElementById("today") ||
      document.getElementById("fixtures") ||
      document.getElementById("fixture-centre") ||
      document.getElementById("fixtureCentre") ||
      document.querySelector(".fixture-centre") ||
      document.querySelector(".fixtures") ||
      pofSectionByHeading(["fixture", "focus"]);

    const dailyBanter = document.getElementById("daily-banter");
    const syndicateStandings = document.getElementById("standings");
    const goldenBoot = document.getElementById("golden-boot");
    const officialVideo = document.getElementById("walford-tv");
    const knockoutTracker = document.getElementById("homeKnockoutTracker");
    const knockoutBracket = document.getElementById("knockout");
    const adminDashboard = document.getElementById("admin-dashboard");

    if (fixtureFocus && dailyBanter) {
      pofMoveAfter(dailyBanter, fixtureFocus);
    }

    if (syndicateStandings && dailyBanter) {
      pofMoveAfter(syndicateStandings, dailyBanter);
    }

    if (goldenBoot && syndicateStandings) {
      pofMoveAfter(goldenBoot, syndicateStandings);
    } else if (goldenBoot && dailyBanter) {
      pofMoveAfter(goldenBoot, dailyBanter);
    }

    if (officialVideo && goldenBoot) {
      pofMoveAfter(officialVideo, goldenBoot);
    }

    if (knockoutTracker && officialVideo) {
      pofMoveAfter(knockoutTracker, officialVideo);
    } else if (knockoutTracker && goldenBoot) {
      pofMoveAfter(knockoutTracker, goldenBoot);
    }

    if (knockoutBracket && knockoutTracker) {
      pofMoveAfter(knockoutBracket, knockoutTracker);
    }

    if (fixtureFocus) {
      const main = document.querySelector("main");
      const firstSection = main ? main.querySelector("section") : null;

      if (firstSection && firstSection !== fixtureFocus) {
        pofMoveBefore(fixtureFocus, firstSection);
      }
    }

    if (adminDashboard) {
      pofMoveToBottom(adminDashboard);
    }
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
