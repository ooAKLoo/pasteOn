const { BrowserWindow } = require('electron');
const path = require('path');

module.exports = function createHistoryWindow() {
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width } = primaryDisplay.workAreaSize;

    historyWindow = new BrowserWindow({
        width: 500, // 窗口宽度
        height: 200, // 窗口高度
        x: (width - 500) / 2, // 居中位置
        y: 0, // 窗口的纵坐标
        alwaysOnTop: true, // 窗口置顶
        frame: false, // 无边框窗口
        transparent: false,  // 设置窗口透明
        skipTaskbar: true, // 不在任务栏显示
        focusable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        show: false // 初始不显示
    });

    historyWindow.loadFile(path.join(__dirname, '../history.html'));

    historyWindow.on('closed', () => {
        historyWindow = null;
    });

    return historyWindow
}
