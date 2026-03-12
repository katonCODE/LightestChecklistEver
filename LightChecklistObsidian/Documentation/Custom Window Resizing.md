# Custom Window Resizing
Because the app relies on a frameless, transparent window (`transparent: true` and `frame: false` in Electron), native border resizing handles are suppressed by the OS.

To restore this functionality with **Omni-Directional** support while maintaining the elegant aesthetic:
1. **Frontend Logic:** 8 invisible `div` containers line the edges/corners of the window (`src/index.html` & `src/styles.css`).
2. **Bounds Algorithm:** When dragged, standard `screenX` and `screenY` coordinate math calculates the necessary width, height, and XY movement translations.
3. **Constraints:** We mathematically restrict `newWidth` and `newHeight` to conform to precise bounds (e.g. `minWidth: 250`).
4. **Backend IPC:** Finally, we invoke a secure bridge `window.electronAPI.setBounds` to tell the Electron main process via `main.js` to natively snap the window to these new bounding box dimensions!

See [[Architecture Overview]]
