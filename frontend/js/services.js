import { api } from './api.js';

export const authService = {
  cadastrar: (dados) => api.post('/auth/cadastro', dados),
  login: (dados) => api.post('/auth/login', dados),
  perfil: () => api.get('/auth/perfil'),
  atualizarPerfil: (dados) => api.put('/auth/perfil', dados),
};

export const siteService = {
  listar: (params) => api.get('/sites', params),
  obter: (id) => api.get(`/sites/${id}`),
  criar: (dados) => api.post('/sites', dados),
  atualizar: (id, dados) => api.put(`/sites/${id}`, dados),
  remover: (id) => api.delete(`/sites/${id}`),
};

export const scanService = {
  listar: (params) => api.get('/scans', params),
  obter: (id) => api.get(`/scans/${id}`),
  iniciar: (siteId) => api.post('/scans', { siteId }),
  reexecutar: (id) => api.post(`/scans/${id}/reexecutar`),
  remover: (id) => api.delete(`/scans/${id}`),
};

export const dashboardService = {
  resumo: () => api.get('/dashboard/resumo'),
};

export const relatorioService = {
  gerarPorScan: (scanId) => api.get(`/relatorios/scan/${scanId}`),
};
