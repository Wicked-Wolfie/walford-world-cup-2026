# Walford V5.1 Squad Hub Responsiveness Fix

Upload/replace only this file:

- squad-hub.js

Do not change:
- index.html
- squad-hub.css
- golden-boot.js
- golden-boot.css
- any Supabase SQL

What this fixes:
- Removes the page-wide MutationObserver loop from Squad Hub.
- Keeps Golden Boot autocomplete.
- Stops Chrome showing "Page Unresponsive".

After upload:
1. Commit the file.
2. Wait for GitHub Pages deploy.
3. Press Ctrl + F5.
