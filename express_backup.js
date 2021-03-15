const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const httpServer = require('http').Server(app);
const port = 3000;
const io = require('socket.io')(httpServer);

// App setting
const logging = true;
var main_socket = null;

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// app.get('/', (req, res) => {
//   res.send('Hello World!')
//   app.use(express.static('./'))
// });
app.post('/event_api', (req, res) => {
    const { event, message, channel } = req.body;
    if ( logging ) console.log('API Body: ', req.body);

    if ( channel ) {
        main_socket.join(channel);
        console.log(channel);
        res.send('Random event!')
        io.to(channel).emit(event, message);
    } else {
        res.send('Random event!')
        io.emit(event, message);
    }

    main_socket.leave(channel);
});

io.on('connection', socket => {
    main_socket = socket;
    if ( logging ) console.log('connect');

    // let counter = 0;
    // setInterval(() => {
    //   socket.emit('server_data', ++counter);
    // }, 1000);

    socket.on('client_data', data => {
        if ( logging ) console.log('CLIENT DATA: ', data);
    });
});

httpServer.listen(port, () => {
  console.log(`Example app listening at http://ip_addr:${port}`)
})