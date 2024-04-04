const { globalShortcut, ipcMain, app } = require('electron');

let lastVPressTime = 0;
const doublePressInterval = 500; // ms, 连续按键识别的时间间隔


module.exports = function setupGlobalShortcuts(historyWindow, mainWindow) {
    // 这个快捷键触发IPC事件来显示历史窗口
    globalShortcut.register('CommandOrControl+Shift+C', () => {
        ipcMain.emit('show-history-window');
        mainWindow.webContents.send('request-clipboard-history');
    });

    // 这些快捷键用于导航历史记录
    globalShortcut.register('CommandOrControl+Shift+Up', () => {
        if (historyWindow && historyWindow.isVisible()) {
            historyWindow.webContents.send('navigate-history', 'up');
        }
    });

    globalShortcut.register('CommandOrControl+Shift+Down', () => {
        if (historyWindow && historyWindow.isVisible()) {
            historyWindow.webContents.send('navigate-history', 'down');
        }
    });

    // 注销快捷键（当应用将要退出时）
    app.on('will-quit', () => {
        globalShortcut.unregisterAll();
    });
};
