const Scan = require('../models/Scan');

module.exports = {
  criar: (dados) => Scan.create(dados),
  buscarPorId: (id) => Scan.findById(id).populate('site', 'nome url'),
  buscarPorIdEUsuario: (id, usuarioId) =>
    Scan.findOne({ _id: id, usuario: usuarioId }).populate('site', 'nome url'),
  listarPorUsuario: (usuarioId, filtro = {}) =>
    Scan.find({ usuario: usuarioId, ...filtro })
      .populate('site', 'nome url')
      .sort({ createdAt: -1 }),
  listarUltimos: (usuarioId, limite = 5) =>
    Scan.find({ usuario: usuarioId }).populate('site', 'nome url').sort({ createdAt: -1 }).limit(limite),
  atualizar: (id, dados) => Scan.findByIdAndUpdate(id, dados, { new: true, runValidators: true }),
  remover: (id) => Scan.findByIdAndDelete(id),
  contarPorUsuario: (usuarioId) => Scan.countDocuments({ usuario: usuarioId }),
  somarVulnerabilidadesPorUsuario: (usuarioId) =>
    Scan.aggregate([
      { $match: { usuario: usuarioId } },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalVulnerabilidades' },
          criticas: { $sum: '$resumoSeveridade.critica' },
          altas: { $sum: '$resumoSeveridade.alta' },
          medias: { $sum: '$resumoSeveridade.media' },
          baixas: { $sum: '$resumoSeveridade.baixa' },
          informativas: { $sum: '$resumoSeveridade.informativa' },
        },
      },
    ]),
};
