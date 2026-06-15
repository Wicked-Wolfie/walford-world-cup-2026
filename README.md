# Walford V5.7.6 Player Select Dropdowns

Upload/replace:
- index.html

Upload these new files:
- player-select-dropdowns.js
- player-select-dropdowns.css

What this fixes:
- The browser datalist kept closing, so you could not reliably select the next player.
- This patch replaces those fragile player inputs with proper player select dropdowns.
- Golden Boot player field becomes a real dropdown.
- Match Result + Scorers player fields become real dropdowns.
- Changing team reloads the player dropdown.
- Player names stay alphabetical.

No Supabase SQL changes needed.

After upload:
1. Commit files.
2. Wait for GitHub Pages green tick.
3. Press Ctrl + Shift + R.
4. Sign in as Admin.
5. Go to Golden Boot and try adding several scorers in a row.
6. Go to Match Result + Scorers and try Add scorer row.
