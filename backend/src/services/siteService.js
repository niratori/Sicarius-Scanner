const siteRepository = require('../repositories/siteRepository');
const AppError = require('../utils/AppError');
const { validarUrlAlvo } = require('../utils/urlSecurity');

async function criarSite(usuarioId, dados) {
  const urlValidada = await validarUrlAlvo(dados.url);
  return siteRepository.criar({ ...dados, url: urlValidada, usuario: usuarioId });
}

async function listarSites(usuarioId, { busca, categoria } = {}) {
  const filtro = {};
  if (categoria) filtro.categoria = categoria;
  if (busca) filtro.nome = { $regex: busca, $options: 'i' };
  return siteRepository.listarPorUsuario(usuarioId, filtro);
}

async function obterSite(usuarioId, siteId) {
  const site = await siteRepository.buscarPorIdEUsuario(siteId, usuarioId);
  if (!site) throw new AppError('Site não encontrado', 404);
  return site;
}

async function atualizarSite(usuarioId, siteId, dados) {
  await obterSite(usuarioId, siteId); // garante posse
  const payload = { ...dados };
  if (dados.url) {
    payload.url = await validarUrlAlvo(dados.url);
  }
  return siteRepository.atualizar(siteId, payload);
}

async function removerSite(usuarioId, siteId) {
  await obterSite(usuarioId, siteId); // garante posse
  return siteRepository.remover(siteId);
}

module.exports = { criarSite, listarSites, obterSite, atualizarSite, removerSite };
