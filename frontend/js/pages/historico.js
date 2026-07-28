import { scanService } from '../services.js';
import { esc, formatarData } from '../ui.js';

const STATUS_LABEL = {
  pendente: 'Pendente',
  spider: 'Rastreando',
  active_scan: 'Analisando',
  concluido: 'Concluído',
  erro: 'Erro',
};

export async function renderHistorico(root) {
  root.innerHTML = `
    <div class="page-head">
      <h1 class="page-title">Histórico de Análises</h1>
      <select class="input" style="max-width:200px" id="filtro-status">
        <option value="">Todos os status</option>
        ${Object.entries(STATUS_LABEL).map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}
      </select>
    </div>
    <div id="historico-content"><p class="loading-state">Carregando...</p></div>
  `;

  const content = root.querySelector('#historico-content');
  const select = root.querySelector('#filtro-status');

  async function carregar() {
    content.innerHTML = `<p class="loading-state">Carregando...</p>`;
    try {
      const { data } = await scanService.listar({ status: select.value || undefined });
      renderTabela(data.scans);
    } catch (err) {
      content.innerHTML = `<p class="alert alert--error">Não foi possível carregar o histórico.</p>`;
    }
  }

  function renderTabela(scans) {
    if (!scans.length) {
      content.innerHTML = `<div class="card empty-state">Nenhuma análise encontrada.</div>`;
      return;
    }

    content.innerHTML = `
      <div class="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Site</th>
              <th>Data</th>
              <th>Status</th>
              <th>Vulnerabilidades</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${scans
              .map(
                (scan) => `
                <tr>
                  <td><a href="#/historico/${esc(scan._id)}" class="table-name">${esc(scan.site?.nome || 'Site removido')}</a></td>
                  <td>${esc(formatarData(scan.createdAt))}</td>
                  <td>${esc(STATUS_LABEL[scan.status] || scan.status)}</td>
                  <td>${scan.totalVulnerabilidades}</td>
                  <td>
                    <div class="form-row">
                      <button class="link-action" data-acao="reexecutar" data-id="${esc(scan._id)}">Reexecutar</button>
                      <button class="link-action" style="color:var(--signal-500)" data-acao="excluir" data-id="${esc(scan._id)}">Excluir</button>
                    </div>
                  </td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    content.querySelectorAll('[data-acao="reexecutar"]').forEach((btn) =>
      btn.addEventListener('click', async () => {
        await scanService.reexecutar(btn.dataset.id);
        carregar();
      })
    );

    content.querySelectorAll('[data-acao="excluir"]').forEach((btn) =>
      btn.addEventListener('click', async () => {
        if (!window.confirm('Excluir esta análise?')) return;
        await scanService.remover(btn.dataset.id);
        carregar();
      })
    );
  }

  select.addEventListener('change', carregar);
  carregar();
}
