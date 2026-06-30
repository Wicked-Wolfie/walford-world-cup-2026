"use strict";

// Walford V6 Hide Admin On Public

(function () {
  function isAdminMode() {
    return [
      "#admin-dashboard",
      "#match-scorers-admin",
      "#results-editor-admin",
      "#golden-boot-admin"
    ].includes(location.hash);
  }

  function setDisplay(element, show) {
    if (!element) return;
    element.style.display = show ? "" : "none";
  }

  function apply() {
    const adminMode = isAdminMode();

    setDisplay(WC.dom.el("match-scorers-admin"), adminMode);
    setDisplay(WC.dom.el("results-editor-admin"), adminMode);
    setDisplay(WC.dom.el("adminPanel"), adminMode);

    WC.dom.qa(".gb-admin").forEach(panel => {
      setDisplay(panel, adminMode);
    });
  }

  function delayedApply(times) {
    times.forEach(ms => setTimeout(apply, ms));
  }

  WC.events.once(document, "DOMContentLoaded", () => {
    apply();
    delayedApply([500, 1500, 3500, 7000]);
    setInterval(apply, 1000);
  });

  WC.events.on(window, "hashchange", () => {
    delayedApply([100, 800]);
  });
})();
