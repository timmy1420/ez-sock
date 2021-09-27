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

let socket_ids = [];

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
  const { channel } = req.body;
  if ( logging ) console.log('API Body: ', req.body);
  
  if ( channel ) {
    let clients = [];

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
      'socket_ids': socket_ids.filter( client => client.channel === channel ),
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
  let socket_id = socket.client.conn.id;
  console.log('connect from: ', socket_id);

    socket.onAny((eventName, channel, data) => {
      // Match current event with preserved events
      let preserved_event = reserved_events.find( reserved_event => reserved_event === eventName);

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

      // Add socket id to clients
      socket_ids.push({
        'socket_id': socket_id, 
        'channel': channel
      });

      let total_channel_clients = socket_ids.filter( client => client.channel === channel );

      // io.sockets.in(channel).emit('on_connect', `${socket_id} connected on ${channel} (${socket_ids.length})`);
      io.sockets.in(channel).emit('on_connect', {
        'action': 'connect', 
        'socket_id': socket_id,
        'channel': channel,
        'connected_clients': total_channel_clients.length
      });
  
      console.log("Incoming channel: " + channel);
    });

    socket.on('leave_channel', function(channel) {
      socket.leave(channel);
  
      console.log("Leaving channel: " + channel);
    });

    socket.on("disconnect", (reason) => {
      console.log("DISCONNECT: ", socket_id);

      try {
        // Broadcast to other clients
        let disconnected_client = socket_ids.find( client => client.socket_id === socket_id),
        client_channel = disconnected_client.channel;

        // Remove disconnected socket id from clients
        socket_ids = socket_ids.filter( client => client.socket_id !== socket_id );

        let total_channel_clients = socket_ids.filter( client => client.channel === client_channel );

        if ( disconnected_client.channel !== undefined )
          // io.sockets.in(disconnected_client.channel).emit('on_disconnect', `${disconnected_client.socket_id} disconnected from ${disconnected_client.channel} (${socket_ids.length})`);
          io.sockets.in(disconnected_client.channel).emit('on_disconnect', {
            'action': 'disconnect', 
            'socket_id': disconnected_client.socket_id,
            'channel': disconnected_client.channel,
            'connected_clients': total_channel_clients.length
          });
      } catch (error) {
        console.log('DISCONNECT ERROR: ' + error);
      }
      
    });
});

httpServer.listen(port, () => {
  console.log(`Example app listening at http://ip_addr:${port}`)
});
