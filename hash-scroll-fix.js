"use strict";

// Walford V6 Hash Scroll Fix

(function () {
  function scrollToHash() {
    if (!location.hash) return;

    let id = location.hash.replace("#", "");
    if (!id) return;

    if (id === "golden-boot-admin") {
      id = "golden-boot";
    }

    const target = WC.dom.el(id);
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function delayedScrolls(times) {
    times.forEach(ms => setTimeout(scrollToHash, ms));
  }

  WC.events.once(document, "DOMContentLoaded", () => {
    delayedScrolls([500, 1500, 3000, 5000]);
  });

  WC.events.on(window, "hashchange", () => {
    delayedScrolls([100, 800, 1800]);
  });
})();
