// Walford V5.8.9 Fixture Centre Simple Stable Fix
// Replaces fixture-centre.js only.
// Fixes duplicated controls and Future Fixtures click issue.

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

let walfordFixtureMode = "today";
let walfordFixtureChosenDate = "";

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

function walfordPanel() {
const todayMatches = document.getElementById("todayMatches");

if (todayMatches && todayMatches.parentNode) {
return todayMatches.parentNode;
}

return document.getElementById("today") || document.body;
}

function walfordHideOldControls() {
const controls = document.querySelectorAll(".today-controls");

controls.forEach(function(control) {
if (control.id !== "walfordFixtureTabs") {
control.style.display = "none";
}
});

const oldDate = document.getElementById("todayDate");
const oldButton = document.getElementById("showTodayBtn");

if (oldDate) oldDate.style.display = "none";
if (oldButton) oldButton.style.display = "none";
}

function walfordTitle(text) {
const title = document.getElementById("fixtureModeTitle");

if (title) {
title.textContent = text;
}
}

function walfordEnsureTabs() {
let tabs = document.getElementById("walfordFixtureTabs");
const panel = walfordPanel();
const todayMatches = document.getElementById("todayMatches");

if (!tabs) {
tabs = document.createElement("div");
tabs.id = "walfordFixtureTabs";
tabs.className = "today-controls";

```
if (todayMatches && todayMatches.parentNode) {
  todayMatches.parentNode.insertBefore(tabs, todayMatches);
} else {
  panel.insertBefore(tabs, panel.firstChild);
}
```

}

tabs.style.display = "flex";

let todayClass = "";
let futureClass = "";
let resultsClass = "";

if (walfordFixtureMode === "today") todayClass = "active";
if (walfordFixtureMode === "future") futureClass = "active";
if (walfordFixtureMode === "results") resultsClass = "active";

tabs.innerHTML =
  '<button id="fcToday" type="button" class="' + todayClass + '">Today’s Fixtures</button>' +
  '<button id="fcFuture" type="button" class="' + futureClass + '">Future Fixtures</button>' +
  '<button id="fcResults" type="button" class="' + resultsClass + '">Latest Results</button>';

return tabs;
}

function walfordEnsureChooser() {
let chooser = document.getElementById("walfordFixtureDateChooser");
const tabs = walfordEnsureTabs();

if (!chooser) {
chooser = document.createElement("div");
chooser.id = "walfordFixtureDateChooser";
chooser.className = "fixture-date-chooser";

```
if (tabs && tabs.parentNode) {
  tabs.parentNode.insertBefore(chooser, tabs.nextSibling);
}
```

}

return chooser;
}

function walfordSetStatusMessage(message) {
const todayMatches = document.getElementById("todayMatches");

if (!todayMatches) return;

todayMatches.innerHTML = "<p class="status">" + message + "</p>";
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
} else {
const showButton = document.getElementById("showTodayBtn");
if (showButton) showButton.click();
}

setTimeout(function() {
walfordHideOldControls();
walfordEnsureTabs();

```
if (walfordFixtureMode === "future") {
  walfordBuildFutureDateButtons();
}
```

}, 100);

setTimeout(function() {
walfordHideOldControls();
walfordEnsureTabs();

```
if (walfordFixtureMode === "future") {
  walfordBuildFutureDateButtons();
}
```

}, 300);
}

function walfordBuildFutureDateButtons() {
const futureDates = walfordFutureFixtureDates();
const chooser = walfordEnsureChooser();

if (!chooser) return;

chooser.innerHTML = "";

if (walfordFixtureMode !== "future") {
return;
}

let html = "";

futureDates.forEach(function(date) {
const active = date === walfordFixtureChosenDate ? " active" : "";

```
html +=
  "<button type=\"button\" class=\"fixture-date-pill" + active + "\" data-date=\"" + date + "\">" +
  walfordShortDate(date) +
  "</button>";
```

});

chooser.innerHTML = html;
}

function walfordSetTodayMode() {
const today = walfordIsoToday();
const chooser = walfordEnsureChooser();

walfordFixtureMode = "today";
walfordFixtureChosenDate = today;

walfordHideOldControls();
walfordEnsureTabs();

if (chooser) {
chooser.innerHTML = "";
}

walfordTitle("Today’s Fixtures — " + walfordDisplayDate(today));
walfordSetDateAndRender(today);
}

function walfordSetFutureMode(selectedDate) {
const futureDates = walfordFutureFixtureDates();

walfordFixtureMode = "future";

walfordHideOldControls();
walfordEnsureTabs();

if (!futureDates.length) {
walfordFixtureChosenDate = "";
walfordTitle("Future Fixtures");
walfordBuildFutureDateButtons();
walfordSetStatusMessage("No future group fixtures left. Use the Knockout Tracker for the next stage.");
return;
}

if (selectedDate && futureDates.includes(selectedDate)) {
walfordFixtureChosenDate = selectedDate;
} else {
walfordFixtureChosenDate = futureDates[0];
}

walfordTitle("Future Fixtures — " + walfordDisplayDate(walfordFixtureChosenDate));
walfordBuildFutureDateButtons();
walfordSetDateAndRender(walfordFixtureChosenDate);
}

function walfordSetResultsMode() {
const chooser = walfordEnsureChooser();
const todayMatches = document.getElementById("todayMatches");
const resultsList = document.getElementById("resultsList");

walfordFixtureMode = "results";
walfordFixtureChosenDate = "";

walfordHideOldControls();
walfordEnsureTabs();

if (chooser) {
chooser.innerHTML = "";
}

walfordTitle("Latest Results");

if (todayMatches && resultsList && resultsList.innerHTML.trim()) {
todayMatches.innerHTML = resultsList.innerHTML;
} else {
walfordSetStatusMessage("No results loaded yet.");
}
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

setTimeout(function() {
walfordHideOldControls();
walfordEnsureTabs();
}, 2200);
});
