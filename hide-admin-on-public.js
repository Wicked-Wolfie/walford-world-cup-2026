// Walford Hide Admin On Public
// Keeps admin-only panels hidden on the public site.

(function () {
  function haIsAdminMode() {
  return location.hash === "#admin-dashboard" ||
    location.hash === "#match-scorers-admin" ||
    location.hash === "#results-editor-admin" ||
    location.hash === "#golden-boot";
}

  function haApply() {
    const adminMode = haIsAdminMode();

    const matchScorers = document.getElementById("match-scorers-admin");
    const resultEditor = document.getElementById("results-editor-admin");
    const oldAdminPanel = document.getElementById("adminPanel");
    const goldenBootAdmins = document.querySelectorAll(".gb-admin");

    if (matchScorers) {
      matchScorers.style.display = adminMode ? "" : "none";
    }

    if (resultEditor) {
      resultEditor.style.display = adminMode ? "" : "none";
    }

    if (oldAdminPanel) {
      oldAdminPanel.style.display = adminMode ? "" : "none";
    }

    goldenBootAdmins.forEach(panel => {
      panel.style.display = adminMode ? "" : "none";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    haApply();
    setTimeout(haApply, 500);
    setTimeout(haApply, 1500);
    setTimeout(haApply, 3500);
    setTimeout(haApply, 7000);
    setInterval(haApply, 1000);
  });

  window.addEventListener("hashchange", () => {
    setTimeout(haApply, 100);
    setTimeout(haApply, 800);
  });
})();
