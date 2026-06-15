# Walford V5.7.7 Integrated Player Dropdown Fix

Upload/replace:
- index.html
- golden-boot.js
- golden-boot.css
- match-scorers-admin.js
- match-scorers-admin.css

Important:
- This removes the V5.7.6 add-on approach.
- Player dropdowns are now built directly inside Golden Boot and Match Result + Scorers.
- That avoids scripts fighting each other and fixes the player list not reloading.

What to test:
1. Sign in as Admin.
2. Golden Boot:
   - Select team.
   - Player dropdown should fill.
   - Change team.
   - Player dropdown should reload.
   - Save scorer.
   - Form should return with a fresh player dropdown.
3. Match Result + Scorers:
   - Add scorer row.
   - Change scorer team.
   - Player dropdown should reload.
   - Add another row and repeat.

No Supabase SQL changes needed if V5.7.5 edit policy is already run.
