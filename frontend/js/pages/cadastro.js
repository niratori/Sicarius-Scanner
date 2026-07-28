import { auth } from '../auth.js';
import { renderAuthShell, mensagemErro, esc } from '../ui.js';

export function renderCadastro(root) {
  renderAuthShell(root, {
    title: 'Criar conta',
    subtitle: 'Comece a analisar seus sites gratuitamente',
    bodyHtml: `
      <form id="form-cadastro" novalidate>
        <div id="cadastro-erro" role="alert"></div>

        <div class="field">
          <label class="label" for="cad-nome">Nome</label>
          <input class="input" type="text" id="cad-nome" name="nome" required autocomplete="name" placeholder="Seu nome completo" />
        </div>

        <div class="field">
          <label class="label" for="cad-email">Email</label>
          <input class="input" type="email" id="cad-email" name="email" required autocomplete="email" placeholder="voce@exemplo.com" />
        </div>

        <div class="field">
          <label class="label" for="cad-senha">Senha</label>
          <input class="input" type="password" id="cad-senha" name="senha" required minlength="8" autocomplete="new-password" placeholder="Mínimo 8 caracteres" />
        </div>

        <button type="submit" class="btn btn--primary btn--block mt-6" id="cadastro-submit">Criar conta</button>
      </form>
    `,
    footerHtml: `Já tem conta? <a href="#/login">Entrar</a>`,
  });

  const form = root.querySelector('#form-cadastro');
  const erroBox = root.querySelector('#cadastro-erro');
  const submitBtn = root.querySelector('#cadastro-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    erroBox.innerHTML = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Criando conta...';

    try {
      await auth.cadastrar(form.nome.value.trim(), form.email.value.trim(), form.senha.value);
      location.hash = '#/dashboard';
    } catch (err) {
      erroBox.innerHTML = `<p class="alert alert--error">${esc(mensagemErro(err, 'Erro ao cadastrar'))}</p>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Criar conta';
    }
  });
}
