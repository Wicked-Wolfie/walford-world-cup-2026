# Walford V4.8 Homepage Knockout Tracker

This is Phase 2.

Upload these two new files:
- home-knockout-tracker.js
- home-knockout-tracker.css

Then edit index.html and add these two lines:

1. In the <head>, near the other CSS files:
<link rel="stylesheet" href="home-knockout-tracker.css">

2. Near the bottom, after config.js/app.js and after knockout-auto.js:
<script src="home-knockout-tracker.js"></script>

Recommended script order near the bottom:
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="config.js"></script>
<script src="app.js"></script>
<script src="fixture-centre.js"></script>
<script src="knockout-auto.js"></script>
<script src="home-knockout-tracker.js"></script>

What it adds:
- Homepage Knockout Tracker
- Latest Knockout Result
- Next Available Knockout Match
- Road to the Final card

It does not change:
- app.js
- knockout-auto.js
- config.js
- Supabase tables
