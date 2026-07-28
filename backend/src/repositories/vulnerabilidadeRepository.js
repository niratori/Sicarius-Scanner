const Vulnerabilidade = require('../models/Vulnerabilidade');

module.exports = {
  criarVarias: (lista) => Vulnerabilidade.insertMany(lista),
  listarPorScan: (scanId) => Vulnerabilidade.find({ scan: scanId }).sort({ risco: 1 }),
  removerPorScan: (scanId) => Vulnerabilidade.deleteMany({ scan: scanId }),
};
