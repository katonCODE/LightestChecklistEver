# Architecture Overview

The Lightest Checklist Ever app is built primarily on [[Electron]] to leverage the native OS window management—specifically, keeping the window "always on top".

## Core Components
- **Backend (main.js)**: Configures the frameless window, transparent background, and listens for IPC events for file storage and opacity.
- **Frontend**: Lightweight HTML, CSS (for glassmorphism), and JS. Includes an adjustable opacity slider.
- **Storage**: Tasks are saved to a user-defined `.json` file (`LightChecklist.json` by default). Settings are stored in `settings.json`. [[Settings Architecture]]
- **Resizing Algorithm**: A math-based dragging implementation for frameless resizing. [[Custom Window Resizing]]
- **Settings**: Dynamic accent color and storage path configuration via a ⚙️ toggle.
