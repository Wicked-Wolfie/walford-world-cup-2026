# Walford V5.8.1 Real Column Fix

Upload/replace:
- index.html
- golden-boot.js
- match-scorers-admin.js

Why this patch exists:
- The squad_players table has team and team_code.
- It does not have code or country_code.
- V5.8.0 accidentally selected guessed columns, which could make the player query fail.
- V5.8.1 selects only real columns:
  team, team_code, player_name, position, club, squad_number

Also included:
- check-squad-player-team-codes.sql now uses only real columns.
- Algeria mapping includes ALG as shown by your Supabase screenshot.

After upload:
1. Commit the files.
2. Wait for GitHub Pages green tick.
3. Press Ctrl + Shift + R.
4. Sign in as Admin.
5. Test United States.
6. If any team still fails, run check-squad-player-team-codes.sql and send screenshot/results.
