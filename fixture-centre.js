// Walford V5.8.7 Fixture Centre Safe DOM Fix
// Replaces fixture-centre.js only.
// No template strings. No risky inline HTML status strings.

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

return yyyy + "-" + mm + "-" + dd;
}

function walfordDisplayDate(iso) {
if (!iso || !iso.includes("-")) return iso || "";

const parts = iso.split("-");
return parts[2] + "/" + parts[1] + "/" + parts[0];
}

function walfordShortDate(iso) {
if (!iso || !iso.includes("-")) return iso || "";

const d = new Date(iso + "T12:00:00");

return d.toLocaleDateString("en-GB", {
day: "2-digit",
month: "short"
});
}

function walfordFutureFixtureDates() {
const today = walfordIsoToday();

return WALFORD_FIXTURE_DATES.filter(function(date) {
return date > today;
});
}

function walfordControlsHost() {
let controls = document.querySelector(".today-controls");

if (!controls) {
const todayMatches = document.getElementById("todayMatches");
controls = document.createElement("div");
controls.className = "today-controls";

```
if (todayMatches && todayMatches.parentNode) {
  todayMatches.parentNode.insertBefore(controls, todayMatches);
}
```

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

function walfordMakeButton(id, text, active) {
const button = document.createElement("button");
button.id = id;
button.type = "button";
button.textContent = text;

if (active) {
button.className = "active";
}

return button;
}

function walfordRenderButtons(activeMode) {
const controls = walfordControlsHost();

if (!controls) return;

controls.innerHTML = "";

controls.appendChild(
walfordMakeButton("fcToday", "Today’s Fixtures", activeMode === "today")
);

controls.appendChild(
walfordMakeButton("fcFuture", "Future Fixtures", activeMode === "future")
);

controls.appendChild(
walfordMakeButton("fcResults", "Latest Results", activeMode === "results")
);
}

function walfordSetStatusMessage(message) {
const todayMatches = document.getElementById("todayMatches");

if (!todayMatches) return;

todayMatches.innerHTML = "";

const p = document.createElement("p");
p.className = "status";
p.textContent = message;

todayMatches.appendChild(p);
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
setTimeout(function() {
walfordRenderButtons(activeMode);
}, 80);

setTimeout(function() {
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

walfordTitle("Today’s Fixtures — " + walfordDisplayDate(today));
walfordSetDateAndRender(today);
walfordRestoreButtons("today");
}

function walfordBuildFutureDateButtons(futureDates, chosen) {
const chooser = walfordDateChooserHost();

if (!chooser) return;

chooser.innerHTML = "";

futureDates.forEach(function(date) {
const button = document.createElement("button");
button.type = "button";
button.className = "fixture-date-pill" + (date === chosen ? " active" : "");
button.dataset.date = date;
button.textContent = walfordShortDate(date);

```
chooser.appendChild(button);
```

});
}

function walfordSetFutureMode(selectedDate) {
const futureDates = walfordFutureFixtureDates();
const chooser = walfordDateChooserHost();

walfordRenderButtons("future");

if (!futureDates.length) {
walfordTitle("Future Fixtures");

```
if (chooser) {
  chooser.innerHTML = "";
}

walfordSetStatusMessage("No future group fixtures left. Use the Knockout Tracker for the next stage.");
walfordRestoreButtons("future");
return;
```

}

const chosen =
selectedDate && futureDates.includes(selectedDate)
? selectedDate
: futureDates[0];

walfordTitle("Future Fixtures — " + walfordDisplayDate(chosen));
walfordBuildFutureDateButtons(futureDates, chosen);
walfordSetDateAndRender(chosen);

setTimeout(function() {
walfordRenderButtons("future");
walfordBuildFutureDateButtons(futureDates, chosen);
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

if (todayMatches && resultsList && resultsList.innerHTML.trim()) {
todayMatches.innerHTML = resultsList.innerHTML;
} else {
walfordSetStatusMessage("No results loaded yet.");
}

walfordRestoreButtons("results");
}

document.addEventListener("click", function(event) {
const target = event.target;

if (!target) return;

if (target.id === "fcToday") {
event.preventDefault();
walfordSetTodayMode();
return;
}

if (target.id === "fcFuture") {
event.preventDefault();
walfordSetFutureMode();
return;
}

if (target.id === "fcResults") {
event.preventDefault();
walfordSetResultsMode();
return;
}

if (target.classList && target.classList.contains("fixture-date-pill")) {
event.preventDefault();
walfordSetFutureMode(target.dataset.date);
}
});

document.addEventListener("DOMContentLoaded", function() {
setTimeout(function() {
walfordSetTodayMode();
}, 1200);
});
