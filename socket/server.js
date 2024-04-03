
const bonjour = require('bonjour')();
const http = require('http');
const server = http.createServer();
const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', (socket) => {
    const clientIp = socket.request.connection.remoteAddress; // 获取客户端IP地址
    console.log(`A user connected from ${clientIp}`);
  
    // socket.on('clipboard-change', (data) => {
    //   console.log(`Clipboard data received from ${clientIp}:`, data);
    //   socket.broadcast.emit('clipboard-update', data);
    // });

    socket.on('clipboard-change', (data) => {
      console.log(`Clipboard data received from ${clientIp}:`, data);
      // 在广播的数据中包含发送者的IP地址
      const dataWithSenderIp = { data, senderIp: clientIp };
      socket.broadcast.emit('clipboard-update', dataWithSenderIp);
    });
  
    socket.on('disconnect', () => {
      console.log(`A user disconnected from ${clientIp}`);
    });
  });

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // 广播 Socket.IO 服务
  bonjour.publish({ name: 'My Socket.IO Service', type: 'http', port: PORT });
});
