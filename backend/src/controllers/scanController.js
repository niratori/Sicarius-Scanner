const scanService = require('../services/scanService');
const { success } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

async function iniciar(req, res, next) {
  try {
    const { siteId } = req.body;
    if (!siteId) throw new AppError('siteId é obrigatório', 422);
    const scan = await scanService.iniciarScan(req.usuario.id, siteId);
    return success(res, {
      statusCode: 202,
      message: 'Análise iniciada. Acompanhe o status pelo histórico.',
      data: { scan },
    });
  } catch (err) {
    next(err);
  }
}

async function reexecutar(req, res, next) {
  try {
    const scan = await scanService.reexecutarScan(req.usuario.id, req.params.id);
    return success(res, { statusCode: 202, message: 'Nova análise iniciada', data: { scan } });
  } catch (err) {
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const { status, siteId } = req.query;
    const filtro = {};
    if (status) filtro.status = status;
    if (siteId) filtro.site = siteId;
    const scans = await scanService.listarScans(req.usuario.id, filtro);
    return success(res, { data: { scans, total: scans.length } });
  } catch (err) {
    next(err);
  }
}

async function obter(req, res, next) {
  try {
    const { scan, vulnerabilidades } = await scanService.obterScan(req.usuario.id, req.params.id);
    return success(res, { data: { scan, vulnerabilidades } });
  } catch (err) {
    next(err);
  }
}

async function remover(req, res, next) {
  try {
    await scanService.removerScan(req.usuario.id, req.params.id);
    return success(res, { message: 'Scan removido com sucesso' });
  } catch (err) {
    next(err);
  }
}

module.exports = { iniciar, reexecutar, listar, obter, remover };
