import { authService } from '../services.js';
import { auth } from '../auth.js';
import { esc, mensagemErro } from '../ui.js';

export function renderPerfil(root) {
  const usuario = auth.getUsuario();

  root.innerHTML = `
    <div class="page-head"><h1 class="page-title">Meu Perfil</h1></div>

    <form id="form-perfil" class="card max-w-md" novalidate>
      <div id="perfil-msgs"></div>

      <div class="field">
        <label class="label" for="perfil-nome">Nome</label>
        <input class="input" id="perfil-nome" name="nome" value="${esc(usuario?.nome || '')}" />
      </div>

      <div class="field">
        <label class="label" for="perfil-email">Email</label>
        <input class="input" id="perfil-email" value="${esc(usuario?.email || '')}" disabled />
      </div>

      <button type="submit" class="btn btn--primary" id="perfil-submit">Salvar alterações</button>
    </form>
  `;

  const form = root.querySelector('#form-perfil');
  const msgs = root.querySelector('#perfil-msgs');
  const submitBtn = root.querySelector('#perfil-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgs.innerHTML = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';

    try {
      const { data } = await authService.atualizarPerfil({ nome: form.nome.value.trim() });
      auth.atualizarUsuario(data.usuario);
      msgs.innerHTML = `<p class="alert alert--success">Perfil atualizado com sucesso</p>`;
    } catch (err) {
      msgs.innerHTML = `<p class="alert alert--error">${esc(mensagemErro(err, 'Erro ao atualizar perfil'))}</p>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Salvar alterações';
    }
  });
}
