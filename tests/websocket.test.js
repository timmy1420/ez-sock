// tests/websocket.test.js
const io = require('socket.io-client');
const http = require('http');
const server = require('../src/index'); // Verwijs naar je socket.io server

describe('WebSocket Tests', () => {
  let clientSocket;

  beforeAll((done) => {
    const httpServer = http.createServer().listen(3000);
    clientSocket = io.connect('http://localhost:3000');
    clientSocket.on('connect', done);
  });

  test('Client can connect and receive events', (done) => {
    clientSocket.on('on_connect', (msg) => {
      expect(msg).toBeDefined();
      done();
    });
    clientSocket.emit('join_channel', 'test_channel');
  });

  afterAll(() => {
    clientSocket.close();
  });
});
