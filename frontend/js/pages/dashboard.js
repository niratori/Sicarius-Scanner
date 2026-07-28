import { dashboardService } from '../services.js';
import { esc, formatarData } from '../ui.js';

const CORES = {
  critica: '#ff3b4e',
  alta: '#ff7a45',
  media: '#f5b544',
  baixa: '#3ddc84',
  informativa: '#7d828d',
};

const LABELS = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
  informativa: 'Informativa',
};

function construirDonut(entradas) {
  const total = entradas.reduce((soma, e) => soma + e.value, 0);
  if (total === 0) return '';

  const raio = 70;
  const raioInterno = 42;
  const centro = 90;
  let anguloAtual = -90;

  const caminhos = entradas
    .map((entrada) => {
      const fatia = (entrada.value / total) * 360;
      const inicio = anguloAtual;
      const fim = anguloAtual + fatia;
      anguloAtual = fim;

      const rad = (deg) => (deg * Math.PI) / 180;
      const xExtIni = centro + raio * Math.cos(rad(inicio));
      const yExtIni = centro + raio * Math.sin(rad(inicio));
      const xExtFim = centro + raio * Math.cos(rad(fim));
      const yExtFim = centro + raio * Math.sin(rad(fim));
      const xIntFim = centro + raioInterno * Math.cos(rad(fim));
      const yIntFim = centro + raioInterno * Math.sin(rad(fim));
      const xIntIni = centro + raioInterno * Math.cos(rad(inicio));
      const yIntIni = centro + raioInterno * Math.sin(rad(inicio));
      const largeArc = fatia > 180 ? 1 : 0;

      return `<path d="M ${xExtIni} ${yExtIni}
        A ${raio} ${raio} 0 ${largeArc} 1 ${xExtFim} ${yExtFim}
        L ${xIntFim} ${yIntFim}
        A ${raioInterno} ${raioInterno} 0 ${largeArc} 0 ${xIntIni} ${yIntIni}
        Z" fill="${entrada.cor}">
        <title>${esc(entrada.name)}: ${entrada.value}</title>
      </path>`;
    })
    .join('');

  return `
    <svg viewBox="0 0 180 180" width="200" height="200" role="img" aria-label="Distribuição de vulnerabilidades por severidade">
      ${caminhos}
      <text x="90" y="85" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="22" fill="#f3f4f6">${total}</text>
      <text x="90" y="103" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#7d828d">total</text>
    </svg>
  `;
}

function cardStat(titulo, valor, destaque) {
  return `
    <div class="card">
      <p class="stat-label">${esc(titulo)}</p>
      <p class="stat-value${destaque ? ' is-critical' : ''}">${esc(valor)}</p>
    </div>
  `;
}

export async function renderDashboard(root) {
  root.innerHTML = `
    <div class="page-head"><h1 class="page-title">Dashboard</h1></div>
    <div id="dash-content"><p class="loading-state">Carregando...</p></div>
  `;

  const content = root.querySelector('#dash-content');

  try {
    const { data } = await dashboardService.resumo();

    const dadosGrafico = Object.entries(data.graficoSeveridade)
      .filter(([, valor]) => valor > 0)
      .map(([chave, valor]) => ({ name: LABELS[chave], value: valor, cor: CORES[chave], chave }));

    const legenda = dadosGrafico
      .map(
        (e) => `<li><span class="swatch" style="background:${e.cor}"></span>${esc(e.name)} — ${e.value}</li>`
      )
      .join('');

    const ultimosScansHtml = data.ultimosScans.length
      ? `<ul class="list-plain list-divided">
          ${data.ultimosScans
            .map(
              (scan) => `
              <li>
                <div>
                  <a href="#/historico/${esc(scan._id)}" class="table-name">${esc(scan.site?.nome || 'Site removido')}</a>
                  <p class="list-meta">${esc(formatarData(scan.createdAt))}</p>
                </div>
                <span class="chip">${esc(scan.status.replace('_', ' '))}</span>
              </li>`
            )
            .join('')}
        </ul>`
      : `<p class="empty-state">Nenhuma análise realizada ainda.</p>`;

    content.innerHTML = `
      <div class="grid grid--stats mb-6">
        ${cardStat('Total de Sites', data.totalSites)}
        ${cardStat('Total de Scans', data.totalScans)}
        ${cardStat('Total de Vulnerabilidades', data.totalVulnerabilidades)}
        ${cardStat('Vulnerabilidades Críticas', data.vulnerabilidadesCriticas, true)}
      </div>

      <div class="grid grid--2">
        <div class="card">
          <h2 class="section-title">Vulnerabilidades por severidade</h2>
          ${
            dadosGrafico.length === 0
              ? `<p class="empty-state">Nenhuma vulnerabilidade encontrada ainda.</p>`
              : `<div class="donut-wrap">
                  ${construirDonut(dadosGrafico)}
                  <ul class="donut-legend">${legenda}</ul>
                </div>`
          }
        </div>

        <div class="card">
          <div class="page-head" style="margin-bottom:1rem;">
            <h2 class="section-title" style="margin:0;">Últimas análises</h2>
            <a href="#/historico" class="link-action">Ver tudo</a>
          </div>
          ${ultimosScansHtml}
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<p class="alert alert--error">Não foi possível carregar o dashboard.</p>`;
  }
}
