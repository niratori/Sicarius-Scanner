import { siteService } from '../services.js';
import { esc, mensagemErro } from '../ui.js';

const CATEGORIAS = ['institucional', 'e-commerce', 'blog', 'api', 'sistema-interno', 'outro'];

export async function renderSiteForm(root, params) {
  const editando = Boolean(params?.id);
  let form = { nome: '', url: '', descricao: '', categoria: 'outro' };

  root.innerHTML = `
    <div class="page-head"><h1 class="page-title">${editando ? 'Editar Site' : 'Novo Site'}</h1></div>
    <div id="siteform-content"><p class="loading-state">Carregando...</p></div>
  `;
  const content = root.querySelector('#siteform-content');

  if (editando) {
    try {
      const { data } = await siteService.obter(params.id);
      form = data.site;
    } catch (err) {
      content.innerHTML = `<p class="alert alert--error">Não foi possível carregar o site.</p>`;
      return;
    }
  }

  content.innerHTML = `
    <form id="form-site" class="card max-w-lg" novalidate>
      <div id="site-erro" role="alert"></div>

      <div class="field">
        <label class="label" for="site-nome">Nome do site</label>
        <input class="input" id="site-nome" name="nome" required value="${esc(form.nome)}" />
      </div>

      <div class="field">
        <label class="label" for="site-url">URL</label>
        <input class="input" id="site-url" name="url" required type="url" placeholder="https://exemplo.com" value="${esc(form.url)}" />
      </div>

      <div class="field">
        <label class="label" for="site-descricao">Descrição</label>
        <textarea class="input" id="site-descricao" name="descricao" rows="3">${esc(form.descricao)}</textarea>
      </div>

      <div class="field">
        <label class="label" for="site-categoria">Categoria</label>
        <select class="input" id="site-categoria" name="categoria">
          ${CATEGORIAS.map((c) => `<option value="${esc(c)}" ${form.categoria === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
        </select>
      </div>

      <div class="form-row mt-6">
        <button type="submit" class="btn btn--primary" id="site-submit">Salvar</button>
        <button type="button" class="btn btn--secondary" id="site-cancelar">Cancelar</button>
      </div>
    </form>
  `;

  const formEl = content.querySelector('#form-site');
  const erroBox = content.querySelector('#site-erro');
  const submitBtn = content.querySelector('#site-submit');

  content.querySelector('#site-cancelar').addEventListener('click', () => history.back());

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    erroBox.innerHTML = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';

    const dados = {
      nome: formEl.nome.value.trim(),
      url: formEl.url.value.trim(),
      descricao: formEl.descricao.value.trim(),
      categoria: formEl.categoria.value,
    };

    try {
      if (editando) {
        await siteService.atualizar(params.id, dados);
        location.hash = `#/sites/${params.id}`;
      } else {
        const { data } = await siteService.criar(dados);
        location.hash = `#/sites/${data.site._id}`;
      }
    } catch (err) {
      erroBox.innerHTML = `<p class="alert alert--error">${esc(mensagemErro(err, 'Erro ao salvar site'))}</p>`;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Salvar';
    }
  });
}
