const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const httpServer = require('http').Server(app);
const port = 3000;
const io = require('socket.io')(httpServer);

// App setting
const logging = true;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

// app.get('/', (req, res) => {
//   res.send('Hello World!')
//   app.use(express.static('./'))
// });
app.post('/event_api', (req, res) => {
    const { event, message } = req.body;
    if ( logging ) console.log('API Body: ', req.body);

    res.send('Random event!')
    io.emit(event, message);
});

io.on('connection', socket => {
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