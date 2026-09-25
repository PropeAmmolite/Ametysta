const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    minimize: () => ipcRenderer.send('minimize'),
    toggleMaximize: () => ipcRenderer.send('maximize'),
    close: () => ipcRenderer.send('close')
});