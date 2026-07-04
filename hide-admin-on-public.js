"use strict";

// Walford V6 - Hide admin tools on public page

(function () {
  function adminAllowed() {
    return String(window.location.hash || "").toLowerCase().includes("admin");
  }

  function forceHide(el) {
    if (!el) return;
    el.classList.add("hidden");
    el.setAttribute("aria-hidden", "true");
    el.style.setProperty("display", "none", "important");
  }

  function forceShow(el) {
    if (!el) return;
    el.classList.remove("hidden");
    el.removeAttribute("aria-hidden");
    el.style.removeProperty("display");
  }

  function hideAdminTools() {
    const allowAdmin = adminAllowed();

    const adminSelectors = [
      "#match-scorers-admin",
      "#results-editor-admin",
      "#admin-dashboard",
      "#adminPanel",
      "#resultForm",
      "#knockoutResultForm",
      "#fixtureForm",
      "#loginForm",
      "#logoutBtn",
      ".admin-dashboard",
      ".admin-panel",
      ".admin",
      ".match-scorers-admin",
      ".results-editor-admin"
    ];

    adminSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        if (allowAdmin) {
          forceShow(el);
        } else {
          forceHide(el);
        }
      });
    });

    document.querySelectorAll("section, div.panel, form").forEach(el => {
      const text = String(el.textContent || "").toLowerCase();

      const looksAdmin =
         text.includes("admin shortcut") ||
         text.includes("match result + scorers") ||
         text.includes("save result + scorers") ||
         text.includes("admin result editor") ||
         text.includes("admin: add / fix goal scorers") ||
          text.includes("add / fix goal scorers") ||
          text.includes("admin hq") ||
        text.includes("knockout match admin") ||
        text.includes("save knockout") ||
        text.includes("save result") ||
        text.includes("save fixture") ||
        text.includes("sign in using the main admin button");

      if (looksAdmin) {
        if (allowAdmin) {
          forceShow(el);
        } else {
          forceHide(el);
        }
      }
    });
   document.querySelectorAll("main *").forEach(el => {
      const text = String(el.textContent || "").toLowerCase();

      const isGoldenBootAdmin =
        text.includes("admin: add / fix goal scorers") ||
        text.includes("add / fix goal scorers");

      const isKnockoutAdmin =
        text.includes("knockout match admin") ||
        text.includes("admin hq");

      if ((isGoldenBootAdmin || isKnockoutAdmin) && !allowAdmin) {
        const block =
          el.closest(".panel") ||
          el.closest("form") ||
          el.closest("article") ||
          el.closest("div");

        forceHide(block || el);
      }
    });
  }

  function runRepeatedly() {
    hideAdminTools();

    [250, 750, 1500, 3000, 5000, 8000, 12000].forEach(ms => {
      setTimeout(hideAdminTools, ms);
    });
  }

  document.addEventListener("DOMContentLoaded", runRepeatedly);
  window.addEventListener("load", runRepeatedly);
  window.addEventListener("hashchange", runRepeatedly);

  setInterval(hideAdminTools, 3000);
})();