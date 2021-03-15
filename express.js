const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
const port = 3000;
const io = require('socket.io')(httpServer);

// App setting
const logging = true;

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/event_api', (req, res) => {
    const { event, message, channel } = req.body;
    if ( logging ) console.log('API Body: ', req.body);

    if ( channel ) {
        io.sockets.in(channel).emit('server_data', message);
        res.send('Message sent to channel!');
    } else {
        res.send('Message sent without channel!');
    }
});

// handle incoming connections from clients
io.sockets.on('connection', function(socket) {
    console.log('connect');
    // once a client has connected, we expect to get a ping from them saying what room they want to join
    socket.on('channel', function(channel) {
      socket.join(channel);
  
      console.log("Incoming channel: " + channel);
      io.sockets.in(channel).emit('server_data', `Server ready for channel: ${channel}`);
    });

    // console.log("All sockets:", io.sockets);
});

httpServer.listen(port, () => {
  console.log(`Example app listening at http://ip_addr:${port}`)
});
