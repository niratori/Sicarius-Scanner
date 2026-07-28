import { authService } from './services.js';

const TOKEN_KEY = 'sicarius_token';
const USER_KEY = 'sicarius_usuario';

function getUsuario() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function isAutenticado() {
  return Boolean(getToken());
}

function salvarSessao(usuario, token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

function atualizarUsuario(usuario) {
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

async function login(email, senha) {
  const { data } = await authService.login({ email, senha });
  salvarSessao(data.usuario, data.token);
  return data.usuario;
}

async function cadastrar(nome, email, senha) {
  const { data } = await authService.cadastrar({ nome, email, senha });
  salvarSessao(data.usuario, data.token);
  return data.usuario;
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const auth = {
  getUsuario,
  getToken,
  isAutenticado,
  atualizarUsuario,
  login,
  cadastrar,
  logout,
};
