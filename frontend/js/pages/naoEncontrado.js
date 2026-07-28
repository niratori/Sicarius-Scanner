export function renderNaoEncontrado(root) {
  root.innerHTML = `
    <div class="not-found">
      <p class="not-found__code">404</p>
      <h1>Página não encontrada</h1>
      <p>A página que você procura não existe ou foi movida.</p>
      <a href="#/dashboard" class="btn btn--primary mt-6">Voltar ao Dashboard</a>
    </div>
  `;
}
