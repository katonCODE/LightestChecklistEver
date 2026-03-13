# MacOS Window Level Management

To support native MacOS UI elements like the `<input type="color">` color picker, the application dynamically adjusts its `alwaysOnTop` window level. 

By default, the application runs at the `screen-saver` level to remain visible over fullscreen applications. However, MacOS floating panels (like `NSColorPanel`) render beneath this level. 

To resolve this, the window level is downgraded to `floating` when the Settings view is opened, allowing native popups to appear above the app. When the user returns to the checklist, the application restores its `screen-saver` level.

### Fullscreen Apps
MacOS places fullscreen apps in their own separate workspaces. To allow the app to float over these, the user can toggle the "Always on top of fullscreen apps (Mac)" setting. Under the hood, this invokes Electron's `setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })`.

Related: [[Settings Architecture]], [[Architecture Overview]]
