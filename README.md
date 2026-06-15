# Walford World Cup Syndicate 2026 V3.6 Knockout Bracket Patch

This patch adds a Knockout Bracket section.

It is designed to be safe:
- It does not change Supabase settings
- It does not break Admin
- It does not change results entry
- It adds a visual bracket section for Round of 32 through Final

Files included:
- knockout-section.html
- knockout-css.css
- knockout-js.js
- README.md

How to apply:
1. Open index.html in GitHub.
2. Paste knockout-section.html just before the Banter section.
3. In the top navigation, add:
   <a href="#knockout">Knockout</a>
4. Open styles.css and paste knockout-css.css at the very bottom.
5. Open app.js and paste knockout-js.js at the very bottom.
6. Commit changes.
7. Hard refresh the website with Ctrl + F5.

Next later upgrade:
We can make the bracket auto-fill from actual group winners once the group stage is complete.
