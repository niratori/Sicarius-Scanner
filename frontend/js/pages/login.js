import { auth } from '../auth.js';
import { renderAuthShell, mensagemErro, esc } from '../ui.js';

export function renderLogin(root) {
  renderAuthShell(root, {
    title: 'Entrar no Sicarius',
    subtitle: 'Analise vulnerabilidades dos seus sites',
    bodyHtml: `
      <form id="form-login" class="auth-form" novalidate>
        <div id="login-erro" role="alert"></div>

        <div class="field">
          <label class="label" for="login-email">Email</label>
          <input class="input" type="email" id="login-email" name="email" required autocomplete="username" placeholder="voce@exemplo.com" />
        </div>

        <div class="field">
          <label class="label" for="login-senha">Senha</label>
          <input class="input" type="password" id="login-senha" name="senha" required autocomplete="current-password" placeholder="••••••••" />
        </div>

        <button type="submit" class="btn btn--primary btn--block mt-6" id="login-submit">Entrar</button>
      </form>
    `,
    footerHtml: `Não tem conta? <a href="#/cadastro">Cadastre-se</a>`,
  });

  const form = root.querySelector('#form-login');
  const erroBox = root.querySelector('#login-erro');
  const submitBtn = root.querySelector('#login-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    erroBox.innerHTML = '';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Entrando...';

    const email = form.email.value.trim();
    const senha = form.senha.value;

    try {
      await auth.login(email, senha);
      location.hash = '#/dashboard';
    } catch (err) {
      erroBox.innerHTML = `<p class="alert alert--error">${esc(mensagemErro(err, 'Erro ao fazer login'))}</p>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Entrar';
    }
  });
}
