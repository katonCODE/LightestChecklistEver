# App Optimization for Long-term Background Run

The goal is to shift the app's focus from disk size optimization to runtime efficiency for long-term 24/7 background use, addressing CPU and RAM footprint.

## Summary of Changes
- **Power Efficiency**: Hardware Acceleration was disabled via `app.disableHardwareAcceleration()` to minimize GPU footprint.
- **Background Throttling**: Memory saving by keeping `backgroundThrottling: true` explicitly defined.
- **Process Bloat**: Prevented loading default menus in production using `Menu.setApplicationMenu(null)`.
- **Garbage Collection**: Enabled V8 GC via `--expose_gc`. When the app window hides, `global.gc()` is invoked across the main process, and an injected `window.gc()` command targets the renderer's V8 engine.
- **Listeners Cleanup**: The `BrowserWindow` instance is correctly nullified in `mainWindow.on('closed')`.
- **Concurrency Guard**: A single-instance lock ensures multiple app instances automatically forward focus to the primary session instead of stacking node processes.
- **CSS Rendering**: Removed `backdrop-filter` which causes huge CPU overhead (energy spikes) given Hardware Acceleration is disabled.
