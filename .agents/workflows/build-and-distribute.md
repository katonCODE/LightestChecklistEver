# Build & Distribute — Mac + Windows
---
description: How to package and distribute LightestChecklistEver as a native app for macOS and Windows
---

## Prerequisites
- Node.js installed on both machines
- A Mac for building the .dmg (Apple requires this — you cannot build Mac apps on Windows)
- The repo cloned/synced to both machines (OneDrive works fine)

---

## Step 1: Install electron-builder
// turbo
Run on both machines:
```
npm install --save-dev electron-builder
```

---

## Step 2: Add Build Config to package.json
Edit `package.json` to add the `build` block and `dist` scripts (see the package.json in this repo — it is already configured).

---

## Step 3: Create App Icons
You need two icon files:
- `build/icon.icns` → Mac (512x512 .icns format)
- `build/icon.ico` → Windows (256x256 .ico format)

Use https://www.electron.build/icons or https://cloudconvert.com to convert a single PNG.
Place both in the `build/` folder at the project root.

---

## Step 4: Build for Windows (run on Windows machine)
// turbo
```
npm run dist:win
```
Output: `dist/LightestChecklistEver Setup.exe`

---

## Step 5: Build for Mac (run on your MacBook)
Pull the latest code onto your Mac (via OneDrive or git), then:
```
npm install
npm run dist:mac
```
Output: `dist/LightestChecklistEver.dmg`

---

## Step 6: Install & Test
- **Windows**: Run the `.exe` installer. App appears in Start Menu. Pin to taskbar manually.
- **Mac**: Open the `.dmg`, drag the app to Applications. Launch it — it appears in the Dock. Right-click Dock icon → "Options → Keep in Dock".

---

## Step 7: Enable Auto-Launch on Login (Optional)
The app already has `app.setLoginItemSettings` wired up in `main.js`.
To toggle it, expose a setting in the UI that calls this IPC handler.

---

## Notes
- Mac builds MUST be done on a Mac. Apple enforces this.
- Code signing (for distributing publicly) requires an Apple Developer account ($99/yr). For personal use, users just right-click → Open to bypass Gatekeeper.
- The `promptToCreate` dialog flag is Windows-only and is safely ignored on Mac.
