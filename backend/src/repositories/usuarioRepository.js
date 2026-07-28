const Usuario = require('../models/Usuario');

module.exports = {
  criar: (dados) => Usuario.create(dados),
  buscarPorEmail: (email) => Usuario.findOne({ email }).select('+senha'),
  buscarPorId: (id) => Usuario.findById(id),
  atualizar: (id, dados) => Usuario.findByIdAndUpdate(id, dados, { new: true, runValidators: true }),
};
