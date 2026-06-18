// Walford Admin Dashboard
// Shows admin shortcuts near the top of the page.

(function () {
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
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(adRender, 1200);
  });
})();
