import { auth } from './auth.js';
import { renderShell, renderAuthShell } from './ui.js';

import { renderLogin } from './pages/login.js';
import { renderCadastro } from './pages/cadastro.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderSites } from './pages/sites.js';
import { renderSiteForm } from './pages/siteForm.js';
import { renderDetalhesSite } from './pages/detalhesSite.js';
import { renderHistorico } from './pages/historico.js';
import { renderDetalhesScan } from './pages/detalhesScan.js';
import { renderRelatorio } from './pages/relatorios.js';
import { renderPerfil } from './pages/perfil.js';
import { renderNaoEncontrado } from './pages/naoEncontrado.js';

// Ordem importa: rotas mais específicas antes das genéricas.
const ROUTES = [
  { pattern: /^#\/login$/, public: true, view: renderLogin },
  { pattern: /^#\/cadastro$/, public: true, view: renderCadastro },
  { pattern: /^#\/dashboard$/, protected: true, view: renderDashboard },
  { pattern: /^#\/sites\/novo$/, protected: true, view: renderSiteForm },
  { pattern: /^#\/sites\/([^/]+)\/editar$/, protected: true, view: renderSiteForm, params: ['id'] },
  { pattern: /^#\/sites\/([^/]+)$/, protected: true, view: renderDetalhesSite, params: ['id'] },
  { pattern: /^#\/sites$/, protected: true, view: renderSites },
  { pattern: /^#\/historico\/([^/]+)$/, protected: true, view: renderDetalhesScan, params: ['id'] },
  { pattern: /^#\/historico$/, protected: true, view: renderHistorico },
  { pattern: /^#\/relatorios\/([^/]+)$/, protected: true, view: renderRelatorio, params: ['scanId'] },
  { pattern: /^#\/perfil$/, protected: true, view: renderPerfil },
];

const root = document.getElementById('app');

function matchRoute(hash) {
  for (const route of ROUTES) {
    const match = hash.match(route.pattern);
    if (match) {
      const params = {};
      (route.params || []).forEach((name, idx) => {
        params[name] = decodeURIComponent(match[idx + 1]);
      });
      return { route, params };
    }
  }
  return null;
}

export async function handleRoute() {
  let hash = location.hash;

  if (!hash || hash === '#' || hash === '#/') {
    hash = auth.isAutenticado() ? '#/dashboard' : '#/login';
    history.replaceState(null, '', hash);
  }

  const matched = matchRoute(hash);

  if (!matched) {
    renderNaoEncontrado(root);
    return;
  }

  const { route, params } = matched;

  if (route.protected && !auth.isAutenticado()) {
    location.hash = '#/login';
    return;
  }

  if (route.public && auth.isAutenticado()) {
    location.hash = '#/dashboard';
    return;
  }

  if (route.protected) {
    const mount = renderShell(root);
    mount.focus();
    await route.view(mount, params);
  } else {
    await route.view(root, params);
  }
}

export function startRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
