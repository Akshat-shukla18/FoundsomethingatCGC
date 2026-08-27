require('dotenv').config({ path: '../.env' }); // Load .env from root
const http = require('http');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/database');
const logger = require('./config/logger');
const { initWebSocket } = require('./websocket');

const startServer = async () => {
  // Connect to database
  await connectDB();

  const server = http.createServer(app);
  
  // Initialize WebSocket with the HTTP server
  initWebSocket(server);

  server.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

startServer();
