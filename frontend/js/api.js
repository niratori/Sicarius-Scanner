/* ============================================================
   API — cliente HTTP baseado em fetch, integração com o backend
   Sicarius. Substitui o axios usado na versão React.
   ============================================================ */

const API_BASE_URL = 'https://sicarius-prototype.onrender.com/';

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = 'GET', body, params } = {}) {
  let url = `${API_BASE_URL}${path}`;

  if (params) {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    if (query) url += `?${query}`;
  }

  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('sicarius_token');
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError('Não foi possível conectar à API do Sicarius.', 0, null);
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (_) {
    /* resposta sem corpo JSON */
  }

  if (response.status === 401) {
    localStorage.removeItem('sicarius_token');
    localStorage.removeItem('sicarius_usuario');
    if (!location.hash.startsWith('#/login')) {
      location.hash = '#/login';
    }
  }

  if (!response.ok) {
    const message = payload?.message || 'Ocorreu um erro ao comunicar com a API.';
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

export { api, ApiError };
