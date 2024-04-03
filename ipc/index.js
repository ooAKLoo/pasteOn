const { ipcMain, clipboard } = require('electron');

module.exports = function setupIpcMainHandlers(mainWindow, historyWindow,socket) {
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
        console.log("234234234234-----------------")
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

    ipcMain.on('broadcast-clipboard', (event, trimmedText) => {
        if (socket && socket.connected) {
          const timestamp = new Date().toISOString(); // 获取当前时间的ISO字符串
          console.log(`[${timestamp}] broadcast-clipboard系统更新:`, trimmedText);
          socket.emit('clipboard-change', trimmedText);
        }
      });
};
