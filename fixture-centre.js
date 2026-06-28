// Walford V5.8.14 Fixture Centre Clean Fix
// Replaces fixture-centre.js only.
// Uses existing buttons, removes old date box, fixes Future Fixtures.

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
  "2026-06-27",
  "2026-06-28",
  "2026-06-29",
  "2026-06-30",
  "2026-07-01",
  "2026-07-02",
  "2026-07-03",
  "2026-07-04",
  "2026-07-05",
  "2026-07-06",
  "2026-07-07",
  "2026-07-09",
  "2026-07-10",
  "2026-07-11",
  "2026-07-12",
  "2026-07-14",
  "2026-07-15",
  "2026-07-18",
  "2026-07-19"
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
if (!iso || !iso.includes("-")) {
return iso || "";
}

const parts = iso.split("-");
return parts[2] + "/" + parts[1] + "/" + parts[0];
}

function walfordShortDate(iso) {
if (!iso || !iso.includes("-")) {
return iso || "";
}

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

function walfordTitle(text) {
const title = document.getElementById("fixtureModeTitle");

if (title) {
title.textContent = text;
}
}

function walfordSetActiveButton(mode) {
const todayButton = document.getElementById("fcToday");
const futureButton = document.getElementById("fcFuture");
const resultsButton = document.getElementById("fcResults");

if (todayButton) {
todayButton.classList.remove("active");
}

if (futureButton) {
futureButton.classList.remove("active");
}

if (resultsButton) {
resultsButton.classList.remove("active");
}

if (mode === "today" && todayButton) {
todayButton.classList.add("active");
}

if (mode === "future" && futureButton) {
futureButton.classList.add("active");
}

if (mode === "results" && resultsButton) {
resultsButton.classList.add("active");
}
}

function walfordHideDateBox() {
const todayDate = document.getElementById("todayDate");
const showTodayBtn = document.getElementById("showTodayBtn");

if (todayDate) {
todayDate.style.display = "none";
}

if (showTodayBtn) {
showTodayBtn.style.display = "none";
}
}

function walfordChooserHost() {
let chooser = document.getElementById("walfordFixtureDateChooser");

if (chooser) {
return chooser;
}

const todayMatches = document.getElementById("todayMatches");

chooser = document.createElement("div");
chooser.id = "walfordFixtureDateChooser";
chooser.className = "fixture-date-chooser";

if (todayMatches && todayMatches.parentNode) {
todayMatches.parentNode.insertBefore(chooser, todayMatches);
}

return chooser;
}

function walfordClearChooser() {
const chooser = walfordChooserHost();

if (chooser) {
chooser.innerHTML = "";
}
}

function walfordSetStatusMessage(message) {
const todayMatches = document.getElementById("todayMatches");

if (!todayMatches) {
return;
}

todayMatches.innerHTML = "";

const p = document.createElement("p");
p.className = "status";
p.textContent = message;

todayMatches.appendChild(p);
}

function walfordSetDateAndRender(dateIso) {
let todayDate = document.getElementById("todayDate");

if (!todayDate) {
todayDate = document.createElement("input");
todayDate.id = "todayDate";
todayDate.type = "date";
todayDate.style.display = "none";
document.body.appendChild(todayDate);
}

todayDate.value = dateIso;

if (typeof renderToday === "function") {
  renderToday();
} else {
  const showTodayBtn = document.getElementById("showTodayBtn");

  if (showTodayBtn) {
    showTodayBtn.click();
  }
}

setTimeout(walfordHideDateBox, 50);
setTimeout(walfordHideDateBox, 250);
}

function walfordBuildFutureDateButtons() {
  const futureDates = walfordFutureFixtureDates();
  const chooser = walfordChooserHost();

  if (!chooser) {
    return;
  }

  while (chooser.firstChild) {
    chooser.removeChild(chooser.firstChild);
  }

  for (let i = 0; i < futureDates.length; i++) {
    const date = futureDates[i];
    const button = document.createElement("button");

    button.type = "button";
    button.className = "fixture-date-pill";

    if (date === walfordFixtureChosenDate) {
      button.className = "fixture-date-pill active";
    }

    button.setAttribute("data-date", date);
    button.textContent = walfordShortDate(date);

    chooser.appendChild(button);
  }
}
function walfordSetTodayMode() {
const today = walfordIsoToday();

walfordFixtureMode = "today";
walfordFixtureChosenDate = today;

walfordSetActiveButton("today");
walfordClearChooser();
walfordHideDateBox();

walfordTitle("Today’s Fixtures — " + walfordDisplayDate(today));
walfordSetDateAndRender(today);
}

function walfordSetFutureMode(selectedDate) {
const futureDates = walfordFutureFixtureDates();

walfordFixtureMode = "future";
walfordSetActiveButton("future");
walfordHideDateBox();

if (!futureDates.length) {
walfordFixtureChosenDate = "";
walfordClearChooser();
walfordTitle("Future Fixtures");
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
const todayMatches = document.getElementById("todayMatches");
const resultsList = document.getElementById("resultsList");

walfordFixtureMode = "results";
walfordFixtureChosenDate = "";

walfordSetActiveButton("results");
walfordClearChooser();
walfordHideDateBox();

walfordTitle("Latest Results");

if (todayMatches && resultsList && resultsList.innerHTML.trim()) {
todayMatches.innerHTML = resultsList.innerHTML;
} else {
walfordSetStatusMessage("No results loaded yet.");
}
}

document.addEventListener("click", function(event) {
const target = event.target;

if (!target) {
return;
}

if (target.id === "fcToday") {
event.preventDefault();
walfordSetTodayMode();
return;
}

if (target.id === "fcFuture") {
event.preventDefault();
event.stopPropagation();
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
walfordSetFutureMode(target.getAttribute("data-date"));
}
});

document.addEventListener("DOMContentLoaded", function() {
setTimeout(function() {
walfordHideDateBox();
walfordSetTodayMode();
}, 1200);
});
