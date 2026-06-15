// Walford V3.9 Fixture Centre Clean UI
// Replaces fixture-centre.js only.
// Keeps app.js, Supabase, Admin and existing results untouched.

const WALFORD_FIXTURE_DATES = [
  "2026-06-11","2026-06-12","2026-06-13","2026-06-14","2026-06-15",
  "2026-06-16","2026-06-17","2026-06-18","2026-06-19","2026-06-20",
  "2026-06-21","2026-06-22","2026-06-23","2026-06-24","2026-06-25",
  "2026-06-26","2026-06-27"
];

function walfordIsoToday() {
  return new Date().toISOString().slice(0, 10);
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

function walfordNearestFixtureDate(fromIso) {
  return WALFORD_FIXTURE_DATES.find(d => d >= fromIso) || WALFORD_FIXTURE_DATES[WALFORD_FIXTURE_DATES.length - 1];
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

  const today = walfordIsoToday();
  const chosen = selectedDate || walfordNearestFixtureDate(today);

  walfordTitle(`Future Fixtures — ${walfordDisplayDate(chosen)}`);
  walfordRenderViaApp(chosen);

  const chooser = walfordEnsureDateChooser();
  if (!chooser) return;

  chooser.innerHTML = WALFORD_FIXTURE_DATES.map(date => {
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

document.addEventListener("DOMContentLoaded", () => {
  const todayBtn = document.getElementById("fcToday");
  const futureBtn = document.getElementById("fcFuture");
  const resultsBtn = document.getElementById("fcResults");

  if (todayBtn) todayBtn.addEventListener("click", walfordSetTodayMode);
  if (futureBtn) futureBtn.addEventListener("click", () => walfordSetFutureMode());
  if (resultsBtn) resultsBtn.addEventListener("click", walfordSetResultsMode);

  // Hide the original controls immediately.
  setTimeout(() => {
    walfordHideNativeDate();
    walfordSetTodayMode();
  }, 1200);
});
