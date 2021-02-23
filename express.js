const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
const port = 3000;
const io = require('socket.io')(httpServer);

app.get('/', (req, res) => {
  res.send('Hello World!')
});
app.get('/users', (req, res) => {
    res.send('Random event!')
    io.emit('hello', "Users");
});

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

httpServer.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})