'use strict';

const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
    dragFile: (data) => ipcRenderer.invoke('data-transfer', data),
});
