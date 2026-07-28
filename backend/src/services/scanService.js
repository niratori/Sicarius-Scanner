const scanRepository = require('../repositories/scanRepository');
const vulnerabilidadeRepository = require('../repositories/vulnerabilidadeRepository');
const siteRepository = require('../repositories/siteRepository');
const zapService = require('../services/zapService');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const CHAVE_SEVERIDADE = {
  Critica: 'critica',
  Alta: 'alta',
  Media: 'media',
  Baixa: 'baixa',
  Informativa: 'informativa',
};

function calcularResumoSeveridade(vulnerabilidades) {
  const resumo = { critica: 0, alta: 0, media: 0, baixa: 0, informativa: 0 };
  vulnerabilidades.forEach((v) => {
    const chave = CHAVE_SEVERIDADE[v.risco] || 'informativa';
    resumo[chave] += 1;
  });
  return resumo;
}

/**
 * Executa o scan de forma assíncrona em background, atualizando o status no banco
 * a cada etapa. O endpoint HTTP retorna imediatamente com o scan em status 'pendente'.
 */
async function executarEmBackground(scanId, url) {
  try {
    const vulnerabilidades = await zapService.executarAnaliseCompleta(url, {
      onStatusChange: (status) => {
        scanRepository.atualizar(scanId, { status }).catch((e) => logger.error(e.message));
      },
    });

    const resumoSeveridade = calcularResumoSeveridade(vulnerabilidades);
    const fim = new Date();

    const scanAtual = await scanRepository.buscarPorId(scanId);
    const tempoExecucao = Math.round((fim - scanAtual.inicio) / 1000);

    await scanRepository.atualizar(scanId, {
      status: 'concluido',
      fim,
      tempoExecucao,
      totalVulnerabilidades: vulnerabilidades.length,
      resumoSeveridade,
    });

    if (vulnerabilidades.length > 0) {
      await vulnerabilidadeRepository.criarVarias(
        vulnerabilidades.map((v) => ({ ...v, scan: scanId }))
      );
    }

    logger.info(`Scan ${scanId} concluído com ${vulnerabilidades.length} vulnerabilidade(s)`);
  } catch (err) {
    logger.error(`Scan ${scanId} falhou: ${err.message}`);
    await scanRepository.atualizar(scanId, {
      status: 'erro',
      erroMensagem: err.message,
      fim: new Date(),
    });
  }
}

async function iniciarScan(usuarioId, siteId) {
  const site = await siteRepository.buscarPorIdEUsuario(siteId, usuarioId);
  if (!site) throw new AppError('Site não encontrado', 404);

  const scan = await scanRepository.criar({
    site: site._id,
    usuario: usuarioId,
    status: 'pendente',
    inicio: new Date(),
  });

  // Dispara em background sem bloquear a resposta HTTP
  setImmediate(() => executarEmBackground(scan._id, site.url));

  return scan;
}

async function reexecutarScan(usuarioId, scanId) {
  const scanAnterior = await scanRepository.buscarPorIdEUsuario(scanId, usuarioId);
  if (!scanAnterior) throw new AppError('Scan não encontrado', 404);
  return iniciarScan(usuarioId, scanAnterior.site._id);
}

async function listarScans(usuarioId, filtro) {
  return scanRepository.listarPorUsuario(usuarioId, filtro);
}

async function obterScan(usuarioId, scanId) {
  const scan = await scanRepository.buscarPorIdEUsuario(scanId, usuarioId);
  if (!scan) throw new AppError('Scan não encontrado', 404);
  const vulnerabilidades = await vulnerabilidadeRepository.listarPorScan(scanId);
  return { scan, vulnerabilidades };
}

async function removerScan(usuarioId, scanId) {
  const scan = await scanRepository.buscarPorIdEUsuario(scanId, usuarioId);
  if (!scan) throw new AppError('Scan não encontrado', 404);
  await vulnerabilidadeRepository.removerPorScan(scanId);
  await scanRepository.remover(scanId);
}

module.exports = { iniciarScan, reexecutarScan, listarScans, obterScan, removerScan };
