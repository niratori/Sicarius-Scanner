/**
 * Padroniza todas as respostas da API.
 */
function success(res, { statusCode = 200, message = 'OK', data = null, meta = null }) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

function error(res, { statusCode = 500, message = 'Erro interno do servidor', errors = null }) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

module.exports = { success, error };
