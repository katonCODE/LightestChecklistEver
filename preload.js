const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setOpacity: (opacity) => ipcRenderer.invoke('set-opacity', opacity),
  loadData: () => ipcRenderer.invoke('load-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  closeApp: () => ipcRenderer.invoke('close-app'),
  minimizeApp: () => ipcRenderer.invoke('minimize-app'),
  setBounds: (bounds) => ipcRenderer.invoke('set-bounds', bounds),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  selectFile: () => ipcRenderer.invoke('select-file'),
  setHotkey: (accelerator) => ipcRenderer.invoke('set-hotkey', accelerator),
  setAlwaysOnTop: (level) => ipcRenderer.invoke('set-always-on-top', level)
});
