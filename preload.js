// preload.js
const { contextBridge, ipcRenderer, clipboard } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    readClipboardText: () => clipboard.readText(),
    writeClipboardText: (text) => clipboard.writeText(text),
    ipcRenderer: {
        send: ipcRenderer.send.bind(ipcRenderer),
        on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
        removeListener: (channel, func) => ipcRenderer.removeListener(channel, func),
    },
    platform: process.platform
});
