```js
// Walford V5.8.5 Fixture Centre Button Fix
// Replaces fixture-centre.js only.
// Fixes:
// - Fixture Centre buttons not responding
// - Future Fixtures showing old/past dates
// - Old date box taking over the controls

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

  return WALFORD_FIXTURE_DATES.filter(date => date > today);
}

function walfordControlsHost() {
  let controls = document.querySelector(".today-controls");

  if (!controls) {
    const todayMatches = document.getElementById("todayMatches");
    controls = document.createElement("div");
    controls.className = "today-controls";

    if (todayMatches && todayMatches.parentNode) {
      todayMatches.parentNode.insertBefore(controls, todayMatches);
    }
  }

  return controls;
}

function walfordDateChooserHost() {
  let chooser = document.getElementById("fixtureDateChooser");
  const controls = walfordControlsHost();

  if (!chooser && controls && controls.parentNode) {
    chooser = document.createElement("div");
    chooser.id = "fixtureDateChooser";
    chooser.className = "fixture-date-chooser";
    controls.parentNode.insertBefore(chooser, controls.nextSibling);
  }

  return chooser;
}

function walfordTitle(text) {
  const title = document.getElementById("fixtureModeTitle");

  if (title) {
    title.textContent = text;
  }
}

function walfordRenderButtons(activeMode) {
  const controls = walfordControlsHost();

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
  `;
}

function walfordSetDateAndRender(dateIso) {
  let input = document.getElementById("todayDate");

  if (!input) {
    input = document.createElement("input");
    input.id = "todayDate";
    input.type = "date";
    input.style.display = "none";
    document.body.appendChild(input);
  }

  input.value = dateIso;

  if (typeof renderToday === "function") {
    renderToday();
    return;
  }

  const showButton = document.getElementById("showTodayBtn");

  if (showButton) {
    showButton.click();
  }
}

function walfordRestoreButtons(activeMode) {
  setTimeout(() => {
    walfordRenderButtons(activeMode);
  }, 80);

  setTimeout(() => {
    walfordRenderButtons(activeMode);
  }, 250);
}

function walfordSetTodayMode() {
  const today = walfordIsoToday();
  const chooser = walfordDateChooserHost();

  walfordRenderButtons("today");

  if (chooser) {
    chooser.innerHTML = "";
  }

  walfordTitle(`Today’s Fixtures — ${walfordDisplayDate(today)}`);
  walfordSetDateAndRender(today);
  walfordRestoreButtons("today");
}

function walfordSetFutureMode(selectedDate) {
  const futureDates = walfordFutureFixtureDates();
  const chooser = walfordDateChooserHost();
  const todayMatches = document.getElementById("todayMatches");

  walfordRenderButtons("future");

  if (!futureDates.length) {
    walfordTitle("Future Fixtures");

    if (chooser) {
      chooser.innerHTML = "";
    }

    if (todayMatches) {
      todayMatches.innerHTML = `
        <p class="status">
          No future group fixtures left. Use the Knockout Tracker for the next stage.
        </p>
      `;
    }

    walfordRestoreButtons("future");
    return;
  }

  const chosen = selectedDate && futureDates.includes(selectedDate)
    ? selectedDate
    : futureDates[0];

  walfordTitle(`Future Fixtures — ${walfordDisplayDate(chosen)}`);

  if (chooser) {
    chooser.innerHTML = futureDates.map(date => {
      const active = date === chosen ? "active" : "";

      return `
        <button type="button" class="fixture-date-pill ${active}" data-date="${date}">
          ${walfordShortDate(date)}
        </button>
      `;
    }).join("");
  }

  walfordSetDateAndRender(chosen);

  setTimeout(() => {
    walfordRenderButtons("future");

    const freshChooser = walfordDateChooserHost();

    if (freshChooser) {
      freshChooser.innerHTML = futureDates.map(date => {
        const active = date === chosen ? "active" : "";

        return `
          <button type="button" class="fixture-date-pill ${active}" data-date="${date}">
            ${walfordShortDate(date)}
          </button>
        `;
      }).join("");
    }
  }, 100);
}

function walfordSetResultsMode() {
  const chooser = walfordDateChooserHost();
  const todayMatches = document.getElementById("todayMatches");
  const resultsList = document.getElementById("resultsList");

  walfordRenderButtons("results");

  if (chooser) {
    chooser.innerHTML = "";
  }

  walfordTitle("Latest Results");

  if (todayMatches && resultsList) {
    todayMatches.innerHTML = resultsList.innerHTML || `<p class="status">No results loaded yet.</p>`;
  } else if (todayMatches) {
    todayMatches.innerHTML = `<p class="status">No results loaded yet.</p>`;
  }

  walfordRestoreButtons("results");
}

document.addEventListener("click", event => {
  const target = event.target;

  if (!target) return;

  if (target.id === "fcToday") {
    event.preventDefault();
    walfordSetTodayMode();
  }

  if (target.id === "fcFuture") {
    event.preventDefault();
    walfordSetFutureMode();
  }

  if (target.id === "fcResults") {
    event.preventDefault();
    walfordSetResultsMode();
  }

  if (target.classList && target.classList.contains("fixture-date-pill")) {
    event.preventDefault();
    walfordSetFutureMode(target.dataset.date);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    walfordSetTodayMode();
  }, 1200);
});
```
