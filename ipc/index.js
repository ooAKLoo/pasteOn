const { ipcMain, clipboard } = require('electron');

module.exports = function setupIpcMainHandlers(mainWindow, historyWindow, socket) {
    ipcMain.on('show-history-window', () => {
        if (historyWindow) {
            historyWindow.show();
        }
    });

    ipcMain.on('hide-history-window', () => {
        if (historyWindow) {
            historyWindow.hide();
        }
    });

    ipcMain.on('send-clipboard-history', (event, clipboardHistory) => {
        if (historyWindow) {
            historyWindow.webContents.send('display-clipboard-history', clipboardHistory);
        }
    });


    ipcMain.on('copy-from-history', (event, text) => {
        clipboard.writeText(text);
        mainWindow.webContents.send('copy-from-history', text);
    });

    ipcMain.on('navigate-history', (event, direction) => {
        if (historyWindow && historyWindow.isVisible()) {
            historyWindow.webContents.send('navigate-history', direction);
        }
    });

    ipcMain.on('broadcast-clipboard', (event, trimmedText) => {
        console.log("'broadcast-clipboard'")
        if (socket && socket.connected) {
            socket.emit('clipboard-change', trimmedText);
        }
    });
};
