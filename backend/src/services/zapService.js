const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

const zapClient = axios.create({
  baseURL: env.zap.apiUrl,
  timeout: 30000,
});

function withApiKey(params = {}) {
  return env.zap.apiKey ? { ...params, apikey: env.zap.apiKey } : params;
}

async function chamarZap(path, params = {}) {
  try {
    const { data } = await zapClient.get(path, { params: withApiKey(params) });
    return data;
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
      throw new AppError(
        'Não foi possível conectar à API do OWASP ZAP. Verifique se o ZAP está em execução.',
        503
      );
    }
    if (err.response) {
      throw new AppError(
        `Erro na API do OWASP ZAP: ${err.response.data?.message || err.response.statusText}`,
        502
      );
    }
    throw new AppError(`Falha de comunicação com o OWASP ZAP: ${err.message}`, 502);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Inicia o Spider (rastreamento) na URL alvo e aguarda a finalização (polling).
 */
async function executarSpider(url, { onProgress } = {}) {
  const inicio = await chamarZap('/JSON/spider/action/scan/', { url, recurse: true });
  const scanId = inicio.scan;

  const timeoutEm = Date.now() + env.zap.spiderTimeoutMs;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (Date.now() > timeoutEm) {
      throw new AppError('Tempo limite excedido durante o Spider', 504);
    }

    const status = await chamarZap('/JSON/spider/view/status/', { scanId });
    const progresso = Number(status.status);

    if (onProgress) onProgress(progresso);

    if (progresso >= 100) break;

    await sleep(env.zap.pollIntervalMs);
  }

  return scanId;
}

/**
 * Inicia o Active Scan na URL alvo e aguarda a finalização (polling).
 */
async function executarActiveScan(url, { onProgress } = {}) {
  const inicio = await chamarZap('/JSON/ascan/action/scan/', {
    url,
    recurse: true,
    inScopeOnly: false,
  });
  const scanId = inicio.scan;

  const timeoutEm = Date.now() + env.zap.activeScanTimeoutMs;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (Date.now() > timeoutEm) {
      throw new AppError('Tempo limite excedido durante o Active Scan', 504);
    }

    const status = await chamarZap('/JSON/ascan/view/status/', { scanId });
    const progresso = Number(status.status);

    if (onProgress) onProgress(progresso);

    if (progresso >= 100) break;

    await sleep(env.zap.pollIntervalMs);
  }

  return scanId;
}

/**
 * Busca todos os alerts (vulnerabilidades) encontrados para a URL/base informada.
 */
async function buscarAlerts(baseUrl) {
  const resultado = await chamarZap('/JSON/core/view/alerts/', { baseurl: baseUrl });
  return resultado.alerts || [];
}

/**
 * Mapeia o risco textual do ZAP ('High', 'Medium', 'Low', 'Informational')
 * para o vocabulário em português usado no domínio da aplicação.
 */
function mapearRisco(riscoZap) {
  const mapa = {
    High: 'Alta',
    Medium: 'Media',
    Low: 'Baixa',
    Informational: 'Informativa',
  };
  return mapa[riscoZap] || 'Informativa';
}

/**
 * Executa o fluxo completo: Spider -> Active Scan -> Alerts.
 * Recebe callbacks opcionais para reportar progresso/etapa ao chamador (ex: salvar status no banco).
 */
async function executarAnaliseCompleta(url, { onStatusChange } = {}) {
  if (onStatusChange) onStatusChange('spider');
  logger.info(`Iniciando Spider para ${url}`);
  await executarSpider(url);

  if (onStatusChange) onStatusChange('active_scan');
  logger.info(`Iniciando Active Scan para ${url}`);
  await executarActiveScan(url);

  logger.info(`Buscando alerts para ${url}`);
  const alertsBrutos = await buscarAlerts(url);

  return alertsBrutos.map((alert) => ({
    pluginId: alert.pluginId,
    nome: alert.alert || alert.name || 'Vulnerabilidade sem nome',
    descricao: alert.description || '',
    risco: mapearRisco(alert.risk),
    confidence: alert.confidence || '',
    solution: alert.solution || '',
    reference: alert.reference || '',
    cwe: alert.cweid || '',
    wasc: alert.wascid || '',
    urlAfetada: alert.url || url,
    parametro: alert.param || '',
    metodoHTTP: alert.method || '',
  }));
}

module.exports = {
  executarSpider,
  executarActiveScan,
  buscarAlerts,
  executarAnaliseCompleta,
  mapearRisco,
};
