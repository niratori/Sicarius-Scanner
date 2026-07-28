const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema(
  {
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      required: true,
      index: true,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pendente', 'spider', 'active_scan', 'concluido', 'erro'],
      default: 'pendente',
    },
    erroMensagem: {
      type: String,
      default: null,
    },
    inicio: {
      type: Date,
      default: Date.now,
    },
    fim: {
      type: Date,
      default: null,
    },
    tempoExecucao: {
      type: Number, // em segundos
      default: null,
    },
    totalVulnerabilidades: {
      type: Number,
      default: 0,
    },
    resumoSeveridade: {
      critica: { type: Number, default: 0 },
      alta: { type: Number, default: 0 },
      media: { type: Number, default: 0 },
      baixa: { type: Number, default: 0 },
      informativa: { type: Number, default: 0 },
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

scanSchema.index({ usuario: 1, createdAt: -1 });
scanSchema.index({ site: 1, createdAt: -1 });

module.exports = mongoose.model('Scan', scanSchema);
