import { scanService } from '../services.js';
import { esc, formatarData, severityBadge } from '../ui.js';

const STATUS_LABEL = {
  pendente: 'Pendente',
  spider: 'Rastreando (Spider)',
  active_scan: 'Analisando (Active Scan)',
  concluido: 'Concluído',
  erro: 'Erro',
};

export async function renderDetalhesScan(root, params) {
  const { id } = params;
  let intervalo = null;

  root.innerHTML = `<p class="loading-state">Carregando...</p>`;

  function montar(scan, vulnerabilidades) {
    root.innerHTML = `
      <div class="page-head">
        <div>
          <h1 class="page-title">Análise de ${esc(scan.site?.nome || 'site removido')}</h1>
          <p>${esc(formatarData(scan.createdAt))}</p>
        </div>
        ${scan.status === 'concluido' ? `<a href="#/relatorios/${esc(scan._id)}" class="btn btn--primary">Ver Relatório</a>` : ''}
      </div>

      <div class="grid grid--stats mb-6">
        <div class="card">
          <p class="stat-label">Status</p>
          <p class="stat-value" style="font-size:1.1rem;">${esc(STATUS_LABEL[scan.status] || scan.status)}</p>
        </div>
        <div class="card">
          <p class="stat-label">Total de vulnerabilidades</p>
          <p class="stat-value" style="font-size:1.1rem;">${scan.totalVulnerabilidades}</p>
        </div>
        <div class="card">
          <p class="stat-label">Tempo de execução</p>
          <p class="stat-value" style="font-size:1.1rem;">${scan.tempoExecucao ? `${scan.tempoExecucao}s` : '—'}</p>
        </div>
        <div class="card">
          <p class="stat-label">Críticas / Altas</p>
          <p class="stat-value is-critical" style="font-size:1.1rem;">${scan.resumoSeveridade.critica} / ${scan.resumoSeveridade.alta}</p>
        </div>
      </div>

      ${scan.status === 'erro' ? `<p class="alert alert--error">Falha na análise: ${esc(scan.erroMensagem || '')}</p>` : ''}
      ${
        ['pendente', 'spider', 'active_scan'].includes(scan.status)
          ? `<p class="alert alert--warning">Análise em andamento, esta página atualiza automaticamente...</p>`
          : ''
      }

      <div class="card table-wrap">
        <h2 class="section-title">Vulnerabilidades encontradas</h2>
        ${
          vulnerabilidades.length === 0
            ? `<p class="empty-state">Nenhuma vulnerabilidade encontrada até o momento.</p>`
            : `<table>
                <thead>
                  <tr><th>Vulnerabilidade</th><th>Risco</th><th>URL afetada</th><th>CWE</th></tr>
                </thead>
                <tbody>
                  ${vulnerabilidades
                    .map(
                      (v) => `
                      <tr>
                        <td class="table-name">${esc(v.nome)}</td>
                        <td>${severityBadge(v.risco)}</td>
                        <td class="truncate" style="max-width:20rem;">${esc(v.urlAfetada)}</td>
                        <td>${esc(v.cwe || '—')}</td>
                      </tr>`
                    )
                    .join('')}
                </tbody>
              </table>`
        }
      </div>
    `;
  }

  async function atualizar() {
    const { data } = await scanService.obter(id);
    montar(data.scan, data.vulnerabilidades);

    if (intervalo) clearInterval(intervalo);
    if (!['concluido', 'erro'].includes(data.scan.status)) {
      intervalo = setInterval(atualizar, 5000);
    }
  }

  window.addEventListener('hashchange', () => { if (intervalo) clearInterval(intervalo); }, { once: true });

  try {
    await atualizar();
  } catch (err) {
    root.innerHTML = `<p class="alert alert--error">Não foi possível carregar a análise.</p>`;
  }
}
