const net = require('net');

const LISTEN_PORT = 27018;
const TARGET_PORT = 27017;
const HOST = '127.0.0.1';

const server = net.createServer((socket) => {
  const target = net.connect(TARGET_PORT, HOST);
  socket.pipe(target).pipe(socket);

  target.on('error', (err) => {
    socket.destroy();
  });
  socket.on('error', (err) => {
    target.destroy();
  });
});

server.listen(LISTEN_PORT, HOST, () => {
  console.log(`Port proxy active: mongodb://127.0.0.1:${LISTEN_PORT} -> 127.0.0.1:${TARGET_PORT}`);
});

process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());
