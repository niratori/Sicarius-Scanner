const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome do site é obrigatório'],
      trim: true,
      maxlength: 150,
    },
    url: {
      type: String,
      required: [true, 'URL é obrigatória'],
      trim: true,
      match: [/^https?:\/\/.+/i, 'URL deve iniciar com http:// ou https://'],
    },
    descricao: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    categoria: {
      type: String,
      trim: true,
      enum: ['institucional', 'e-commerce', 'blog', 'api', 'sistema-interno', 'outro'],
      default: 'outro',
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true,
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

siteSchema.index({ usuario: 1, createdAt: -1 });

module.exports = mongoose.model('Site', siteSchema);
