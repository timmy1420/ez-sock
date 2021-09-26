const express = require('express');
const app = express();
const httpServer = require('http').Server(app);
const port = 5001;
const io = require('socket.io')(httpServer, {
  cors: {
    origin: '*'
  }
});

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

/**
 * Verify if there are clients in a channel
 */
app.post('/channel_clients', (req, res) => {
  /**
   * TODO: Create an array for channels.
   * Also send array results for all passed channels
   */
  const { channel } = req.body;
  if ( logging ) console.log('API Body: ', req.body);
  
  if ( channel ) {
    var clients = [];

    if ( typeof channel === 'object' ) {
      channel.forEach(sliced_channel => {
        for ( const key of io.sockets.adapter.rooms.keys() )
          if ( key == sliced_channel ) clients.push(sliced_channel);
      });
    } else if ( typeof channel === 'string' ) {
      for ( const key of io.sockets.adapter.rooms.keys() )
        if ( key == channel ) clients.push(channel);
    }

    res.send({
      'clients': clients,
      'success': clients.length > 0
    });
  } else {
      res.send({
        'message': 'Channel is required',
        'success': false
      });
  }
});

let reserved_events = [
  'join_channel',
  'leave_channel',
  'disconnect',
];

// handle incoming connections from clients
io.sockets.on('connection', function(socket) {
    console.log('connect');

    var socket_id = socket.client.conn.id;
    console.log(socket);

    socket.onAny((eventName, channel, data) => {
      // Match current event with preserved events
      var preserved_event = reserved_events.find( reserved_event => reserved_event === eventName);

      // Don't emit if the event is a preserved action event
      if ( preserved_event === undefined ) {
        console.log("Whisper from: " + channel + " using socket ID " + socket_id);

        // Broadcast to others without sender
        socket.broadcast.to(channel).emit(eventName, `Whisper for channel: ${data}`);
      }
    });

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
      console.log("DISCONNECT: ", socket_id);
    });
});

httpServer.listen(port, () => {
  console.log(`Example app listening at http://ip_addr:${port}`)
});
