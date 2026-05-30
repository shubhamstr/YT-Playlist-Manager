# YouTube Playlist Manager

A powerful browser extension designed to help you manage your YouTube playlists in bulk. Select, filter, move, or remove multiple videos at once with ease directly on the YouTube playlist page.

![YouTube Playlist Manager Screenshot](./yt%20manager%20extension.jpg)

## Features

- **Bulk Selection Options**:
  - **Select All (page)**: Select all loaded videos on the current page view.
  - **Auto Select Entire Playlist**: Automatically scroll down the entire playlist page to load all videos and select them all.
- **Smart Filtering & Targeting**:
  - **Select by Title**: Query and select videos containing specific keywords in their titles.
  - **Select by Channel**: Select videos from specific creators/channels.
  - **Select by Duration**: Filter and select videos longer than a specified number of minutes.
  - **Select Unavailable**: Instantly select deleted, private, or hidden videos to clean up your playlists.
- **Bulk Actions**:
  - **Remove Selected**: Remove all selected videos from the playlist automatically.
  - **Add/Move to Playlist**: Save all selected videos to a different playlist by specifying its name.

---

## Installation

Since this extension is in developer mode, you can load it directly into Google Chrome, Microsoft Edge, Brave, or any Chromium-based browser:

1. **Download/Clone** this repository to your local machine.
2. Open your browser and navigate to the extensions management page:
   - For Chrome: `chrome://extensions/`
   - For Edge: `edge://extensions/`
3. Enable **Developer mode** (usually a toggle switch in the top-right corner).
4. Click on **Load unpacked** (top-left corner).
5. Select the folder containing this extension (where `manifest.json` is located).
6. That's it! The extension is now active.

---

## Usage

1. Open any YouTube playlist (e.g., `https://www.youtube.com/playlist?list=...`).
2. Once the page loads, you will see checkbox selectors injected next to each video's thumbnail.
3. A floating control panel labeled **YT Bulk Playlist** will appear on the right side of the window.
4. Use the control panel to select videos matching your criteria (e.g., enter `tutorial` in Title contains, or set Min duration to `10` minutes).
5. Click **Remove Selected** or **Add/Move to Playlist** to perform bulk operations.
   - *Note*: The extension automates actions by simulating clicks on YouTube's menu interface, so keep the page active while it processes.
6. If you close the panel, you can reopen it anytime by clicking the floating blue **YT** button in the bottom-right corner.

---

## Project Structure

```
├── manifest.json       # Manifest V3 extension configuration
├── content.js         # Content script injected into YouTube playlist pages
├── icons/
│   └── icon128.png     # Extension icon (128x128px)
├── popup.jpg           # Extension screenshot/preview
└── yt manager extension.jpg # Extension banner/screenshot
```

## How It Works

- **Manifest V3**: The extension is built on the modern Manifest V3 standard.
- **Content Script Integration**: The logic runs entirely within the context of the page (`content.js`), matching urls containing `https://www.youtube.com/playlist*`.
- **Event Handling**: Interaction with checkboxes has event propagation controls to prevent clicking checkboxes from launching video playback.

## Privacy & Security

- **Local Execution**: The extension runs entirely in your local browser environment.
- **No Third-Party Tracking**: It does not collect, store, or transmit any user data. All operations happen directly on your device.
