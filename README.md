# Walford V5.7.1 Walford TV Embed Block Fix

Upload/replace:
- index.html
- walford-tv.css

Why:
- The YouTube video is showing "Video unavailable" because the video/playlist content blocks playback inside embedded players.
- This patch changes Walford TV from an embedded player into a reliable YouTube launcher card.

What changes:
- The TV section now shows a clickable preview card.
- Clicking it opens the YouTube video/playlist directly on YouTube:
  https://www.youtube.com/watch?v=1R-snvCDsco&list=PLPc9-Pu8oghQ
- No MP4 files are needed.
- You can still add videos to the YouTube playlist later.

After upload:
1. Commit files.
2. Wait for GitHub Pages green tick.
3. Press Ctrl + Shift + R.
4. Click the Walford TV preview card.
