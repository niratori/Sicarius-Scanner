import { relatorioService } from '../services.js';
import { esc, formatarData, severityBadge, mensagemErro } from '../ui.js';

export async function renderRelatorio(root, params) {
  const { scanId } = params;

  root.innerHTML = `<p class="loading-state">Gerando relatório...</p>`;

  let relatorio;
  try {
    const { data } = await relatorioService.gerarPorScan(scanId);
    relatorio = data.relatorio;
  } catch (err) {
    root.innerHTML = `<p class="alert alert--error">${esc(mensagemErro(err, 'Erro ao gerar relatório'))}</p>`;
    return;
  }

  root.innerHTML = `
    <div class="page-head">
      <h1 class="page-title">Relatório de Vulnerabilidades</h1>
      <button id="btn-imprimir" class="btn btn--secondary">Imprimir / Exportar PDF</button>
    </div>

    <div class="card grid grid--2 mb-6">
      <div>
        <p class="stat-label">Site analisado</p>
        <p class="table-name">${esc(relatorio.site?.nome)}</p>
        <p style="color:var(--signal-400); font-size:0.85rem;">${esc(relatorio.site?.url)}</p>
      </div>
      <div>
        <p class="stat-label">Responsável</p>
        <p class="table-name">${esc(relatorio.usuarioResponsavel)}</p>
        <p class="text-muted" style="font-size:0.85rem;">${esc(formatarData(relatorio.dataAnalise))}</p>
      </div>
    </div>

    <div class="grid mb-6" style="grid-template-columns:repeat(2,1fr);">
      <div class="card" style="text-align:center;">
        <p class="stat-label">Críticas</p>
        <p class="stat-value is-critical">${relatorio.resumo.criticas}</p>
      </div>
      <div class="card" style="text-align:center;">
        <p class="stat-label">Altas</p>
        <p class="stat-value" style="color:var(--risk-high);">${relatorio.resumo.altas}</p>
      </div>
      <div class="card" style="text-align:center;">
        <p class="stat-label">Médias</p>
        <p class="stat-value" style="color:var(--risk-medium);">${relatorio.resumo.medias}</p>
      </div>
      <div class="card" style="text-align:center;">
        <p class="stat-label">Baixas</p>
        <p class="stat-value" style="color:var(--risk-low);">${relatorio.resumo.baixas}</p>
      </div>
    </div>

    <div class="card table-wrap mb-6">
      <h2 class="section-title">Tabela completa de vulnerabilidades</h2>
      <table>
        <thead><tr><th>Nome</th><th>Risco</th><th>Solução</th></tr></thead>
        <tbody>
          ${relatorio.vulnerabilidades
            .map(
              (v) => `
              <tr>
                <td class="table-name">${esc(v.nome)}</td>
                <td>${severityBadge(v.risco)}</td>
                <td style="max-width:28rem;">${esc(v.solution || '—')}</td>
              </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2 class="section-title">Recomendações</h2>
      ${
        relatorio.recomendacoes.length === 0
          ? `<p class="empty-state">Nenhuma recomendação disponível.</p>`
          : `<ul style="padding-left:1.1rem; display:flex; flex-direction:column; gap:0.5rem;">
              ${relatorio.recomendacoes
                .map((r) => `<li><strong style="color:var(--text-primary)">${esc(r.nome)}</strong> (${esc(r.risco)}): ${esc(r.solution)}</li>`)
                .join('')}
            </ul>`
      }
    </div>
  `;

  root.querySelector('#btn-imprimir').addEventListener('click', () => window.print());
}
