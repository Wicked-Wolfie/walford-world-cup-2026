// Walford Admin Dashboard
// Public mode and admin mode switcher.

(function () {
  let adDb = null;
  let adSession = null;

  function adClient() {
    if (adDb) return adDb;

    const url =
      window.SUPABASE_URL ||
      (typeof SUPABASE_URL !== "undefined" ? SUPABASE_URL : "");

    const key =
      window.SUPABASE_ANON_KEY ||
      (typeof SUPABASE_ANON_KEY !== "undefined" ? SUPABASE_ANON_KEY : "");

    if (!window.supabase || !url || !key) return null;

    adDb = window.supabase.createClient(url, key);
    return adDb;
  }

  async function adLoadSession() {
    const db = adClient();

    if (!db) {
      adSession = null;
      return null;
    }

    const result = await db.auth.getSession();
    adSession = result?.data?.session || null;
    return adSession;
  }

function adIsAdminMode() {
  return location.hash === "#admin-dashboard" ||
    location.hash === "#match-scorers-admin" ||
    location.hash === "#results-editor-admin" ||
    location.hash === "#golden-boot-admin" ||
    location.hash === "#knockout-admin";
}

  function adCurrentTargetId() {
    if (location.hash === "#match-scorers-admin") return "match-scorers-admin";
    if (location.hash === "#results-editor-admin") return "results-editor-admin";
    return "";
  }

 function adInstallCss() {
  if (document.getElementById("walfordAdminModeCss")) return;

  const style = document.createElement("style");
  style.id = "walfordAdminModeCss";
  style.textContent = `
    body.walford-admin-mode > section {
      display: none !important;
    }

    body.walford-admin-mode main > * {
      display: none !important;
    }

    body.walford-admin-mode #admin-dashboard,
    body.walford-admin-mode #match-scorers-admin,
    body.walford-admin-mode #results-editor-admin {
      display: block !important;
    }

    body.walford-admin-mode #match-scorers-admin.walford-admin-closed,
    body.walford-admin-mode #results-editor-admin.walford-admin-closed {
      display: none !important;
    }

    body.walford-admin-mode #admin-dashboard,
body.walford-admin-mode #match-scorers-admin,
body.walford-admin-mode #results-editor-admin,
body.walford-admin-mode #golden-boot {
  display: block !important;
}
  `;

  document.head.appendChild(style);
}

  function adInsert() {
    let section = document.getElementById("admin-dashboard");

    if (!section) {
      section = document.createElement("section");
      section.id = "admin-dashboard";
      section.className = "section admin-dashboard";

      const main = document.querySelector("main");

            if (main) {
        main.appendChild(section);
      }
    }

    return section;
  }

  function adRenderLoggedOut() {
    const section = adInsert();
    section.innerHTML = "";
    document.body.classList.remove("walford-admin-mode");
  }

  function adRenderLoggedIn() {
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
      <a class="button dark" href="#golden-boot-admin">Golden Boot Admin</a>
      <button class="button dark" type="button" onclick="window.walfordOpenKnockoutAdmin()">Knockout Result Entry</button>
      <a class="button dark" href="#home">Public Site / Check Changes</a>
      <button id="adSignOut" class="button dark" type="button">Sign out</button>
    </div>

        <p class="status">
          Signed in as ${adSession?.user?.email || "admin"}.
        </p>
      </div>
    `;

    adWireDashboardButtons();
  }

  function adApplyVisibility() {
    adInstallCss();

    const adminMode = adIsAdminMode();
    const targetId = adCurrentTargetId();

    document.body.classList.toggle("walford-admin-mode", adminMode && !!adSession);

    const matchScorers = document.getElementById("match-scorers-admin");
    const resultEditor = document.getElementById("results-editor-admin");

    if (matchScorers) {
      matchScorers.classList.toggle("walford-admin-closed", targetId !== "match-scorers-admin");
    }

    if (resultEditor) {
      resultEditor.classList.toggle("walford-admin-closed", targetId !== "results-editor-admin");
    }
  }

  async function adApply() {
    await adLoadSession();

    if (adSession) {
      adRenderLoggedIn();
      adApplyVisibility();
    } else {
      adRenderLoggedOut();
    }
  }

  function adOpenSection(sectionId) {
  if (sectionId === "knockout-admin") {
    location.hash = "#knockout-admin";

    setTimeout(() => {
      adApply();

      const knockout = document.getElementById("knockout");
      if (knockout) {
        knockout.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);

    setTimeout(() => {
      adApply();

      const knockout = document.getElementById("knockout");
      if (knockout) {
        knockout.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 1200);

    return;
  }

  location.hash = "#" + sectionId;

  setTimeout(() => {
    adApply();

    const target = document.getElementById(sectionId);
    if (target) {
      target.classList.remove("walford-admin-closed");
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 150);

  setTimeout(() => {
    adApply();

    const target = document.getElementById(sectionId);
    if (target) {
      target.classList.remove("walford-admin-closed");
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

    const signOutButton = document.getElementById("adSignOut");

    if (signOutButton) {
      signOutButton.addEventListener("click", async () => {
        const db = adClient();

        if (db) {
          await db.auth.signOut();
        }

        adSession = null;
        document.body.classList.remove("walford-admin-mode");
        location.hash = "#home";
        setTimeout(adApply, 300);
      });
    }
  }

  function adWirePublicReturn() {
    window.addEventListener("hashchange", () => {
      if (location.hash === "#home" || location.hash === "") {
        document.body.classList.remove("walford-admin-mode");
      }

      setTimeout(adApply, 100);
      setTimeout(adApply, 900);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    adInstallCss();

    setTimeout(adApply, 1200);
    setTimeout(adApply, 4200);
    setTimeout(adApply, 7000);

    adWirePublicReturn();
  });
})();
