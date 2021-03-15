const content = require('fs').readFileSync(__dirname + '/index.html', 'utf8');

const httpServer = require('http').createServer((req, res) => {
  // serve the index.html file
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(content));
  res.end(content);
});

const io = require('socket.io')(httpServer);

// handle incoming connections from clients
io.sockets.on('connection', function(socket) {
  console.log('connect');
  // once a client has connected, we expect to get a ping from them saying what room they want to join
  socket.on('channel', function(channel) {
    socket.join(channel);

    console.log("Incoming channel: " + channel);
  });
});

// now, it's easy to send a message to just the clients in a given room
var channel = "abc123",
    counter = 0;

setInterval(() => {
  console.log("Sending data to: " + channel);
  io.sockets.in(channel).emit('server_data', ++counter);
}, 1000);

httpServer.listen(3000, () => {
  console.log('go to http://localhost:3000');
});
