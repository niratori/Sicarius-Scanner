const authService = require('../services/authService');
const usuarioRepository = require('../repositories/usuarioRepository');
const { success } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

async function cadastrar(req, res, next) {
  try {
    const { usuario, token } = await authService.cadastrar(req.body);
    return success(res, {
      statusCode: 201,
      message: 'Usuário cadastrado com sucesso',
      data: { usuario, token },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { usuario, token } = await authService.login(req.body);
    return success(res, {
      statusCode: 200,
      message: 'Login realizado com sucesso',
      data: { usuario, token },
    });
  } catch (err) {
    next(err);
  }
}

async function perfil(req, res, next) {
  try {
    const usuario = await usuarioRepository.buscarPorId(req.usuario.id);
    if (!usuario) throw new AppError('Usuário não encontrado', 404);
    return success(res, { data: { usuario } });
  } catch (err) {
    next(err);
  }
}

async function atualizarPerfil(req, res, next) {
  try {
    const { nome } = req.body;
    const usuario = await usuarioRepository.atualizar(req.usuario.id, { nome });
    return success(res, { message: 'Perfil atualizado', data: { usuario } });
  } catch (err) {
    next(err);
  }
}

module.exports = { cadastrar, login, perfil, atualizarPerfil };
