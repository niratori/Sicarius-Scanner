const mongoose = require('mongoose');
const siteRepository = require('../repositories/siteRepository');
const scanRepository = require('../repositories/scanRepository');
const { success } = require('../utils/apiResponse');

async function obterResumo(req, res, next) {
  try {
    const usuarioId = new mongoose.Types.ObjectId(req.usuario.id);

    const [totalSites, totalScans, ultimosScans, agregados] = await Promise.all([
      siteRepository.contarPorUsuario(usuarioId),
      scanRepository.contarPorUsuario(usuarioId),
      scanRepository.listarUltimos(usuarioId, 5),
      scanRepository.somarVulnerabilidadesPorUsuario(usuarioId),
    ]);

    const severidade = agregados[0] || {
      total: 0,
      criticas: 0,
      altas: 0,
      medias: 0,
      baixas: 0,
      informativas: 0,
    };

    return success(res, {
      data: {
        totalSites,
        totalScans,
        totalVulnerabilidades: severidade.total,
        vulnerabilidadesCriticas: severidade.criticas,
        graficoSeveridade: {
          critica: severidade.criticas,
          alta: severidade.altas,
          media: severidade.medias,
          baixa: severidade.baixas,
          informativa: severidade.informativas,
        },
        ultimosScans,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { obterResumo };
