/**
 * <login-gateway>
 *
 * The doorway into the management software. Three role forms, all rendered
 * from `loginRoles`: the wide layout stands them side by side, the phone
 * layout puts a segmented picker above one form at a time.
 *
 * Submitting runs client-side validation and then hands off to
 * services/auth.js, which is a stub until the office supplies the real system.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, qsa } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { loginPage, loginRoles, defaultLoginRole } from '../data/site.js';
import { login, AuthError } from '../services/auth.js';

class LoginGateway extends SiteComponent {
  render() {
    // The caveat appears once on each layout: as an aside beside the heading
    // on wide screens, and below the single form on a phone.
    const note = (variant) => html`
      <div class="note blueprint ${variant === 'mobile' ? 'login-note--mobile' : 'login-note'}">
        ${raw(icon('external-link', variant === 'mobile' ? 18 : 20))}
        <span>${raw(variant === 'mobile' ? loginPage.noteShort : loginPage.note)}</span>
      </div>`;

    return html`
      <div class="login-head">
        <div>
          <div class="kicker">${loginPage.kicker}</div>
          <h1>
            <span class="login-title-long">${loginPage.title}</span>
            <span class="login-title-short">${loginPage.titleShort}</span>
          </h1>
          <p>
            <span class="login-intro-long">${loginPage.intro}</span>
            <span class="login-intro-short">${loginPage.introShort}</span>
          </p>
        </div>
        ${note('desktop')}
      </div>

      <div class="seg login-picker" role="radiogroup" aria-label="Role">
        ${each(loginRoles, (role) => html`
          <label class="seg-opt">
            <input type="radio" name="login-role" value="${role.id}"
                   ${raw(role.id === defaultLoginRole ? 'checked' : '')}>${role.pickerLabel}
          </label>`)}
      </div>

      <div class="login-roles" data-role="${defaultLoginRole}">
        ${each(loginRoles, (role) => html`
          <form class="login-card blueprint" data-role="${role.id}" novalidate>
            <div class="login-card-head">
              <span class="login-card-icon blueprint">${raw(icon(role.icon, 22))}</span>
              <div>
                <h3>${role.title}</h3>
                <div class="login-card-sub">${role.sub}</div>
              </div>
            </div>

            <div class="field" data-field="id">
              <label for="${role.id}-id">${role.idLabel}</label>
              <input class="input" id="${role.id}-id" name="id" autocomplete="username"
                     placeholder="${role.idPlaceholder}">
              <div class="field-error" data-error></div>
            </div>

            <div class="field" data-field="password">
              <label for="${role.id}-password">Password</label>
              <input class="input" id="${role.id}-password" name="password" type="password"
                     autocomplete="current-password" placeholder="Password">
              <div class="field-error" data-error></div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg">${role.submit}</button>
            <p class="login-status" data-status role="status"></p>
            <a class="login-forgot" href="${loginPage.forgotHref}">Forgot password?</a>
          </form>`)}
      </div>

      ${note('mobile')}`;
  }

  hydrate() {
    const roles = this.querySelector('.login-roles');

    // The phone picker swaps which form is on screen; the wide layout ignores it.
    qsa('input[name="login-role"]', this).forEach((input) => {
      input.addEventListener('change', () => { roles.dataset.role = input.value; });
    });

    qsa('form.login-card', this).forEach((form) => this.#wireForm(form));
  }

  #wireForm(form) {
    const roleId = form.dataset.role;
    const role = loginRoles.find((r) => r.id === roleId);
    const status = form.querySelector('[data-status]');

    const clearErrors = () => {
      status.textContent = '';
      status.removeAttribute('data-tone');
      qsa('.field', form).forEach((field) => {
        delete field.dataset.invalid;
        field.querySelector('[data-error]').textContent = '';
        field.querySelector('.input').removeAttribute('aria-invalid');
      });
    };

    const showError = (error) => {
      const field = error.field && form.querySelector(`.field[data-field="${error.field}"]`);
      if (field) {
        field.dataset.invalid = 'true';
        field.querySelector('[data-error]').textContent = error.message;
        field.querySelector('.input').setAttribute('aria-invalid', 'true');
        field.querySelector('.input').focus();
      } else {
        status.textContent = error.message;
        status.dataset.tone = 'error';
      }
    };

    form.addEventListener('input', clearErrors);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearErrors();

      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      try {
        const data = new FormData(form);
        await login(
          { role: roleId, id: data.get('id'), password: data.get('password') },
          { id: role.idLabel }
        );
        status.textContent = 'Signing you in…';
        status.dataset.tone = 'ok';
      } catch (error) {
        showError(error instanceof AuthError ? error : new AuthError('Something went wrong. Try again.'));
      } finally {
        submit.disabled = false;
      }
    });
  }
}

define('login-gateway', LoginGateway);
