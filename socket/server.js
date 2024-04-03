
const bonjour = require('bonjour')();
const http = require('http');
const server = http.createServer();
const { Server } = require("socket.io");
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('clipboard-change', (data) => {
    console.log('Clipboard data received:', data);
    socket.broadcast.emit('clipboard-change', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // 广播 Socket.IO 服务
  bonjour.publish({ name: 'My Socket.IO Service', type: 'http', port: PORT });
});
