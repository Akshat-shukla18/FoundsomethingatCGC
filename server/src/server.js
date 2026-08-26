require('dotenv').config({ path: '../.env' }); // Load .env from root
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/database');
const logger = require('./config/logger');

const startServer = async () => {
  // Connect to database
  await connectDB();

  app.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

startServer();

