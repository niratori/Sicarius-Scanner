const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    logger.error('MONGO_URI nao definido no .env');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    logger.info('MongoDB conectado com sucesso');

    mongoose.connection.on('error', (err) => {
      logger.error(`Erro na conexao MongoDB: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB desconectado');
    });
  } catch (error) {
    logger.error(`Falha ao conectar no MongoDB: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
