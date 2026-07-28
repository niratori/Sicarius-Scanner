const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

async function iniciar() {
  await connectDB();

  const server = app.listen(env.port, () => {
    logger.info(`Sicarius API rodando na porta ${env.port} [${env.nodeEnv}]`);
  });

  process.on('unhandledRejection', (err) => {
    logger.error(`Rejeição não tratada: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

iniciar();
