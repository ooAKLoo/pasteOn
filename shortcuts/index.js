const { globalShortcut, ipcMain, app } = require('electron');

let lastVPressTime = 0;
const doublePressInterval = 500; // ms, 连续按键识别的时间间隔


module.exports = function setupGlobalShortcuts(historyWindow, mainWindow) {
    // 这个快捷键触发IPC事件来显示历史窗口
    globalShortcut.register('CommandOrControl+Shift+C', () => {
        ipcMain.emit('show-history-window'); // 确保已在setupIpcMainHandlers中设置了对应的监听器
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

    // 注册一个全局快捷键用于检测V键
    globalShortcut.register('V', () => {
        const now = Date.now();
        if (now - lastVPressTime < doublePressInterval) {
            // 执行双击V后的操作
            if (historyWindow.isVisible()) {
                // 隐藏历史窗口
                historyWindow.hide();
                // 将当前选中的历史记录复制到剪贴板，并尝试粘贴
                const selectedText = clipboardHistory[currentIndex]; // 确保你有一个方法来获取这个值
                console.log("selectedText=",selectedText)
                clipboard.writeText(selectedText);
                // 这里需要额外的逻辑来模拟粘贴操作，因为直接粘贴到光标处需要前端支持
            }
        }
        lastVPressTime = now;
    });

    // 注销快捷键（当应用将要退出时）
    app.on('will-quit', () => {
        globalShortcut.unregisterAll();
    });
};
