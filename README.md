# YouTube Copy Video ID (Chrome Extension)

Adds a 📋 button near every YouTube video (standard UI + YouTube Studio + watch pages) that copies the video_id to the clipboard and shows a small floating confirmation.

## Features
- Works on search results, home feed, channel video lists.
- Works in YouTube Studio video list (always visible button after each row).
- Adds button near the watch page title.
- One-click copy of the pure `video_id`.
- Floating toast with the copied ID.

## Installation (Developer Mode)
1. Clone this repo.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** → select the project folder.
5. Open YouTube and hover/click the 📋 buttons.

## Files
- `manifest.json` – MV3 manifest.
- `content.js` – injection logic.
- `icons/` – extension icons (PNG + SVG source).

## License
MIT (or whatever you choose).

