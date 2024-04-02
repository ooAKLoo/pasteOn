const { BrowserWindow,app } = require('electron');
const path = require('path');

module.exports = function createWindow() {
    // 创建浏览器窗口
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, '../public/assets/appIcon.png') // 图标路径
    });

    // 并且为你的应用加载index.html
    mainWindow.loadFile(path.join(__dirname, '../index.html'));

    // 当窗口关闭时隐藏而不是关闭
    mainWindow.on('close', function (event) {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    // // 打开开发者工具
    // mainWindow.webContents.openDevTools();

    return mainWindow
}