const { ipcMain, clipboard } = require('electron');

module.exports = function setupIpcMainHandlers(mainWindow, historyWindow) {
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
    // main.js
    ipcMain.on('send-clipboard-history', (event, clipboardHistory) => {
        if (historyWindow) {
            historyWindow.webContents.send('display-clipboard-history', clipboardHistory);
        }
    });
    
    
    
    ipcMain.on('copy-from-history', (event, text) => {
        clipboard.writeText(text);
        mainWindow.webContents.send('copy-from-history', text);
    });
    // main.js里处理上下导航事件
    ipcMain.on('navigate-history', (event, direction) => {
        // 发送消息到historyWindow以更新显示的项目
        // 确保historyWindow存在且是可见的
        if (historyWindow && historyWindow.isVisible()) {
            historyWindow.webContents.send('navigate-history', direction);
        }
    });
};
