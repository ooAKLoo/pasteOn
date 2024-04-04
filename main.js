const { app, BrowserWindow } = require('electron');
const { setupSocket } = require('./socket/setup'); // 引入setupSocket
const createMainWindow = require('./windows/mainWindow');
const createHistoryWindow = require('./windows/historyWindow');
const setupIpcMainHandlers = require('./ipc');
const setupGlobalShortcuts = require('./shortcuts');
const createMenu = require('./others/menu');
const createTrayIcon = require('./others/tray');
let mainWindow;
let historyWindow; // 声明一个变量用于保存历史窗口

let socket;



// Electron 完成初始化并准备创建浏览器窗口时，将调用此方法
app.whenReady().then(() => {
  mainWindow = createMainWindow();
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('connection-status', '服务器配置中...');
    setupSocket(mainWindow).then((createdSocket)  => {
      socket = createdSocket; // 获取解析的socket实例
      historyWindow = createHistoryWindow();// 创建历史窗口但不显示
      setupIpcMainHandlers(mainWindow, historyWindow, socket);
      setupGlobalShortcuts(historyWindow, mainWindow);
      createMenu(mainWindow);
      createTrayIcon(mainWindow);
    });
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口都关闭时退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});