# Walford World Cup V6 Core

This folder contains the shared V6 foundation for the website.

## Files

### dom.js
Shared DOM helpers:
- find elements
- show/hide sections
- set text/html
- escape unsafe text

### teams.js
Shared team matching:
- team aliases
- USA / US handling
- Switzerland / CH handling
- same-team checks

### helpers.js
Shared general helpers:
- owner display names
- safe numbers
- date keys
- sorting
- grouping

### state.js
Shared temporary page state:
- teams
- fixtures
- results
- players
- scorers

### data.js
Loads fallback data from:
- window.FALLBACK_TEAMS
- window.FALLBACK_FIXTURES

### startup.js
Starts the V6 core and confirms it loaded in the browser console.

## V6 Rule

One source of truth.

Do not create duplicate helper functions in feature files if the logic already exists in the V6 core.
