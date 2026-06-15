# Walford V5.6 Version Tidy + Knockout Test Cleanup

Upload/replace:
- index.html

Upload this new file:
- v5-6-site-version.css

Then run this SQL in Supabase SQL Editor:
- clear-test-knockout-results.sql

What this does:
1. Sets local CSS/JS cache-busting to v=5.6.0.
2. Keeps only one clean script order:
   config.js
   app.js
   fixture-centre.js
   knockout-auto.js
   home-knockout-tracker.js
   golden-boot.js
   squad-hub.js
   match-scorers-admin.js
3. Adds visible footer text:
   Site version: V5.6
4. Provides SQL to clear the known test knockout results:
   M73, M75, M76

After upload:
1. Commit index.html and v5-6-site-version.css.
2. Wait for GitHub Pages green tick.
3. Press Ctrl + Shift + R.
4. Check footer says Site version: V5.6.
5. In Supabase SQL Editor, run clear-test-knockout-results.sql.
