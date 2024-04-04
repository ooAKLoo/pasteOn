const { app, BrowserWindow } = require('electron');
const { setupSocket } = require('./socket/setup');
const createMainWindow = require('./windows/mainWindow');
const createHistoryWindow = require('./windows/historyWindow');
const setupIpcMainHandlers = require('./ipc');
const setupGlobalShortcuts = require('./shortcuts');
const createMenu = require('./others/menu');
const createTrayIcon = require('./others/tray');
let mainWindow;
let historyWindow;

let socket;

app.whenReady().then(() => {
  mainWindow = createMainWindow();
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('connection-status', '服务器配置中...');
    setupSocket(mainWindow).then((createdSocket)  => {
      socket = createdSocket;
      historyWindow = createHistoryWindow();
      setupIpcMainHandlers(mainWindow, historyWindow, socket);
      setupGlobalShortcuts(historyWindow, mainWindow);
      createMenu(mainWindow);
      createTrayIcon(mainWindow);
    }).catch((error) => {
      // 错误处理逻辑
      console.error(error);
    });;
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});