# Walford V5.5 Match Result + Scorers Combined Entry

This is a safe add-on.

Upload these two new files:
- match-scorers-admin.js
- match-scorers-admin.css

Then edit index.html.

In the <head>, after your other CSS files, add:
<link rel="stylesheet" href="match-scorers-admin.css?v=5.5.0">

Near the bottom, after squad-hub.js, add:
<script src="match-scorers-admin.js?v=5.5.0"></script>

Recommended bottom order:
<script src="config.js?v=5.3.0"></script>
<script src="app.js?v=5.3.0"></script>
<script src="fixture-centre.js?v=5.3.0"></script>
<script src="knockout-auto.js?v=5.3.0"></script>
<script src="home-knockout-tracker.js?v=5.3.0"></script>
<script src="golden-boot.js?v=5.3.0"></script>
<script src="squad-hub.js?v=5.3.0"></script>
<script src="match-scorers-admin.js?v=5.5.0"></script>

No Supabase changes needed.

What it adds:
- New Match Result + Scorers admin panel.
- Saves match result to results table.
- Saves scorers to goal_scorers table.
- If match code is supplied, replaces old scorers for that match code.
- Uses squad player autocomplete if Squad Hub database is loaded.
