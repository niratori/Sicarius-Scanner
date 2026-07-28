const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    senha: {
      type: String,
      required: [true, 'Senha é obrigatória'],
      minlength: 8,
      select: false,
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

usuarioSchema.pre('save', async function hashSenha(next) {
  if (!this.isModified('senha')) return next();
  const salt = await bcrypt.genSalt(12);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

usuarioSchema.methods.compararSenha = function compararSenha(senhaDigitada) {
  return bcrypt.compare(senhaDigitada, this.senha);
};

usuarioSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.senha;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Usuario', usuarioSchema);
