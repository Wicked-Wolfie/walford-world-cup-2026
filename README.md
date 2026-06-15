# Walford V5.5.1 Index Script Order Fix

Upload/replace:
- index.html

What this fixes:
- Removes the accidental duplicate unversioned knockout-auto.js line.
- Keeps the correct script order:
  config.js
  app.js
  fixture-centre.js
  knockout-auto.js
  home-knockout-tracker.js
  golden-boot.js
  squad-hub.js
  match-scorers-admin.js
- Updates cache-busting to v=5.5.1.

Why:
- knockout-auto.js was being loaded twice.
- The first accidental copy was loaded before config.js.
- Duplicate scripts can cause odd repeated rendering or admin behaviour.

After upload:
1. Commit index.html.
2. Wait for the GitHub Pages green tick.
3. Open the site and press Ctrl + Shift + R.
