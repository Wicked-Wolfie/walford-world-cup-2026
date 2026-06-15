// Walford V4.2 Fixture Centre Local Date Fix
// Replaces fixture-centre.js only.
// Fixes UTC date issue so Future Fixtures starts after the real local date.

const WALFORD_FIXTURE_DATES = [
  "2026-06-11","2026-06-12","2026-06-13","2026-06-14","2026-06-15",
  "2026-06-16","2026-06-17","2026-06-18","2026-06-19","2026-06-20",
  "2026-06-21","2026-06-22","2026-06-23","2026-06-24","2026-06-25",
  "2026-06-26","2026-06-27"
];

function walfordIsoToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function walfordDisplayDate(iso) {
  if (!iso || !iso.includes("-")) return iso || "";
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

function walfordShortDate(iso) {
  if (!iso || !iso.includes("-")) return iso || "";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function walfordFutureFixtureDates() {
  const today = walfordIsoToday();
  const future = WALFORD_FIXTURE_DATES.filter(d => d > today);
  return future.length ? future : WALFORD_FIXTURE_DATES.slice(-3);
}

function walfordSetActiveTab(mode) {
  ["fcToday", "fcFuture", "fcResults"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove("active");
  });

  const id = mode === "today" ? "fcToday" : mode === "future" ? "fcFuture" : "fcResults";
  const active = document.getElementById(id);
  if (active) active.classList.add("active");
}

function walfordTitle(text) {
  const title = document.getElementById("fixtureModeTitle");
  if (title) title.textContent = text;
}

function walfordHideNativeDate() {
  const input = document.getElementById("todayDate");
  const btn = document.getElementById("showTodayBtn");
  if (input) input.style.display = "none";
  if (btn) btn.style.display = "none";
}

function walfordEnsureDateChooser() {
  let chooser = document.getElementById("fixtureDateChooser");
  const controls = document.querySelector(".today-controls");

  if (!chooser && controls) {
    chooser = document.createElement("div");
    chooser.id = "fixtureDateChooser";
    chooser.className = "fixture-date-chooser";
    controls.parentNode.insertBefore(chooser, controls.nextSibling);
  }

  return chooser;
}

function walfordRenderViaApp(dateIso) {
  const input = document.getElementById("todayDate");
  if (input) input.value = dateIso;
  if (typeof renderToday === "function") renderToday();
}

function walfordSetTodayMode() {
  walfordSetActiveTab("today");
  walfordHideNativeDate();

  const chooser = walfordEnsureDateChooser();
  if (chooser) chooser.innerHTML = "";

  const today = walfordIsoToday();
  walfordTitle(`Today’s Fixtures — ${walfordDisplayDate(today)}`);
  walfordRenderViaApp(today);
}

function walfordSetFutureMode(selectedDate) {
  walfordSetActiveTab("future");
  walfordHideNativeDate();

  const futureDates = walfordFutureFixtureDates();
  const chosen = selectedDate || futureDates[0];

  walfordTitle("Future Fixtures");
  walfordRenderViaApp(chosen);

  const chooser = walfordEnsureDateChooser();
  if (!chooser) return;

  chooser.innerHTML = futureDates.map(date => {
    const active = date === chosen ? "active" : "";
    return `<button type="button" class="fixture-date-pill ${active}" data-date="${date}">${walfordShortDate(date)}</button>`;
  }).join("");

  chooser.querySelectorAll(".fixture-date-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      walfordSetFutureMode(btn.dataset.date);
    });
  });
}

function walfordSetResultsMode() {
  walfordSetActiveTab("results");
  walfordHideNativeDate();

  const chooser = walfordEnsureDateChooser();
  if (chooser) chooser.innerHTML = "";

  walfordTitle("Latest Results");

  const todayGrid = document.getElementById("todayMatches");
  const resultsList = document.getElementById("resultsList");

  if (todayGrid && resultsList) {
    todayGrid.innerHTML = resultsList.innerHTML || "<p>No results loaded yet.</p>";
  }
}

function walfordRenameResultsTab() {
  const resultsBtn = document.getElementById("fcResults");
  if (resultsBtn) resultsBtn.textContent = "Latest Results";
}

document.addEventListener("DOMContentLoaded", () => {
  const todayBtn = document.getElementById("fcToday");
  const futureBtn = document.getElementById("fcFuture");
  const resultsBtn = document.getElementById("fcResults");

  walfordRenameResultsTab();

  if (todayBtn) todayBtn.addEventListener("click", walfordSetTodayMode);
  if (futureBtn) futureBtn.addEventListener("click", () => walfordSetFutureMode());
  if (resultsBtn) resultsBtn.addEventListener("click", walfordSetResultsMode);

  setTimeout(() => {
    walfordHideNativeDate();
    walfordSetTodayMode();
  }, 1200);
});
