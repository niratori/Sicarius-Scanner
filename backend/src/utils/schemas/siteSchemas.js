const { z } = require('zod');

const CATEGORIAS = ['institucional', 'e-commerce', 'blog', 'api', 'sistema-interno', 'outro'];

const urlSchema = z
  .string()
  .trim()
  .url('URL inválida')
  .refine((val) => /^https?:\/\//i.test(val), {
    message: 'Apenas URLs http:// ou https:// são permitidas',
  });

const criarSiteSchema = z.object({
  nome: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres').max(150),
  url: urlSchema,
  descricao: z.string().trim().max(500).optional().default(''),
  categoria: z.enum(CATEGORIAS).optional().default('outro'),
});

const atualizarSiteSchema = criarSiteSchema.partial();

module.exports = { criarSiteSchema, atualizarSiteSchema, urlSchema };
