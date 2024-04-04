// setupSocket.js
const { spawn } = require('child_process')
const bonjour = require('bonjour')();
const io = require('socket.io-client');
let socket;

function setupSocket(mainWindow) {
  return new Promise((resolve, reject) => {
    const browser = bonjour.find({ type: 'http' }, (service) => {
      mainWindow.webContents.send('connection-status', '服务器配置中...');
      if (service.name === 'My Socket') {
        const url = `http://${service.referer.address}:${service.port}`;
        socket = io(url);

        socket.on('connect', () => {
          mainWindow.webContents.send('connection-status', '连接到服务器成功');
          setupSocketListeners(socket, mainWindow);
          resolve(socket);
        });

        socket.on('connect_error', () => {
          mainWindow.webContents.send('connection-status', '连接到服务器失败');
          reject(new Error('连接到服务器失败'));
        });
      }
    });

    setTimeout(() => {
      if (!socket) {
        const serverProcess = spawn('node', [`${__dirname}/server.js`], { stdio: 'inherit' });

        serverProcess.on('close', (code) => {
          if (code !== 0) {
            reject(new Error('本地服务器启动失败。'));
          }
        });

        setTimeout(() => {
          socket = io('http://localhost:3000');

          socket.on('connect', () => {
            mainWindow.webContents.send('connection-status', '连接到服务器成功');
            setupSocketListeners(socket, mainWindow);
            resolve(socket);
          });

          socket.on('connect_error', () => {
            mainWindow.webContents.send('connection-status', '连接到服务器失败');
            reject(new Error('连接到服务器失败'));
          });
        }, 1000); // 假设服务端启动需要一定时间
      }
    }, 5000); // 等待5秒以检查服务端是否存在
  });
}



function setupSocketListeners(socket,mainWindow) {
  // 移除旧的监听器，避免重复
  socket.off('clipboard-update');

  // 添加新的监听器
  socket.on('clipboard-update', (data) => {
    mainWindow.webContents.send('ipc-clipboard-update', data);
  });
}


module.exports = { setupSocket };
