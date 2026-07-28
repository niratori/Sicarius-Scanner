import { siteService } from '../services.js';
import { esc } from '../ui.js';

const CATEGORIAS = ['institucional', 'e-commerce', 'blog', 'api', 'sistema-interno', 'outro'];

export async function renderSites(root) {
  root.innerHTML = `
    <div class="page-head">
      <h1 class="page-title">Meus Sites</h1>
      <a href="#/sites/novo" class="btn btn--primary">+ Novo Site</a>
    </div>

    <form id="form-filtro" class="form-row mb-6">
      <input class="input" style="max-width:260px" id="filtro-busca" placeholder="Buscar por nome..." />
      <select class="input" style="max-width:200px" id="filtro-categoria">
        <option value="">Todas as categorias</option>
        ${CATEGORIAS.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
      </select>
      <button type="submit" class="btn btn--secondary">Filtrar</button>
    </form>

    <div id="sites-content"><p class="loading-state">Carregando...</p></div>
  `;

  const content = root.querySelector('#sites-content');
  const form = root.querySelector('#form-filtro');

  async function carregar() {
    content.innerHTML = `<p class="loading-state">Carregando...</p>`;
    try {
      const { data } = await siteService.listar({
        busca: form.querySelector('#filtro-busca').value || undefined,
        categoria: form.querySelector('#filtro-categoria').value || undefined,
      });
      renderLista(data.sites);
    } catch (err) {
      content.innerHTML = `<p class="alert alert--error">Não foi possível carregar os sites.</p>`;
    }
  }

  function renderLista(sites) {
    if (!sites.length) {
      content.innerHTML = `<div class="card empty-state">Nenhum site cadastrado ainda.</div>`;
      return;
    }

    content.innerHTML = `
      <div class="grid grid--sites">
        ${sites
          .map(
            (site) => `
            <a href="#/sites/${esc(site._id)}" class="card card--link">
              <p class="table-name">${esc(site.nome)}</p>
              <p class="truncate" style="color:var(--signal-400); font-size:0.85rem;">${esc(site.url)}</p>
              <p class="text-muted mt-6" style="font-size:0.85rem; margin-top:0.5rem;">${esc(site.descricao || 'Sem descrição')}</p>
              <span class="chip mt-6" style="margin-top:0.75rem; display:inline-block;">${esc(site.categoria)}</span>
            </a>`
          )
          .join('')}
      </div>
    `;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    carregar();
  });

  carregar();
}
