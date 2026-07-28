import { siteService, scanService } from '../services.js';
import { esc, formatarData, mensagemErro } from '../ui.js';

const STATUS_LABEL = {
  pendente: 'Pendente',
  spider: 'Rastreando (Spider)',
  active_scan: 'Analisando (Active Scan)',
  concluido: 'Concluído',
  erro: 'Erro',
};

export async function renderDetalhesSite(root, params) {
  const { id } = params;
  let intervalo = null;

  root.innerHTML = `<p class="loading-state">Carregando...</p>`;

  async function carregar() {
    const [siteResp, scansResp] = await Promise.all([
      siteService.obter(id),
      scanService.listar({ siteId: id }),
    ]);
    return { site: siteResp.data.site, scans: scansResp.data.scans };
  }

  function montarHtml(site, scans, erro) {
    root.innerHTML = `
      <div class="page-head">
        <div>
          <h1 class="page-title">${esc(site.nome)}</h1>
          <a href="${esc(site.url)}" target="_blank" rel="noreferrer">${esc(site.url)}</a>
          <p class="mt-6" style="margin-top:0.5rem; max-width:36rem;">${esc(site.descricao || '')}</p>
        </div>
        <div class="form-row">
          <button id="btn-analisar" class="btn btn--primary">Analisar</button>
          <a href="#/sites/${esc(id)}/editar" class="btn btn--secondary">Editar</a>
          <button id="btn-excluir" class="btn btn--danger">Excluir</button>
        </div>
      </div>

      ${erro ? `<p class="alert alert--error">${esc(erro)}</p>` : ''}

      <div class="card">
        <h2 class="section-title">Histórico de análises deste site</h2>
        ${
          scans.length === 0
            ? `<p class="empty-state">Nenhuma análise executada ainda para este site.</p>`
            : `<ul class="list-plain list-divided">
                ${scans
                  .map(
                    (scan) => `
                    <li>
                      <div>
                        <a href="#/historico/${esc(scan._id)}" class="table-name">${esc(formatarData(scan.createdAt))}</a>
                        <p class="list-meta">${scan.totalVulnerabilidades} vulnerabilidade(s) encontrada(s)</p>
                      </div>
                      <span class="chip">${esc(STATUS_LABEL[scan.status] || scan.status)}</span>
                    </li>`
                  )
                  .join('')}
              </ul>`
        }
      </div>
    `;

    root.querySelector('#btn-analisar').addEventListener('click', () => analisar());
    root.querySelector('#btn-excluir').addEventListener('click', () => excluirSite());
  }

  async function atualizarView(erro) {
    const { site, scans } = await carregar();
    montarHtml(site, scans, erro);

    const emAndamento = scans.some((s) => ['pendente', 'spider', 'active_scan'].includes(s.status));
    if (intervalo) clearInterval(intervalo);
    if (emAndamento) {
      intervalo = setInterval(() => atualizarView(), 5000);
    }
  }

  async function analisar() {
    const btn = root.querySelector('#btn-analisar');
    btn.disabled = true;
    btn.textContent = 'Iniciando...';
    try {
      await scanService.iniciar(id);
      await atualizarView();
    } catch (err) {
      await atualizarView(mensagemErro(err, 'Erro ao iniciar análise'));
    }
  }

  async function excluirSite() {
    if (!window.confirm('Tem certeza que deseja excluir este site?')) return;
    await siteService.remover(id);
    location.hash = '#/sites';
  }

  // limpa o polling ao sair da rota
  window.addEventListener(
    'hashchange',
    () => {
      if (intervalo) clearInterval(intervalo);
    },
    { once: true }
  );

  try {
    await atualizarView();
  } catch (err) {
    root.innerHTML = `<p class="alert alert--error">Não foi possível carregar o site.</p>`;
  }
}
