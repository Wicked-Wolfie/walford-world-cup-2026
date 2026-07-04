"use strict";

// Walford V6 Page Order Fix
// Knockout mode: show the most useful public sections first and hide group-stage clutter.

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

  function findTeamsGoneHome() {
    return (
      WC.dom.el("homeKnockoutTracker") ||
      WC.dom.el("teams-gone-home") ||
      WC.dom.el("gone-home") ||
      sectionByHeading(["gone", "home"]) ||
      sectionByHeading(["teams", "home"])
    );
  }

  function findKnockoutResults() {
    return (
      WC.dom.el("knockout") ||
      WC.dom.q(".knockout") ||
      sectionByHeading(["knockout"])
    );
  }

  function findBanterBlock() {
    return (
      WC.dom.el("banter") ||
      sectionByHeading(["banter"])
    );
  }

  function forceHide(section) {
    if (!section) return;
    section.classList.add("hidden");
    section.setAttribute("aria-hidden", "true");
    section.style.setProperty("display", "none", "important");
  }

  function forceShow(section) {
    if (!section) return;
    section.classList.remove("hidden");
    section.removeAttribute("aria-hidden");
    section.style.removeProperty("display");
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

  function isKnockoutMode() {
    const knockout = findKnockoutResults();
    const goneHome = findTeamsGoneHome();

    const knockoutText = String(knockout?.textContent || "").toLowerCase();
    const goneHomeText = String(goneHome?.textContent || "").toLowerCase();

    return (
      knockoutText.includes("round of 32") ||
      knockoutText.includes("round of 16") ||
      knockoutText.includes("quarter") ||
      knockoutText.includes("semi") ||
      knockoutText.includes("final") ||
      goneHomeText.includes("gone home")
    );
  }

  function hideGroupStageSections() {
    if (!isKnockoutMode()) return;

    forceHide(findFixtureFocus());
    forceHide(WC.dom.el("groups"));
    forceHide(WC.dom.el("all-table"));
  }

  function apply() {
    const knockoutMode = isKnockoutMode();

    moveToMainInOrder([
      WC.dom.el("standings"),

      findBanterBlock(),
      WC.dom.el("daily-banter"),
      WC.dom.el("knockout-banter"),

      findTeamsGoneHome(),
      findKnockoutResults(),

      WC.dom.el("golden-boot"),
      WC.dom.el("team-odds-section"),
      WC.dom.el("walford-tv"),

      WC.dom.el("teams"),
      WC.dom.el("squad-hub"),
      WC.dom.el("draw"),

      knockoutMode ? null : findFixtureFocus(),
      knockoutMode ? null : WC.dom.el("groups"),
      knockoutMode ? null : WC.dom.el("all-table"),

      WC.dom.el("match-centre"),
      WC.dom.el("admin-dashboard")
    ]);

    hideGroupStageSections();
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