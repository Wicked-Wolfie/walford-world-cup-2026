# Walford V4.9 Golden Boot

Phase 3 add-on.

Files:
- golden-boot.sql
- golden-boot.js
- golden-boot.css

Step 1:
Run golden-boot.sql in Supabase SQL Editor.

Step 2:
Upload these two files to GitHub:
- golden-boot.js
- golden-boot.css

Step 3:
Edit index.html.

In the <head>, add:
<link rel="stylesheet" href="golden-boot.css">

Near the bottom, after home-knockout-tracker.js, add:
<script src="golden-boot.js"></script>

Recommended bottom script order:
<script src="config.js"></script>
<script src="app.js"></script>
<script src="fixture-centre.js"></script>
<script src="knockout-auto.js"></script>
<script src="home-knockout-tracker.js"></script>
<script src="golden-boot.js"></script>

What it adds:
- Golden Boot section
- Current scorer leader card
- Top scorers leaderboard
- Latest scorer entries
- Admin goal scorer form
