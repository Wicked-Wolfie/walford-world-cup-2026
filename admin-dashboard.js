// Walford Admin Dashboard
// Puts the main admin tools together in one easy panel.

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

  async function adLoad() {
    const db = adClient();
    if (!db) return;

    const session = await db.auth.getSession();
    adSession = session?.data?.session || null;
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

    if (!adSession) {
      section.innerHTML = "";
      section.classList.add("hidden");
      return;
    }

    section.classList.remove("hidden");

    section.innerHTML = `
      <div class="section-title">
        <span>Admin HQ</span>
        <h2>Admin Dashboard</h2>
        <p>Use these shortcuts instead of hunting around the page.</p>
      </div>

      <div class="panel">
        <div class="hero-buttons">
          <a class="button gold" href="#match-scorers-admin">Add Result + Scorers</a>
          <a class="button dark" href="#results-editor-admin">Edit Existing Result</a>
          <a class="button dark" href="#golden-boot">Golden Boot Admin</a>
          <a class="button dark" href="#match-centre">Old Match Centre Admin</a>
        </div>

        <p class="status">
          Recommended daily use: Add Result + Scorers, then Edit Existing Result only if a date or score needs correcting.
        </p>
      </div>
    `;
  }

  async function adStart() {
    await adLoad();
    adRender();

    const db = adClient();
    if (db && db.auth) {
      db.auth.onAuthStateChange(async () => {
        await adLoad();
        adRender();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(adStart, 3600);
  });
})();
