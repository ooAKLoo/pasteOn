// setupSocket.js
const { spawn } = require('child_process')
const bonjour = require('bonjour')();
const io = require('socket.io-client');
const fs = require('fs'); // 引入fs模块来检查文件是否存在
const path = require('path');
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

        socket.on('connect_error', (error) => {
          mainWindow.webContents.send('connection-status', `连接到服务器失败: ${error.message}`); // 将错误信息发送到渲染器进程
          reject(error);
        });
      }
    });

    setTimeout(() => {
      if (!socket) {
          const serverExecutablePath = path.join(process.resourcesPath, 'server', 'server');
          const serverProcess = spawn(serverExecutablePath, [], { stdio: 'inherit' });

          serverProcess.on('close', (code) => {
            if (code !== 0) {
              mainWindow.webContents.send('connection-status', `本地服务器启动失败。退出码: ${code}`);
              reject(new Error(`本地服务器启动失败。退出码: ${code}`));
            }
          });
          
          setTimeout(() => {
            socket = io('http://localhost:3000');

            socket.on('connect', () => {
              mainWindow.webContents.send('connection-status', '连接到服务器成功');
              setupSocketListeners(socket, mainWindow);
              resolve(socket);
            });

            socket.on('connect_error', (error) => {
              mainWindow.webContents.send('connection-status', `连接到服务器失败: ${error.message}`); // 将错误信息发送到渲染器进程
              reject(error);
            });
          }, 1000);

      }
    }, 5000);
  });
}



function setupSocketListeners(socket, mainWindow) {
  // 移除旧的监听器，避免重复
  socket.off('clipboard-update');

  // 添加新的监听器
  socket.on('clipboard-update', (data) => {
    mainWindow.webContents.send('ipc-clipboard-update', data);
  });
}


module.exports = { setupSocket };
