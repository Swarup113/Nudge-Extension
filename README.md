# Nudge – Desktop Health Companion (Browser Extension)

### *A lightweight Chrome extension that keeps you healthy while you work*

Nudge helps you track water intake, manage medication reminders, follow the Pomodoro technique, practice eye care, maintain good posture, and reduce stress – all from your browser. Built with Manifest V3, it works silently in the background and notifies you even when the popup is closed.

---

## Live Demo

The extension is not yet on the Chrome Web Store, but you can install it locally in Developer Mode (see [Installation](#installation) below).  
Source code: [https://github.com/swarup113/Nudge](https://github.com/swarup113/Nudge) *(update with your actual repo link)*

---

## Overview

| Aspect | Description |
|--------|-------------|
| Architecture | Chrome Extensions Manifest V3 |
| Core Components | Service Worker (background.js), Popup UI (popup.html / popup.js), Storage (chrome.storage.local) |
| Purpose | Counter the negative effects of prolonged screen use with smart reminders and wellness tools. |
| Data Privacy | All data stays on your device – no external servers. |
| Offline Support | Works fully offline after installation. |

---

## Features

| Feature | Description |
|---------|-------------|
| Daily Dashboard | Visual progress ring for water + focus sessions. Quick action buttons for logging water or starting a Pomodoro. |
| Pomodoro Timer | 25‑minute focus sessions. Runs in background via Chrome Alarms API – notifies you even if popup is closed. Tracks daily completed sessions. |
| Hydration Tracker | Log water intake (+/‑ buttons, goal: 8 glasses/day). Set custom reminder intervals (30m, 1h, 1.5h, 2h). Daily history with timestamps. |
| Medicine Reminder | Create recurring schedules (daily, twice daily, weekly). Time‑based notifications at exact times you set. |
| Eye Care (Strain Prevention) | 20‑20‑20 Rule reminder every 20 minutes. Blink reminder every 10 minutes (counters 66% blink reduction). |
| Posture & Movement | Posture check reminders (default 15m). Stand up alert (default 30m). Desk stretches suggestions. |
| Quick Alarm | One‑off timers with custom labels (e.g., “Check oven in 10 mins”). |
| Box Breathing | Interactive visual guide for 4‑4‑4‑4 breathing technique. Animated circle guides inhale, hold, and exhale. |

---

## How It Works (Architecture)

| Component | Role |
|-----------|------|
| **Service Worker (background.js)** | Runs silently in the background. Manages all timers, alarms, and notification triggers. Ensures functionality even when the extension popup is closed. |
| **Popup (popup.html / popup.js)** | User interface. Communicates with the background script to start/stop timers and syncs the current state (e.g., remaining time) whenever opened. |
| **Storage (chrome.storage.local)** | Stores all user data (water count, settings, medicine list) locally on the device. Ensures privacy and offline functionality. |

---

## Installation

Since this project is not currently on the Chrome Web Store, you can install it locally in **Developer Mode**.

| Step | Action |
|------|--------|
| 1 | Download this repository as a ZIP file and unzip it, or clone it using `git clone https://github.com/swarup113/Nudge.git` |
| 2 | Open Chrome or Brave browser and navigate to `chrome://extensions` |
| 3 | Toggle **Developer mode** switch in the top‑right corner to **ON** |
| 4 | Click the **Load unpacked** button (top‑left) |
| 5 | Select the unzipped project folder (the one containing `manifest.json`) |
| 6 | Click the puzzle piece icon in the browser toolbar and pin **Nudge** for easy access |

> The extension is now installed and will run automatically. Allow notification permissions when prompted.

---

## Tech Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Structure of the popup interface. |
| CSS3 | Styling (dark theme, animations, responsive layout). |
| JavaScript (ES6) | Core logic, state management, UI updates. |
| Chrome Extensions API | Alarms API (background timers), Notifications API (desktop alerts), Storage API (local data persistence). |
| Manifest V3 | Modern extension architecture. |

---

## License

MIT License.
