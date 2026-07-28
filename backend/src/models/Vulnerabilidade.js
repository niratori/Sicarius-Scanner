const mongoose = require('mongoose');

const vulnerabilidadeSchema = new mongoose.Schema(
  {
    scan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scan',
      required: true,
      index: true,
    },
    pluginId: {
      type: String,
      required: true,
    },
    nome: {
      type: String,
      required: true,
    },
    descricao: {
      type: String,
      default: '',
    },
    risco: {
      type: String,
      enum: ['Critica', 'Alta', 'Media', 'Baixa', 'Informativa'],
      required: true,
      index: true,
    },
    confidence: {
      type: String,
      default: '',
    },
    solution: {
      type: String,
      default: '',
    },
    reference: {
      type: String,
      default: '',
    },
    cwe: {
      type: String,
      default: '',
    },
    wasc: {
      type: String,
      default: '',
    },
    urlAfetada: {
      type: String,
      default: '',
    },
    parametro: {
      type: String,
      default: '',
    },
    metodoHTTP: {
      type: String,
      default: '',
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

vulnerabilidadeSchema.index({ scan: 1, risco: 1 });

module.exports = mongoose.model('Vulnerabilidade', vulnerabilidadeSchema);
