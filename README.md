# Nudge - Browser Extension

## The extension uses the Chrome Extensions Manifest V3 architecture.

## Service Worker (background.js): 
This script runs silently in the background. It manages all timers, alarms, and notification triggers, ensuring they work even when the extension popup is closed.

## Popup (popup.html & popup.js): 
The user interface. It communicates with the background script to start/stop timers and syncs the current state (like remaining time) whenever opened.

##Storage (chrome.storage.local): 
All user data (water count, settings, medicine list) is stored locally on the user's device, ensuring privacy and offline functionality.

## Installation
Since this project is not currently on the Chrome Web Store, you can install it locally in "Developer Mode."

##Steps:
- Download: Download this repository as a ZIP file and unzip it, or clone it using git:
- git clone https://github.com/YOUR_USERNAME/Nudge-Extension.git
- Open Extensions: Open your Chrome or Brave browser and navigate to:
- chrome://extensions
- Enable Developer Mode: Toggle the "Developer mode" switch in the top-right corner to ON.
- Load the Extension: Click the "Load unpacked" button (top-left).
- Select Folder: Select the unzipped project folder (the one containing manifest.json).
- Pin It: Click the puzzle piece icon in your browser toolbar and pin "Nudge" for easy access.

## Built With
- HTML5 - Structure
- CSS3 - Styling (Dark Theme, Animations)
- JavaScript (ES6) - Logic
- Chrome Extensions API - Alarms, Notifications, Storage

## License
- MIT License
