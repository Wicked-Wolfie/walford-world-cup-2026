"use strict";

// Walford V6 Page Order Fix

(function () {
  function sectionByHeading(words) {
    const sections = WC.dom.qa("section");

    return sections.find(section => {
      const text = (section.textContent || "").toLowerCase();
      return words.every(word => text.includes(word.toLowerCase()));
    });
  }

  function findFixtureFocus() {
    return (
      WC.dom.el("today") ||
      WC.dom.el("fixtures") ||
      WC.dom.el("fixture-centre") ||
      WC.dom.el("fixtureCentre") ||
      WC.dom.q(".fixture-centre") ||
      WC.dom.q(".fixtures") ||
      sectionByHeading(["fixture", "focus"])
    );
  }

  function moveToMainInOrder(sections) {
    const main = WC.dom.q(WC.config.selectors.main);
    if (!main) return;

    sections.forEach(section => {
      if (section && section.parentNode) {
        main.appendChild(section);
      }
    });
  }

  function apply() {
    moveToMainInOrder([
      findFixtureFocus(),
      WC.dom.el("daily-banter"),
      WC.dom.el("standings"),
      WC.dom.el("golden-boot"),
      WC.dom.el("walford-tv"),
      WC.dom.el("homeKnockoutTracker"),
      WC.dom.el("knockout"),
      WC.dom.el("groups"),
      WC.dom.el("all-table"),
      WC.dom.el("squad-hub"),
      WC.dom.el("teams"),
      WC.dom.el("draw"),
      WC.dom.el("match-centre"),
      WC.dom.el("banter"),
      WC.dom.el("admin-dashboard")
    ]);
  }

  function delayedApply(times) {
    times.forEach(ms => setTimeout(apply, ms));
  }

  WC.events.once(document, "DOMContentLoaded", () => {
    delayedApply([1500, 3000, 5000, 8000]);
  });

  WC.events.on(window, "hashchange", () => {
    delayedApply([500, 1500]);
  });
})();
