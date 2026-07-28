const scanService = require('../services/scanService');
const { success } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

async function gerarRelatorioScan(req, res, next) {
  try {
    const { scan, vulnerabilidades } = await scanService.obterScan(req.usuario.id, req.params.id);

    if (scan.status !== 'concluido') {
      throw new AppError('O relatório só pode ser gerado após a conclusão do scan', 400);
    }

    const relatorio = {
      site: scan.site,
      usuarioResponsavel: req.usuario.nome,
      dataAnalise: scan.createdAt,
      tempoExecucao: scan.tempoExecucao,
      resumo: {
        totalVulnerabilidades: scan.totalVulnerabilidades,
        criticas: scan.resumoSeveridade.critica,
        altas: scan.resumoSeveridade.alta,
        medias: scan.resumoSeveridade.media,
        baixas: scan.resumoSeveridade.baixa,
        informativas: scan.resumoSeveridade.informativa,
      },
      vulnerabilidades,
      recomendacoes: vulnerabilidades
        .filter((v) => v.solution)
        .map((v) => ({ nome: v.nome, risco: v.risco, solution: v.solution })),
    };

    return success(res, { data: { relatorio } });
  } catch (err) {
    next(err);
  }
}

module.exports = { gerarRelatorioScan };
