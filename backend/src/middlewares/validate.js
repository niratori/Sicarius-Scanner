const { error } = require('../utils/apiResponse');

/**
 * Recebe um schema Zod e valida req.body.
 * Uso: router.post('/rota', validate(meuSchema), controller)
 */
function validate(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);

    if (!resultado.success) {
      const errors = resultado.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
      return error(res, { statusCode: 422, message: 'Dados inválidos', errors });
    }

    req.body = resultado.data;
    next();
  };
}

module.exports = validate;
