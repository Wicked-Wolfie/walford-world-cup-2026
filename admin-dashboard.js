// Walford Admin Dashboard
// Creates a separate admin mode so admin tools are not on the public front page.

(function () {
  const adminHashes = [
    "#admin-dashboard",
    "#match-scorers-admin",
    "#results-editor-admin",
    "#golden-boot-admin"
  ];

  const adminSectionIds = [
    "admin-dashboard",
    "match-scorers-admin",
    "results-editor-admin"
  ];

  function adIsAdminOpen() {
    return adminHashes.includes(location.hash);
  }

  function adInsert() {
    let section = document.getElementById("admin-dashboard");

    if (!section) {
      section = document.createElement("section");
      section.id = "admin-dashboard";
      section.className = "section admin-dashboard hidden";

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
          <a class="button gold" href="#match-centre">Sign in / Old Admin</a>
          <a class="button gold" href="#match-scorers-admin">Add Result + Scorers</a>
          <a class="button dark" href="#results-editor-admin">Edit Existing Result</a>
          <a class="button dark" href="#golden-boot">Golden Boot Page</a>
          <a class="button dark" href="#home">Back to Public Site</a>
        </div>

        <p class="status">
          Use Add Result + Scorers for normal match entry. Use Edit Existing Result only to correct a date or score.
        </p>
      </div>
    `;
  }

  function adSetPublicVisibility() {
    const main = document.querySelector("main");
    if (!main) return;

    const adminOpen = adIsAdminOpen();

    Array.from(main.children).forEach(child => {
      if (!child.id) return;

      const isAdminSection = adminSectionIds.includes(child.id);

      if (adminOpen) {
        if (isAdminSection) {
          child.classList.remove("hidden");
        } else {
          child.classList.add("hidden");
        }
      } else {
        if (isAdminSection) {
          child.classList.add("hidden");
        } else {
          child.classList.remove("hidden");
        }
      }
    });
  }

  function adApply() {
    adRender();
    adSetPublicVisibility();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(adApply, 4200);
  });

  window.addEventListener("hashchange", () => {
    setTimeout(adApply, 100);
    setTimeout(adApply, 800);
  });
})();
