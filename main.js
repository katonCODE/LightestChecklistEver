const { app, BrowserWindow, ipcMain, dialog, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// Save file in the user's Documents folder so it's easily portable/synced to cloud drives
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function getSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }
  } catch (e) { console.error(e); }
  return { dataPath: path.join(app.getPath('documents'), 'LightChecklist.json'), accentColor: '#bb86fc', backgroundColor: '#1e1e24', tickToBottom: false, tickDivider: false, hotkey: null };
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
      nodeIntegration: false
    }
  });

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.loadFile('src/index.html');
}

function registerHotkey(accelerator) {
  globalShortcut.unregisterAll();
  if (!accelerator) return;
  globalShortcut.register(accelerator, () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  if (settings.hotkey) registerHotkey(settings.hotkey);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

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
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  return settings;
});

ipcMain.handle('load-data', () => {
  try {
    if (fs.existsSync(settings.dataPath)) {
      return JSON.parse(fs.readFileSync(settings.dataPath, 'utf-8'));
    }
  } catch (error) { console.error('Failed to load data', error); }
  return [];
});

ipcMain.handle('save-data', (event, data) => {
  try {
    fs.writeFileSync(settings.dataPath, JSON.stringify(data, null, 2));
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
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  registerHotkey(settings.hotkey);
  return settings.hotkey;
});
