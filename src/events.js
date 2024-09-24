const { logger } = require('./config'); // Import the logger from the config
// Define reserved events for socket communications
const reservedEvents = {
  JOIN_CHANNEL: 'join_channel',
  LEAVE_CHANNEL: 'leave_channel',
  DISCONNECT: 'disconnect',
  ON_CONNECT: 'on_connect',
  ON_DISCONNECT: 'on_disconnect'
};

// Maintain a list of connected socket IDs
let socketIds = [];

/**
 * Handle socket events such as joining/leaving channels, and broadcasting events
 * @param {Object} io - The Socket.IO instance
 * @param {Object} socket - The current socket connection
 */
function handleSocketEvents(io, socket) {
  const socketId = socket.client.conn.id; // Get the socket ID for the current connection
  logger.info(`New connection from: ${socketId}`); // Log the new connection

  // Catch any event and broadcast it to the channel
  socket.onAny((eventName, channel, data) => {
    if (!Object.values(reservedEvents).includes(eventName)) {
      logger.info(`Whisper from: ${channel}, socket ID: ${socketId}`); // Log the event
      socket.broadcast.to(channel).emit(eventName, data); // Broadcast to the channel
    }
  });

  // Handle joining a channel
  socket.on(reservedEvents.JOIN_CHANNEL, (channel, identifier = null) => {
    socket.join(channel); // Join the specified channel
    socketIds.push({ socketId, identifier, channel }); // Store socket ID and channel info

    // Emit the ON_CONNECT event to notify others in the channel
    const totalChannelClients = socketIds.filter(client => client.channel === channel);
    io.sockets.in(channel).emit(reservedEvents.ON_CONNECT, {
      action: 'connect',
      socketId,
      channel,
      identifier,
      connectedClients: totalChannelClients.length
    });

    logger.info(`Joined channel: ${channel}, identifier: ${identifier}`); // Log the join action
  });

  // Handle leaving a channel
  socket.on(reservedEvents.LEAVE_CHANNEL, channel => {
    socket.leave(channel); // Leave the specified channel
    logger.info(`Leaving channel: ${channel}`); // Log the leave action
  });

  // Handle socket disconnection
  socket.on(reservedEvents.DISCONNECT, reason => {
    try {
      const disconnectedClient = socketIds.find(client => client.socketId === socketId); // Find the disconnected client
      const clientChannel = disconnectedClient.channel;
      socketIds = socketIds.filter(client => client.socketId !== socketId); // Remove the client from the list

      // Notify the remaining clients in the channel about the disconnection
      const totalChannelClients = socketIds.filter(client => client.channel === clientChannel);
      if (disconnectedClient.channel) {
        io.sockets.in(disconnectedClient.channel).emit(reservedEvents.ON_DISCONNECT, {
          action: 'disconnect',
          socketId: disconnectedClient.socketId,
          channel: disconnectedClient.channel,
          connectedClients: totalChannelClients.length
        });
      }
      logger.info(`Disconnected from: ${clientChannel}, socket ID: ${disconnectedClient.socketId}`); // Log the disconnection
    } catch (error) {
      logger.error('DISCONNECT ERROR: ', error); // Log any error that occurs
    }
  });
}

module.exports = {
  reservedEvents, // Export the reserved events
  handleSocketEvents // Export the socket event handler
};
