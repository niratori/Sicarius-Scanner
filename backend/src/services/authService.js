const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const usuarioRepository = require('../repositories/usuarioRepository');

function gerarToken(usuario) {
  return jwt.sign({ id: usuario._id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

async function cadastrar({ nome, email, senha }) {
  const existente = await usuarioRepository.buscarPorEmail(email);
  if (existente) {
    throw new AppError('Este email já está cadastrado', 409);
  }

  const usuario = await usuarioRepository.criar({ nome, email, senha });
  const token = gerarToken(usuario);

  return { usuario, token };
}

async function login({ email, senha }) {
  const usuario = await usuarioRepository.buscarPorEmail(email);
  if (!usuario) {
    throw new AppError('Email ou senha inválidos', 401);
  }

  const senhaValida = await usuario.compararSenha(senha);
  if (!senhaValida) {
    throw new AppError('Email ou senha inválidos', 401);
  }

  const token = gerarToken(usuario);
  return { usuario, token };
}

module.exports = { cadastrar, login };
