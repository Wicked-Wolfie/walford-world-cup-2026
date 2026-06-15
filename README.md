# Walford V5.0 Squad Hub

This phase uses the uploaded FIFA squad list PDF.

Files:
- squad-hub.sql
- squad-hub.js
- squad-hub.css

Step 1:
Run squad-hub.sql in Supabase SQL Editor.

This creates and fills:
- head_coaches
- squad_players

It imports:
- 48 head coaches
- 1,248 squad players

Step 2:
Upload these two files to GitHub root, same folder as index.html:
- squad-hub.js
- squad-hub.css

Step 3:
Edit index.html.

In the <head>, after golden-boot.css, add:
<link rel="stylesheet" href="squad-hub.css">

Near the bottom, after golden-boot.js, add:
<script src="squad-hub.js"></script>

Recommended bottom script order:
<script src="config.js"></script>
<script src="app.js"></script>
<script src="fixture-centre.js"></script>
<script src="knockout-auto.js"></script>
<script src="home-knockout-tracker.js"></script>
<script src="golden-boot.js"></script>
<script src="squad-hub.js"></script>

What it adds:
- Squad Hub section
- Head coach details
- Full player squad cards
- Player details panel
- Key players by international goals
- Golden Boot scorer autocomplete based on selected team
