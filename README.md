# Walford V5.7.8 USA Player List Fix

Upload/replace:
- index.html
- golden-boot.js
- match-scorers-admin.js

What this fixes:
- United States / USA naming mismatch.
- If squad_players stores the team as USA but the website dropdown says United States, the player list now still loads.
- Also adds safe aliases for:
  South Korea / Korea Republic
  Türkiye / Turkey
  Ivory Coast / Cote d'Ivoire
  DR Congo / Congo DR
  Curacao / Curaçao
  Cape Verde / Cabo Verde
  Czechia / Czech Republic

What to test:
1. Sign in as Admin.
2. Go to Golden Boot.
3. Select United States.
4. Player dropdown should show USA players.
5. Go to Match Result + Scorers.
6. Add scorer row, select United States, check player dropdown.

No Supabase SQL changes needed.
