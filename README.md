# Walford V5.7.5 Golden Boot Edit Entries

Upload/replace:
- index.html
- golden-boot.js
- golden-boot.css

Then run this in Supabase SQL Editor:
- golden-boot-edit-policy.sql

What this adds:
- Edit button next to each Recent scorer entry.
- Click Edit to load that scorer into the admin form.
- Amend date, match code, team, player, or goals.
- Click Update scorer.
- Cancel edit button returns the form to normal add mode.

How to use:
1. Sign in as Admin.
2. Go to Golden Boot.
3. Find the entry in Recent scorer entries.
4. Click Edit.
5. Change the fields.
6. Click Update scorer.

For missing entries:
- Use the same form in normal Save scorer mode.

Why the SQL is needed:
- Delete and insert already worked.
- Update needs its own Supabase Row Level Security policy.
