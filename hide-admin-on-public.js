"use strict";

// Hide admin-only tools from normal public viewing.
// Admin tools should only appear when signed in or when viewing the admin dashboard.

(function () {
  function isAdminHash() {
    return String(window.location.hash || "").toLowerCase().includes("admin");
  }

  function hideAdminPublicSections() {
    const signedIn =
      !!document.querySelector("#logoutBtn:not(.hidden)") ||
      !!document.querySelector(".admin:not(.hidden)") ||
      !!document.body.classList.contains("admin-mode");

    const allowAdmin = signedIn || isAdminHash();

    const adminSelectors = [
      "#match-scorers-admin",
      "#results-editor-admin",
      "#admin-dashboard",
      "#adminPanel",
      "#resultForm",
      "#knockoutResultForm",
      "#fixtureForm",
      "#loginForm",
      "#logoutBtn"
    ];

    adminSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (!allowAdmin) {
          el.classList.add("hidden");
          el.style.display = "none";
        } else {
          el.style.display = "";
        }
      });
    });

    document.querySelectorAll("section").forEach(section => {
      const text = (section.textContent || "").toLowerCase();

      const looksAdmin =
        text.includes("admin shortcut") ||
        text.includes("admin result editor") ||
        text.includes("match result + scorers") ||
        text.includes("save result + scorers") ||
        text.includes("sign in using the main admin button");

      if (looksAdmin && !allowAdmin) {
        section.classList.add("hidden");
        section.style.display = "none";
      }
    });
  }

  function runOften() {
    [500, 1500, 3000, 5000, 8000].forEach(ms => {
      setTimeout(hideAdminPublicSections, ms);
    });
  }

  document.addEventListener("DOMContentLoaded", runOften);
  window.addEventListener("hashchange", runOften);
})();