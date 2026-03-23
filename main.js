const { app, BrowserWindow, ipcMain, dialog, globalShortcut, Menu } = require('electron');
const path = require('path');
const { createStore } = require('./store');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('js-flags', '--expose_gc');

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow;

// Save file in the user's Documents folder so it's easily portable/synced to cloud drives
const settingsPath = path.join(app.getPath('userData'), 'settings.json');
const settingsStore = createStore(settingsPath);

function getSettings() {
  try {
    const data = settingsStore.load();
    if (!Array.isArray(data)) {
      return data;
    }
  } catch (e) { console.error(e); }
  return { dataPath: path.join(app.getPath('documents'), 'LightChecklist.json'), accentColor: '#bb86fc', backgroundColor: '#1e1e24', tickToBottom: false, tickDivider: false, hotkey: null, fullscreenWidget: false };
}

let settings = getSettings();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 350,
    height: 500,
    minWidth: 250,
    minHeight: 300,
    maxWidth: 600,
    maxHeight: 900,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: true
    }
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  if (settings.fullscreenWidget) {
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }
  mainWindow.loadFile('src/index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerHotkey(accelerator) {
  globalShortcut.unregisterAll();
  if (!accelerator) return;
  globalShortcut.register(accelerator, () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
      if (global.gc) global.gc();
      if (mainWindow.webContents) {
        mainWindow.webContents.executeJavaScript('if (window.gc) window.gc();').catch(() => {});
      }
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

if (gotTheLock) {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    if (app.isPackaged) {
      Menu.setApplicationMenu(null);
    }
    createWindow();
    if (settings.hotkey) registerHotkey(settings.hotkey);
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on('will-quit', () => globalShortcut.unregisterAll());

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers
ipcMain.handle('set-opacity', (event, opacity) => {
  if (mainWindow) mainWindow.setOpacity(opacity);
});

ipcMain.handle('get-settings', () => settings);

ipcMain.handle('save-settings', (event, newSettings) => {
  settings = { ...settings, ...newSettings };
  settingsStore.save(settings);
  return settings;
});

ipcMain.handle('load-data', () => {
  try {
    return createStore(settings.dataPath).load();
  } catch (error) { console.error('Failed to load data', error); }
  return [];
});

ipcMain.handle('save-data', (event, data) => {
  try {
    createStore(settings.dataPath).save(data);
    return true;
  } catch (error) {
    console.error('Failed to save data', error);
    return false;
  }
});

ipcMain.handle('select-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'promptToCreate'],
    filters: [{ name: 'JSON Files', extensions: ['json'] }]
  });
  if (!canceled) {
    return filePaths[0];
  }
  return null;
});

ipcMain.handle('close-app', () => app.quit());
ipcMain.handle('minimize-app', () => mainWindow && mainWindow.minimize());

ipcMain.handle('set-bounds', (event, bounds) => {
  if (mainWindow) mainWindow.setBounds(bounds);
});

ipcMain.handle('set-hotkey', (event, accelerator) => {
  settings.hotkey = accelerator || null;
  settingsStore.save(settings);
  registerHotkey(settings.hotkey);
  return settings.hotkey;
});

ipcMain.handle('set-always-on-top', (event, level) => {
  if (mainWindow) {
    if (level === 'normal') {
      mainWindow.setAlwaysOnTop(false);
    } else {
      mainWindow.setAlwaysOnTop(true, level);
    }
  }
});

ipcMain.handle('set-fullscreen-widget', (event, enable) => {
  if (mainWindow) {
    mainWindow.setVisibleOnAllWorkspaces(enable, { visibleOnFullScreen: enable });
  }
});
