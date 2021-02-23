const content = require('fs').readFileSync(__dirname + '/index.html', 'utf8');

const httpServer = require('http').createServer((req, res) => {
  // serve the index.html file
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(content));
  res.end(content);
});

const io = require('socket.io')(httpServer);

io.on('connection', socket => {
    console.log('connect');

    let counter = 0;
    setInterval(() => {
      socket.emit('server_data', ++counter);
    }, 1000);

    socket.on('client_data', data => {
        console.log('CLIENT DATA: ', data);
    });
});

httpServer.listen(3000, () => {
  console.log('go to http://localhost:3000');
});