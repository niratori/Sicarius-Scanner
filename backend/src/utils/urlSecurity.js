const dns = require('dns').promises;
const net = require('net');
const AppError = require('./AppError');

// Faixas de IP privadas/reservadas que não podem ser alvo de scan a partir do backend,
// evitando que o serviço seja usado para atacar a própria infraestrutura (SSRF).
const BLOQUEADOS = [
  /^127\./, // loopback
  /^10\./, // rede privada
  /^192\.168\./, // rede privada
  /^172\.(1[6-9]|2\d|3[0-1])\./, // rede privada
  /^169\.254\./, // link-local / metadata cloud
  /^0\./,
  /^::1$/, // loopback ipv6
  /^fc00:/i, // ula ipv6
  /^fe80:/i, // link-local ipv6
];

function ehIpBloqueado(ip) {
  return BLOQUEADOS.some((regex) => regex.test(ip));
}

/**
 * Garante que a URL informada pelo usuário é http(s) e não aponta para
 * endereços internos/privados antes de enviá-la ao OWASP ZAP.
 */
async function validarUrlAlvo(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new AppError('URL inválida', 422);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new AppError('Apenas URLs http:// ou https:// são permitidas', 422);
  }

  const hostname = parsed.hostname;

  if (hostname === 'localhost' || hostname.endsWith('.local')) {
    throw new AppError('Não é permitido analisar endereços locais', 422);
  }

  // Se o hostname já é um IP literal, valida direto
  if (net.isIP(hostname)) {
    if (ehIpBloqueado(hostname)) {
      throw new AppError('Não é permitido analisar endereços de rede internos', 422);
    }
    return parsed.toString();
  }

  // Resolve o DNS para impedir que um domínio público aponte para IP interno
  try {
    const enderecos = await dns.lookup(hostname, { all: true });
    const algumBloqueado = enderecos.some((e) => ehIpBloqueado(e.address));
    if (algumBloqueado) {
      throw new AppError('URL resolve para um endereço de rede interno não permitido', 422);
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Não foi possível resolver o domínio informado', 422);
  }

  return parsed.toString();
}

module.exports = { validarUrlAlvo };
