// Walford Admin Dashboard
// Keeps admin tools off the public front page unless Admin is opened.

(function () {
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

  function adIsAdminOpen() {
    return [
      "#admin-dashboard",
      "#match-scorers-admin",
      "#results-editor-admin",
      "#golden-boot"
    ].includes(location.hash);
  }

  function adApplyVisibility() {
    const open = adIsAdminOpen();

    const dashboard = document.getElementById("admin-dashboard");
    const matchScorers = document.getElementById("match-scorers-admin");
    const resultEditor = document.getElementById("results-editor-admin");

    if (dashboard) dashboard.classList.toggle("hidden", !open);
    if (matchScorers) matchScorers.classList.toggle("hidden", !open);
    if (resultEditor) resultEditor.classList.toggle("hidden", !open);
  }

  function adRender() {
    const section = adInsert();

    section.innerHTML = `
      <div class="section-title">
        <span>Admin HQ</span>
        <h2>Admin Dashboard</h2>
        <p>Quick shortcuts for running the tournament site.</p>
      </div>

      <div class="panel">
        <div class="hero-buttons">
          <a class="button gold" href="#match-centre">Sign in / Old Admin</a>
          <a class="button gold" href="#match-scorers-admin">Add Result + Scorers</a>
          <a class="button dark" href="#results-editor-admin">Edit Existing Result</a>
          <a class="button dark" href="#golden-boot">Golden Boot Admin</a>
        </div>

        <p class="status">
          Daily use: sign in first, then use Add Result + Scorers. Use Edit Existing Result if a date or score needs correcting.
        </p>
      </div>
    `;

    adApplyVisibility();
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      adRender();
      adApplyVisibility();
    }, 4200);
  });

  window.addEventListener("hashchange", () => {
    setTimeout(adApplyVisibility, 100);
  });
})();
