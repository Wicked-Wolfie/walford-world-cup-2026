// Walford V3.8 Fixture Centre Date Fix
// Replaces V3.7 fixture-centre.js
// Keeps app.js untouched.

function walfordIsoToday() {
  return new Date().toISOString().slice(0, 10);
}

function walfordDisplayDate(iso) {
  if (!iso || !iso.includes("-")) return iso || "";
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

function walfordFixtureDates() {
  if (!Array.isArray(window.fixtures) && typeof fixtures === "undefined") return [];
  const source = typeof fixtures !== "undefined" ? fixtures : window.fixtures;
  return [...new Set((source || []).map(f => f.date).filter(Boolean))].sort();
}

function walfordNearestFixtureDate(fromIso) {
  const dates = walfordFixtureDates();
  if (!dates.length) return fromIso;
  return dates.find(d => d >= fromIso) || dates[dates.length - 1];
}

function walfordSetTab(mode) {
  ["fcToday", "fcFuture", "fcResults"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove("active");
  });

  const active = mode === "today" ? "fcToday" : mode === "future" ? "fcFuture" : "fcResults";
  const btn = document.getElementById(active);
  if (btn) btn.classList.add("active");
}

function walfordUpdateTitle(text) {
  const title = document.getElementById("fixtureModeTitle");
  if (title) title.textContent = text;
}

function walfordShowDateControls(show) {
  const dateInput = document.getElementById("todayDate");
  const showBtn = document.getElementById("showTodayBtn");
  if (dateInput) dateInput.style.display = show ? "" : "none";
  if (showBtn) showBtn.style.display = show ? "" : "none";
}

function walfordRenderSelectedFixtures() {
  if (typeof renderToday === "function") renderToday();
}

function walfordSetTodayMode() {
  walfordSetTab("today");
  walfordShowDateControls(false);

  const input = document.getElementById("todayDate");
  const realToday = walfordIsoToday();

  if (input) input.value = realToday;
  walfordUpdateTitle(`Today’s Fixtures — ${walfordDisplayDate(realToday)}`);
  walfordRenderSelectedFixtures();
}

function walfordSetFutureMode(optionalDate) {
  walfordSetTab("future");
  walfordShowDateControls(true);

  const input = document.getElementById("todayDate");
  const today = walfordIsoToday();
  const selected = optionalDate || (input && input.value) || walfordNearestFixtureDate(today);
  const safeDate = walfordNearestFixtureDate(selected);

  if (input) input.value = safeDate;

  const showBtn = document.getElementById("showTodayBtn");
  if (showBtn) showBtn.textContent = "Show fixtures";

  walfordUpdateTitle(`Future Fixtures — ${walfordDisplayDate(safeDate)}`);
  walfordRenderSelectedFixtures();
}

function walfordSetResultsMode() {
  walfordSetTab("results");
  walfordShowDateControls(false);

  const todayGrid = document.getElementById("todayMatches");
  const resultsList = document.getElementById("resultsList");

  walfordUpdateTitle("Latest Results");

  if (todayGrid && resultsList) {
    todayGrid.innerHTML = resultsList.innerHTML || "<p>No results loaded yet.</p>";
  }
}

function walfordBuildFutureDateList() {
  const input = document.getElementById("todayDate");
  if (!input) return;

  const dates = walfordFixtureDates();
  if (!dates.length) return;

  const today = walfordIsoToday();
  const nearest = walfordNearestFixtureDate(today);

  input.value = nearest;
  input.min = dates[0];
  input.max = dates[dates.length - 1];
}

document.addEventListener("DOMContentLoaded", () => {
  const todayBtn = document.getElementById("fcToday");
  const futureBtn = document.getElementById("fcFuture");
  const resultsBtn = document.getElementById("fcResults");
  const dateInput = document.getElementById("todayDate");
  const showBtn = document.getElementById("showTodayBtn");

  if (todayBtn) todayBtn.addEventListener("click", walfordSetTodayMode);

  if (futureBtn) {
    futureBtn.addEventListener("click", () => {
      const input = document.getElementById("todayDate");
      walfordSetFutureMode(input ? input.value : undefined);
    });
  }

  if (resultsBtn) resultsBtn.addEventListener("click", walfordSetResultsMode);

  if (dateInput) {
    dateInput.addEventListener("change", () => {
      walfordSetFutureMode(dateInput.value);
    });
  }

  if (showBtn) {
    showBtn.addEventListener("click", () => {
      const input = document.getElementById("todayDate");
      walfordSetFutureMode(input ? input.value : undefined);
    });
  }

  // Wait for app.js/Supabase to load fixtures, then initialise.
  setTimeout(() => {
    walfordBuildFutureDateList();
    walfordSetTodayMode();
  }, 1200);
});
