# LightestChecklistEver

Creating the lightest, least resource-intensive checklist tool possible. Aimed to be usable on both Windows and Mac. 

This app is supposed to test the efficiency / strength of AntiGravity while solving an issue I have.

Built primarily on **Electron** to leverage native OS window management to keep the window "always on top", while using a frameless, transparent glassmorphism UI.

## Features

- **Always on Top:** The checklist stays above other windows for easy access.
- **Frameless Glassmorphism UI:** Sleek, lightweight, and modern aesthetic.
- **Custom Window Resizing:** Omni-directional resizing algorithms for the frameless transparent window.
- **Global Hotkey Toggle:** Bind a custom keyboard shortcut to instantly show or hide the checklist from anywhere.
- **Task Sorting:** Manually reorder tasks with an optimized drag-and-drop system.
- **Task Completion Behaviour:** Configurable options to automatically move completed tasks to the bottom and display a divider.
- **Customizable Settings:** Personalize the accent color, background color, storage path, and more. Data is saved in a simple local JSON file.

## ⚠️ Security Notes (Unsigned Build)
Because this app is independently developed and not "signed" with paid developer certificates, your computer may warn you during installation:

- **Windows:** Click "More info" and then "Run anyway."
- **macOS:** After installing the app, open the terminal and run this: `xattr -d com.apple.quarantine /Applications/LightestChecklistEver.app`

## Documentation
For architecture details, refer to the Obsidian vault located in `LightChecklistObsidian/Documentation/`.
