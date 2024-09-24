require('dotenv').config(); // Load environment variables from .env file
const winston = require('winston');

// Create a Winston logger with timestamp and JSON format
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // Set log level based on environment
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: 'logs/app.log' }) // Log to file
  ]
});

// Export configuration settings for port, logging, and the logger instance
module.exports = {
  port: process.env.PORT || 3000, // Define the port for the app
  logging: process.env.LOGGING || false, // Enable or disable logging
  logger // Export the logger
};
