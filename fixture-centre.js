```js
// Walford V5.8.4 Fixture Centre Stable Tabs
// Replaces fixture-centre.js only.
// Fixes:
// 1. Future Fixtures showing past fixtures
// 2. Buttons disappearing after selecting a mode/date

const WALFORD_FIXTURE_DATES = [
  "2026-06-11",
  "2026-06-12",
  "2026-06-13",
  "2026-06-14",
  "2026-06-15",
  "2026-06-16",
  "2026-06-17",
  "2026-06-18",
  "2026-06-19",
  "2026-06-20",
  "2026-06-21",
  "2026-06-22",
  "2026-06-23",
  "2026-06-24",
  "2026-06-25",
  "2026-06-26",
  "2026-06-27"
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
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });
}

function walfordFutureFixtureDates() {
  const today = walfordIsoToday();

  // Important:
  // Do NOT fall back to the last 3 dates.
  // That was why Future Fixtures could show past fixtures.
  return WALFORD_FIXTURE_DATES.filter(date => date > today);
}

function walfordTitle(text) {
  const title = document.getElementById("fixtureModeTitle");

  if (title) {
    title.textContent = text;
  }
}

function walfordTodayGrid() {
  return document.getElementById("todayMatches");
}

function walfordEnsureControls() {
  let controls = document.querySelector(".today-controls");

  if (!controls) {
    const todayGrid = walfordTodayGrid();

    controls = document.createElement("div");
    controls.className = "today-controls";

    if (todayGrid && todayGrid.parentNode) {
      todayGrid.parentNode.insertBefore(controls, todayGrid);
    } else {
      const todaySection = document.getElementById("today");
      if (todaySection) todaySection.appendChild(controls);
    }
  }

  return controls;
}

function walfordEnsureDateChooser() {
  let chooser = document.getElementById("fixtureDateChooser");
  const controls = walfordEnsureControls();

  if (!chooser && controls && controls.parentNode) {
    chooser = document.createElement("div");
    chooser.id = "fixtureDateChooser";
    chooser.className = "fixture-date-chooser";
    controls.parentNode.insertBefore(chooser, controls.nextSibling);
  }

  return chooser;
}

function walfordRenderControls(activeMode) {
  const controls = walfordEnsureControls();

  if (!controls) return;

  controls.innerHTML = `
    <button id="fcToday" type="button" class="${activeMode === "today" ? "active" : ""}">
      Today’s Fixtures
    </button>

    <button id="fcFuture" type="button" class="${activeMode === "future" ? "active" : ""}">
      Future Fixtures
    </button>

    <button id="fcResults" type="button" class="${activeMode === "results" ? "active" : ""}">
      Latest Results
    </button>

    <input id="todayDate" type="date" style="display: none;">
    <button id="showTodayBtn" type="button" style="display: none;">Show</button>
  `;

  document.getElementById("fcToday")?.addEventListener("click", walfordSetTodayMode);
  document.getElementById("fcFuture")?.addEventListener("click", () => walfordSetFutureMode());
  document.getElementById("fcResults")?.addEventListener("click", walfordSetResultsMode);
}

function walfordRenderViaApp(dateIso) {
  const input = document.getElementById("todayDate");

  if (input) {
    input.value = dateIso;
  }

  if (typeof renderToday === "function") {
    renderToday();
  }
}

function walfordSetTodayMode() {
  walfordRenderControls("today");

  const chooser = walfordEnsureDateChooser();
  if (chooser) chooser.innerHTML = "";

  const today = walfordIsoToday();

  walfordTitle(`Today’s Fixtures — ${walfordDisplayDate(today)}`);
  walfordRenderViaApp(today);

  // Rebuild the buttons once more after app rendering,
  // in case the original render function changes the controls.
  setTimeout(() => {
    walfordRenderControls("today");
    const newChooser = walfordEnsureDateChooser();
    if (newChooser) newChooser.innerHTML = "";
  }, 50);
}

function walfordSetFutureMode(selectedDate) {
  walfordRenderControls("future");

  const futureDates = walfordFutureFixtureDates();
  const chooser = walfordEnsureDateChooser();
  const todayGrid = walfordTodayGrid();

  walfordTitle("Future Fixtures");

  if (!futureDates.length) {
    if (chooser) {
      chooser.innerHTML = "";
    }

    if (todayGrid) {
      todayGrid.innerHTML = `
        <p class="status">
          No future group fixtures left. Check the Knockout Tracker for the next stage.
        </p>
      `;
    }

    setTimeout(() => walfordRenderControls("future"), 50);
    return;
  }

  const chosen = selectedDate && futureDates.includes(selectedDate)
    ? selectedDate
    : futureDates[0];

  if (chooser) {
    chooser.innerHTML = futureDates.map(date => {
      const active = date === chosen ? "active" : "";

      return `
        <button
          type="button"
          class="fixture-date-pill ${active}"
          data-date="${date}"
        >
          ${walfordShortDate(date)}
        </button>
      `;
    }).join("");

    chooser.querySelectorAll(".fixture-date-pill").forEach(button => {
      button.addEventListener("click", () => {
        walfordSetFutureMode(button.dataset.date);
      });
    });
  }

  walfordTitle(`Future Fixtures — ${walfordDisplayDate(chosen)}`);
  walfordRenderViaApp(chosen);

  // Rebuild buttons after app rendering, then restore date chooser.
  setTimeout(() => {
    walfordRenderControls("future");

    const newChooser = walfordEnsureDateChooser();

    if (newChooser) {
      newChooser.innerHTML = futureDates.map(date => {
        const active = date === chosen ? "active" : "";

        return `
          <button
            type="button"
            class="fixture-date-pill ${active}"
            data-date="${date}"
          >
            ${walfordShortDate(date)}
          </button>
        `;
      }).join("");

      newChooser.querySelectorAll(".fixture-date-pill").forEach(button => {
        button.addEventListener("click", () => {
          walfordSetFutureMode(button.dataset.date);
        });
      });
    }
  }, 50);
}

function walfordSetResultsMode() {
  walfordRenderControls("results");

  const chooser = walfordEnsureDateChooser();
  if (chooser) chooser.innerHTML = "";

  walfordTitle("Latest Results");

  const todayGrid = walfordTodayGrid();
  const resultsList = document.getElementById("resultsList");

  if (todayGrid && resultsList) {
    todayGrid.innerHTML = resultsList.innerHTML || "<p class=\"status\">No results loaded yet.</p>";
  } else if (todayGrid) {
    todayGrid.innerHTML = "<p class=\"status\">No results loaded yet.</p>";
  }

  setTimeout(() => {
    walfordRenderControls("results");
    const newChooser = walfordEnsureDateChooser();
    if (newChooser) newChooser.innerHTML = "";
  }, 50);
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    walfordRenderControls("today");
    walfordSetTodayMode();
  }, 1200);

  setTimeout(() => walfordRenderControls("today"), 2200);
});
```
