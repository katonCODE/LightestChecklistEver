# Settings Architecture

The application now supports user-configurable settings stored in `settings.json` within the system's `userData` folder.

## Configurable Options
- **dataPath**: The absolute path to the checklist storage file (`.json`).
- **accentColor**: The hex code for the application's primary accent color.
- **backgroundColor**: The hex code for the main window background (applied with glassmorphism).
- **tickToBottom**: Move completed tasks to the bottom of the list.
- **tickDivider**: Show a visual divider between active and completed tasks.
- **hotkey**: Electron accelerator string for the global toggle shortcut (e.g. `CommandOrControl+Shift+C`). `null` if unset. See [[Hotkey Toggle]].

## Implementation Details
- **Backend**: `main.js` manages the loading and saving of the settings file. It provides IPC handlers for the frontend to access and update these values.
- **Frontend**: `app.js` applies settings on initialization by updating CSS variables and UI inputs.
- **Dynamic Pathing**: When the storage path is changed, the backend immediately switches the target file for all subsequent read/write operations.
