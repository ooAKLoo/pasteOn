const bonjour = require('bonjour')();
const io = require('socket.io-client');

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
          const serverProcess = spawn('node', ['server.js'], { stdio: 'inherit' });
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
    socket.on('clipboard-change', (data) => {
      console.log('Clipboard updated with:', data);
      clipboard.writeText(data);
    });
    // 可以在这里添加其他 socket 事件监听器
  }