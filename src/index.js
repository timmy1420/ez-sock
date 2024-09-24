const express = require('express'); // Import express for the HTTP server
const http = require('http'); // Import Node's HTTP module
const socketIo = require('socket.io'); // Import Socket.IO for WebSocket functionality
const helmet = require('helmet'); // Import Helmet for security headers
const { port, logger } = require('./config'); // Import port and logger from config
const { handleSocketEvents } = require('./events'); // Import the event handler

const app = express(); // Create an Express application
const httpServer = http.Server(app); // Create an HTTP server
const io = socketIo(httpServer, { cors: { origin: '*' } }); // Setup Socket.IO with CORS enabled

// Use Helmet middleware to secure HTTP headers
app.use(helmet());

// Use Express body parsers for JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Route to emit an event to a specific channel
 */
app.post('/event_api', (req, res) => {
  const { event, message, channel } = req.body; // Extract data from the request body
  if (!event) {
    logger.warn('Empty event'); // Log if no event is provided
    return res.status(400).send({ message: 'Event cannot be empty', success: false });
  }

  if (channel) {
    io.sockets.in(channel).emit(event, message); // Emit the event to the specified channel
    logger.info(`Event sent to channel: ${channel}`); // Log the event
    return res.send({ message: 'Message sent to channel!', success: true });
  }

  logger.info('Event sent without channel'); // Log the event without channel
  return res.send({ message: 'Message sent without channel!', success: true });
});

/**
 * Route to check which clients are in a specific channel
 */
app.post('/channel_clients', (req, res) => {
  const { channel } = req.body; // Extract channel from the request body
  if (!channel) {
    logger.warn('No channel provided'); // Log if no channel is provided
    return res.status(400).send({ message: 'Channel is required', success: false });
  }

  const clients = io.sockets.adapter.rooms.get(channel) || []; // Get all connected clients in the channel
  const connectedClients = Array.from(clients).map(id => ({ id })); // Create an array of connected client IDs
  logger.info(`Clients in channel: ${channel}`); // Log the number of clients
  res.send({ clients: connectedClients, success: connectedClients.length > 0 }); // Return the list of clients
});

/**
 * Function to setup the socket connection and event handlers
 * @param {Object} io - The Socket.IO instance
 */
function socketSetup(io) {
  io.on('connection', socket => handleSocketEvents(io, socket)); // Attach the event handler for new connections
}

socketSetup(io); // Initialize the socket setup

httpServer.listen(port, () => logger.info(`Server running on port ${port}`)); // Start the server and log the port
