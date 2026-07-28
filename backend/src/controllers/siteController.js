const siteService = require('../services/siteService');
const { success } = require('../utils/apiResponse');

async function criar(req, res, next) {
  try {
    const site = await siteService.criarSite(req.usuario.id, req.body);
    return success(res, { statusCode: 201, message: 'Site cadastrado com sucesso', data: { site } });
  } catch (err) {
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const { busca, categoria } = req.query;
    const sites = await siteService.listarSites(req.usuario.id, { busca, categoria });
    return success(res, { data: { sites, total: sites.length } });
  } catch (err) {
    next(err);
  }
}

async function obter(req, res, next) {
  try {
    const site = await siteService.obterSite(req.usuario.id, req.params.id);
    return success(res, { data: { site } });
  } catch (err) {
    next(err);
  }
}

async function atualizar(req, res, next) {
  try {
    const site = await siteService.atualizarSite(req.usuario.id, req.params.id, req.body);
    return success(res, { message: 'Site atualizado com sucesso', data: { site } });
  } catch (err) {
    next(err);
  }
}

async function remover(req, res, next) {
  try {
    await siteService.removerSite(req.usuario.id, req.params.id);
    return success(res, { message: 'Site removido com sucesso' });
  } catch (err) {
    next(err);
  }
}

module.exports = { criar, listar, obter, atualizar, remover };
