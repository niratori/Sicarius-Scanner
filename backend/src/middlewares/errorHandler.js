const logger = require('../utils/logger');
const { error } = require('../utils/apiResponse');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';
  let errors = err.errors || null;

  // Erros de validação do Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Erro de validação';
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Chave duplicada (ex: email já cadastrado)
  if (err.code === 11000) {
    statusCode = 409;
    const campo = Object.keys(err.keyValue || {})[0];
    message = `O campo '${campo}' já está em uso`;
  }

  // ObjectId inválido
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Identificador inválido';
  }

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${err.stack || err.message}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${message}`);
  }

  return error(res, { statusCode, message, errors });
}

module.exports = errorHandler;
