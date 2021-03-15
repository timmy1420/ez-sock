const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
const port = 5001;
const io = require('socket.io')(httpServer);

// App setting
const logging = true;

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/event_api', (req, res) => {
    const { event, message, channel } = req.body;
    if ( logging ) console.log('API Body: ', req.body);

    if ( event == '') {
      res.send({
        'message': "event cannot be empty",
        'success': true
      });
      return;
    }

    if ( channel ) {
        io.sockets.in(channel).emit( event , message);
        res.send({
          'message': 'Message sent to channel!',
          'success': true
        });
    } else {
        res.send({
          'message': 'Message sent without channel!',
          'success': true
        });
    }
});

// handle incoming connections from clients
io.sockets.on('connection', function(socket) {
    console.log('connect');
    // once a client has connected, we expect to get a ping from them saying what room they want to join
    socket.on('join_channel', function(channel) {
      socket.join(channel);
  
      console.log("Incoming channel: " + channel);
      io.sockets.in(channel).emit('server_data', `Server ready for channel: ${channel}`);
    });

    socket.on('leave_channel', function(channel) {
      socket.leave(channel);
  
      console.log("Leaving channel: " + channel);
    });

    socket.on("disconnect", (reason) => {
      console.log("DISCONNECT");
    });
});

httpServer.listen(port, () => {
  console.log(`Example app listening at http://ip_addr:${port}`)
});
