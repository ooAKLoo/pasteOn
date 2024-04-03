const { BrowserWindow,app } = require('electron');
const path = require('path');

module.exports = function createWindow() {
    // 创建浏览器窗口
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, '../src/assets/appIcon.png') // 图标路径
    });

    // 并且为你的应用加载index.html
    const startURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5173' // Vite dev server
    : `file://${path.join(__dirname, '../index.html')}`;

    mainWindow.loadURL(startURL);

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