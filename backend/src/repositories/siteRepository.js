const Site = require('../models/Site');

module.exports = {
  criar: (dados) => Site.create(dados),
  listarPorUsuario: (usuarioId, filtro = {}) =>
    Site.find({ usuario: usuarioId, ...filtro }).sort({ createdAt: -1 }),
  buscarPorId: (id) => Site.findById(id),
  buscarPorIdEUsuario: (id, usuarioId) => Site.findOne({ _id: id, usuario: usuarioId }),
  atualizar: (id, dados) => Site.findByIdAndUpdate(id, dados, { new: true, runValidators: true }),
  remover: (id) => Site.findByIdAndDelete(id),
  contarPorUsuario: (usuarioId) => Site.countDocuments({ usuario: usuarioId }),
};
