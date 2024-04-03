// preload.js
const { contextBridge, ipcRenderer, clipboard } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    readClipboardText: () => clipboard.readText(),
    writeClipboardText: (text) => clipboard.writeText(text),
    ipcRenderer: {
        send: ipcRenderer.send.bind(ipcRenderer),
        // 在preload.js中，修改`on`方法来记录参数
        on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => {
            func(...args);
        }),
        removeListener: (channel, func) => ipcRenderer.removeListener(channel, func),
        removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    },
    platform: process.platform
});