const { app,BrowserWindow } = require('electron');
const { spawn } = require('child_process')
const bonjour = require('bonjour')();
const io = require('socket.io-client');
const createMainWindow = require('./windows/mainWindow');
const createHistoryWindow = require('./windows/historyWindow');
const setupIpcMainHandlers = require('./ipc');
const setupGlobalShortcuts = require('./shortcuts');
const createMenu = require('./others/menu');
const createTrayIcon = require('./others/tray');
let mainWindow;
let historyWindow; // 声明一个变量用于保存历史窗口

let socket;

function setupSocket() {
  return new Promise((resolve, reject) => {
    const browser = bonjour.find({ type: 'http' }, (service) => {
      if (service.name === 'My Socket') {
        const url = `http://${service.referer.address}:${service.port}`;
        console.log(`Connecting to ${url}`);
        socket = io(url);

        // 在这里调用 setupSocketListeners()
        setupSocketListeners();
        resolve();
      }
    });

    setTimeout(() => {
      if (!socket || !socket.connected) {
        console.log('No server found, starting own server...');
        const serverProcess = spawn('node', ['./socket/server.js'], { stdio: 'inherit' });
        serverProcess.on('close', (code) => {
          console.log(`server.js process exited with code ${code}`);
        });

        setTimeout(() => {
          socket = io('http://localhost:3000');
          setupSocketListeners();
          resolve();
        }, 1000); // 假设服务端启动需要一定时间
      }
    }, 5000); // 等待5秒以检查服务端是否存在
  });
}


function setupSocketListeners() {
  // 移除旧的监听器，避免重复
  socket.off('clipboard-update');

  // 添加新的监听器
  socket.on('clipboard-update', (data) => {
    mainWindow.webContents.send('clipboard-update', data);
  });
}


// Electron 完成初始化并准备创建浏览器窗口时，将调用此方法
app.whenReady().then(() => {
    setupSocket().then(() => {
    mainWindow = createMainWindow();
    historyWindow = createHistoryWindow();// 创建历史窗口但不显示
    setupIpcMainHandlers(mainWindow, historyWindow,socket);
    setupGlobalShortcuts(historyWindow,mainWindow);
    createMenu(mainWindow);
    createTrayIcon(mainWindow);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
});

// 当所有窗口都关闭时退出
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});