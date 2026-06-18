// Walford Hash Scroll Fix
// Helps links jump to sections that are created after page load.

(function () {
  function hsfScrollToHash() {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");

    if (id === "golden-boot-admin") {
      const goldenBoot = document.getElementById("golden-boot");

      if (goldenBoot) {
        goldenBoot.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }

      return;
    }

    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(hsfScrollToHash, 500);
    setTimeout(hsfScrollToHash, 1500);
    setTimeout(hsfScrollToHash, 3000);
    setTimeout(hsfScrollToHash, 5000);
  });

  window.addEventListener("hashchange", () => {
    setTimeout(hsfScrollToHash, 100);
    setTimeout(hsfScrollToHash, 800);
    setTimeout(hsfScrollToHash, 1800);
  });
})();
