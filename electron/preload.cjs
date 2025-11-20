const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  readDir: (path) => ipcRenderer.invoke('read-dir', path),
  showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path)
});