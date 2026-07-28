import { auth } from './auth.js';

const NAV_LINKS = [
  { to: '#/dashboard', label: 'Dashboard', match: /^#\/dashboard/ },
  { to: '#/sites', label: 'Sites', match: /^#\/sites/ },
  { to: '#/historico', label: 'Histórico', match: /^#\/historico/ },
  { to: '#/perfil', label: 'Perfil', match: /^#\/perfil/ },
];

export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function formatarData(valor) {
  if (!valor) return '—';
  return new Date(valor).toLocaleString('pt-BR');
}

const SEVERITY_CLASS = {
  Critica: 'badge--critical',
  Alta: 'badge--alta',
  Media: 'badge--media',
  Baixa: 'badge--baixa',
  Informativa: 'badge--info',
};

export function severityBadge(risco) {
  const cls = SEVERITY_CLASS[risco] || SEVERITY_CLASS.Informativa;
  return `<span class="badge ${cls}">${esc(risco || 'Informativa')}</span>`;
}

export function statusBadge(label) {
  return `<span class="badge badge--status">${esc(label)}</span>`;
}

/** Renderiza o shell (sidebar + main) e devolve o elemento onde a página deve montar seu conteúdo. */
export function renderShell(root) {
  const usuario = auth.getUsuario();
  const currentHash = location.hash || '#/dashboard';

  root.innerHTML = `
    <a class="skip-link" href="#main-content">Pular para o conteúdo</a>
    <div class="shell">
      <aside class="sidebar" aria-label="Navegação principal">
        <div class="brand">
          <span class="brand__mark"><img src="assets/logo-white.png" alt="" /></span>
          <div>
            <span class="brand__name">SICARIUS</span>
            <span class="brand__tag">Vulnerability Ops</span>
          </div>
        </div>

        <nav class="nav" aria-label="Seções">
          ${NAV_LINKS.map(
            (link) => `
            <a class="nav__link${link.match.test(currentHash) ? ' is-active' : ''}" href="${link.to}">
              ${esc(link.label)}
            </a>`
          ).join('')}
        </nav>

        <div class="sidebar__footer">
          <p class="user-name">${esc(usuario?.nome || '')}</p>
          <p class="user-email">${esc(usuario?.email || '')}</p>
          <button id="btn-sair" class="btn btn--secondary btn--block" type="button">Sair</button>
        </div>
      </aside>

      <main id="main-content" class="main" tabindex="-1"></main>
    </div>
  `;

  root.querySelector('#btn-sair').addEventListener('click', () => {
    auth.logout();
    location.hash = '#/login';
  });

  return root.querySelector('#main-content');
}

export function renderAuthShell(root, { title, subtitle, bodyHtml, footerHtml }) {
  root.innerHTML = `
    <div class="auth-screen">
      <div class="auth-card">
        <div class="auth-header">
          <span class="brand__mark"><img src="assets/logo-white.png" alt="Sicarius" /></span>
          <h1>${esc(title)}</h1>
          <p>${esc(subtitle)}</p>
        </div>
        <div class="card">${bodyHtml}</div>
        <p class="auth-footer">${footerHtml}</p>
      </div>
    </div>
  `;
}

export function mensagemErro(err, padrao) {
  const errosValidacao = err?.payload?.errors;
  if (errosValidacao?.length) return errosValidacao.join(', ');
  return err?.message || padrao;
}
