const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const Usuario = require('../models/Usuario');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token de autenticação não fornecido', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtSecret);

    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      throw new AppError('Usuário não encontrado', 401);
    }

    req.usuario = { id: usuario._id.toString(), email: usuario.email, nome: usuario.nome };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Token inválido ou expirado', 401));
    }
    next(err);
  }
}

module.exports = authMiddleware;
