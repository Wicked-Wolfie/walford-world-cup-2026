# Walford V5.7.4 Goal Scorer Player Reload Fix

Upload/replace:
- index.html
- squad-hub.js
- match-scorers-admin.js

What this fixes:
- After saving a Golden Boot scorer, the player field is reconnected to the squad-player autocomplete list.
- The player list reloads when you click/focus the player field.
- The player field clears and reloads when you change team.
- Match Result + Scorers rows also reload their player list on focus/click.
- The Clear Scorers button now leaves one fresh blank scorer row.

Why:
- Golden Boot re-renders its form after a save.
- The old player input was replaced by a new one, but the squad datalist was not always reattached.
- This patch listens for the Golden Boot render event and reconnects the player picker.

After upload:
1. Commit the files.
2. Wait for GitHub Pages green tick.
3. Press Ctrl + Shift + R.
4. Sign in as Admin.
5. Add one scorer in Golden Boot.
6. The player field should reload for the next scorer.
