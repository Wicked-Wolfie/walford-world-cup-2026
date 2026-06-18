// Walford Admin Dashboard
// Separate admin mode from the public front page.

(function () {
  const adminHashes = [
    "#admin-dashboard",
    "#match-scorers-admin",
    "#results-editor-admin"
  ];

  const adminSectionIds = [
    "admin-dashboard",
    "match-scorers-admin",
    "results-editor-admin"
  ];

  function adIsAdminOpen() {
    return adminHashes.includes(location.hash);
  }

  function adCurrentTargetId() {
    if (location.hash === "#match-scorers-admin") return "match-scorers-admin";
    if (location.hash === "#results-editor-admin") return "results-editor-admin";
    return "";
  }

  function adInsert() {
    let section = document.getElementById("admin-dashboard");

    if (!section) {
      section = document.createElement("section");
      section.id = "admin-dashboard";
      section.className = "section admin-dashboard";

      const main = document.querySelector("main");
      if (main && main.firstChild) {
        main.insertBefore(section, main.firstChild);
      } else if (main) {
        main.appendChild(section);
      }
    }

    return section;
  }

  function adRender() {
    const section = adInsert();

    section.innerHTML = `
      <div class="section-title">
        <span>Admin HQ</span>
        <h2>Admin Dashboard</h2>
        <p>Admin tools are kept separate from the public front page.</p>
      </div>

      <div class="panel">
        <div class="hero-buttons">
          <button class="button gold" type="button" data-admin-open="match-scorers-admin">Add Result + Scorers</button>
          <button class="button dark" type="button" data-admin-open="results-editor-admin">Edit Existing Result</button>
          <a class="button dark" href="#home">Back to Public Site</a>
        </div>

        <p class="status">
          Use Add Result + Scorers for normal match entry. Use Edit Existing Result only to correct a date or score.
        </p>
      </div>
    `;

    adWireDashboardButtons();
  }

  function adApplyVisibility() {
    const main = document.querySelector("main");
    if (!main) return;

    const adminOpen = adIsAdminOpen();
    const targetId = adCurrentTargetId();

    Array.from(main.children).forEach(child => {
      const isDashboard = child.id === "admin-dashboard";
      const isTargetAdminSection = targetId && child.id === targetId;
      const isAnyAdminSection = adminSectionIds.includes(child.id);

      if (adminOpen) {
        if (isDashboard || isTargetAdminSection) {
          child.style.display = "";
        } else {
          child.style.display = "none";
        }
      } else {
        if (isAnyAdminSection) {
          child.style.display = "none";
        } else {
          child.style.display = "";
        }
      }
    });
  }

  function adOpenSection(sectionId) {
    location.hash = "#" + sectionId;

    setTimeout(() => {
      adApply();

      const target = document.getElementById(sectionId);
      if (target) {
        target.style.display = "";
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);

    setTimeout(() => {
      adApply();

      const target = document.getElementById(sectionId);
      if (target) {
        target.style.display = "";
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 900);
  }

  function adWireDashboardButtons() {
    document.querySelectorAll("[data-admin-open]").forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        const sectionId = button.getAttribute("data-admin-open");
        if (sectionId) adOpenSection(sectionId);
      });
    });
  }

  function adApply() {
    adRender();
    adApplyVisibility();
  }

  function adWireAdminButton() {
    const button = document.getElementById("adminToggle");
    if (!button) return;

    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      location.hash = "#admin-dashboard";
      setTimeout(adApply, 100);
      setTimeout(adApply, 800);
    }, true);
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      adWireAdminButton();
      adApply();
    }, 1200);

    setTimeout(() => {
      adWireAdminButton();
      adApply();
    }, 4200);

    setTimeout(() => {
      adWireAdminButton();
      adApply();
    }, 7000);
  });

  window.addEventListener("hashchange", () => {
    setTimeout(adApply, 100);
    setTimeout(adApply, 800);
  });
})();
