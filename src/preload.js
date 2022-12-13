'use sctrict';

const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
    openDialog: () => ipcRenderer.invoke('open-dialog'),
});

contextBridge.exposeInMainWorld('myAPI2', {
    dragFile: (dorop_file_pathj) => ipcRenderer.invoke('drag-file', dorop_file_pathj),
});
