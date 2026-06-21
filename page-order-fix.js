// Walford V5.8.3 Page Order Fix
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
    const goldenBoot = document.getElementById("golden-boot");
    const knockoutTracker = document.getElementById("homeKnockoutTracker");
    const knockoutBracket = document.getElementById("knockout");
    const dailyBanter = document.getElementById("daily-banter");
    const adminDashboard = document.getElementById("admin-dashboard");

    const fixtureFocus =
      document.getElementById("fixtures") ||
      document.getElementById("fixture-centre") ||
      document.getElementById("fixtureCentre") ||
      document.querySelector(".fixture-centre") ||
      document.querySelector(".fixtures") ||
      pofSectionByHeading(["fixture", "focus"]);

    if (fixtureFocus && goldenBoot) {
      pofMoveBefore(fixtureFocus, goldenBoot);
    }

    if (dailyBanter && fixtureFocus) {
      pofMoveAfter(dailyBanter, fixtureFocus);
    }

    if (goldenBoot && dailyBanter) {
      pofMoveAfter(goldenBoot, dailyBanter);
    }

    if (knockoutTracker && goldenBoot) {
      pofMoveAfter(knockoutTracker, goldenBoot);
    }

    if (knockoutBracket && knockoutTracker) {
      pofMoveAfter(knockoutBracket, knockoutTracker);
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
