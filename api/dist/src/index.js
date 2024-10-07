import 'dotenv/config';
import process from 'node:process';
import fs from 'node:fs/promises';
import https from 'node:https';
import * as env from "./config/env.config.js";
import * as databaseHelper from "./common/databaseHelper.js";
import app from "./app.js";
import * as logger from "./common/logger.js";
if ((await databaseHelper.connect(env.DB_URI, env.DB_SSL, env.DB_DEBUG)) && (await databaseHelper.initialize())) {
  let server;
  if (env.HTTPS) {
    https.globalAgent.maxSockets = Number.POSITIVE_INFINITY;
    const privateKey = await fs.readFile(env.PRIVATE_KEY, 'utf8');
    const certificate = await fs.readFile(env.CERTIFICATE, 'utf8');
    const credentials = {
      key: privateKey,
      cert: certificate
    };
    server = https.createServer(credentials, app);
    server.listen(env.PORT, () => {
      logger.info('HTTPS server is running on Port', env.PORT);
    });
  } else {
    server = app.listen(env.PORT, () => {
      logger.info('HTTP server is running on Port', env.PORT);
    });
  }
  const close = () => {
    logger.info('Gracefully stopping...');
    server.close(async () => {
      logger.info(`HTTP${env.HTTPS ? 'S' : ''} server closed`);
      await databaseHelper.close(true);
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  };
  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => process.on(signal, close));
}