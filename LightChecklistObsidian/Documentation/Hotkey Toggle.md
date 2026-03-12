# Hotkey Toggle

Allows the user to bind a global keyboard shortcut that shows/hides the checklist window from anywhere on the system.

## How It Works
- In [[Settings Architecture]], the `hotkey` field stores an Electron accelerator string (e.g. `CommandOrControl+Shift+C`).
- On app startup, `main.js` reads the stored hotkey and registers it via `globalShortcut`.
- Pressing the hotkey while the window is visible hides it; pressing it again restores and focuses it.
- Registering a new hotkey automatically unregisters the previous one.

## UI (Settings Panel)
- **Hotkey button**: Click to enter "listening" mode (pulsing border animation). Press any modifier+key combo to bind it.
- **Clear (✕) button**: Removes the current hotkey binding.
- The button displays the active accelerator string in accent color when a hotkey is set.

## Platform Compatibility
- `Ctrl` (Windows/Linux) and `Cmd` (macOS) are both captured as `CommandOrControl`, which Electron resolves per-platform.
- `Alt` and `Shift` modifiers are supported.
- Single-key (no modifier) shortcuts are rejected to avoid capturing regular typing.

## Files Modified
- `main.js` — `registerHotkey()`, `set-hotkey` IPC handler, `globalShortcut` import.
- `preload.js` — `setHotkey` bridge.
- `src/index.html` — hotkey row in settings panel.
- `src/app.js` — `acceleratorFromEvent()`, capture/clear logic, `updateHotkeyDisplay()`.
- `src/styles.css` — `.hotkey-btn`, `.hotkey-clear-btn`, `.hotkey-row` styles.
