// Walford V3.7 Fixture Centre Tabs
// This is intentionally separate from app.js so your working Supabase/Admin code stays untouched.

function walfordIsoToday() {
  return new Date().toISOString().slice(0, 10);
}

function walfordDisplayDate(iso) {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function setFixtureMode(mode) {
  const todayBtn = document.getElementById("fcToday");
  const futureBtn = document.getElementById("fcFuture");
  const resultsBtn = document.getElementById("fcResults");
  const dateInput = document.getElementById("todayDate");
  const showBtn = document.getElementById("showTodayBtn");
  const title = document.getElementById("fixtureModeTitle");
  const todayGrid = document.getElementById("todayMatches");
  const resultsList = document.getElementById("resultsList");

  [todayBtn, futureBtn, resultsBtn].forEach(btn => btn && btn.classList.remove("active"));
  if (mode === "today" && todayBtn) todayBtn.classList.add("active");
  if (mode === "future" && futureBtn) futureBtn.classList.add("active");
  if (mode === "results" && resultsBtn) resultsBtn.classList.add("active");

  if (mode === "today") {
    if (title) title.textContent = "Today’s Fixtures";
    if (dateInput) {
      dateInput.value = walfordIsoToday();
      dateInput.style.display = "none";
    }
    if (showBtn) showBtn.style.display = "none";
    if (todayGrid) todayGrid.style.display = "";
    if (typeof renderToday === "function") renderToday();
  }

  if (mode === "future") {
    if (title) title.textContent = "Future Fixtures";
    if (dateInput) dateInput.style.display = "";
    if (showBtn) {
      showBtn.style.display = "";
      showBtn.textContent = "Show fixtures";
    }
    if (todayGrid) todayGrid.style.display = "";
    if (typeof renderToday === "function") renderToday();
  }

  if (mode === "results") {
    if (title) title.textContent = "Latest Results";
    if (dateInput) dateInput.style.display = "none";
    if (showBtn) showBtn.style.display = "none";

    if (todayGrid && resultsList) {
      todayGrid.style.display = "";
      todayGrid.innerHTML = resultsList.innerHTML || "<p>No results loaded yet.</p>";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const todayBtn = document.getElementById("fcToday");
  const futureBtn = document.getElementById("fcFuture");
  const resultsBtn = document.getElementById("fcResults");
  const dateInput = document.getElementById("todayDate");
  const showBtn = document.getElementById("showTodayBtn");

  if (todayBtn) todayBtn.addEventListener("click", () => setFixtureMode("today"));
  if (futureBtn) futureBtn.addEventListener("click", () => setFixtureMode("future"));
  if (resultsBtn) resultsBtn.addEventListener("click", () => setFixtureMode("results"));

  if (dateInput) {
    dateInput.addEventListener("change", () => {
      setFixtureMode("future");
    });
  }

  if (showBtn) {
    showBtn.addEventListener("click", () => {
      setFixtureMode("future");
    });
  }

  // Let app.js finish its first render, then switch to true Today's Fixtures mode.
  setTimeout(() => setFixtureMode("today"), 800);
});
