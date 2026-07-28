const { z } = require('zod');

const cadastroSchema = z.object({
  nome: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres').max(100),
  email: z.string().trim().email('Email inválido').max(150),
  senha: z.string().min(8, 'Senha deve ter ao menos 8 caracteres').max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

module.exports = { cadastroSchema, loginSchema };
