/**
 * <state-alert tone="error" heading="…" action="Try again" secondary="Save and exit">
 * <state-alert tone="error" row icon="upload" title="…">…</state-alert>
 *
 * The site's one alert. Every error names the cause, states what was kept, and
 * offers a single action — the palette is mono, so a doubled hairline and
 * full-strength ink carry the alarm rather than a red fill.
 *
 *   tone  — "error" (doubled frame) or "status" (single hairline, accent icon)
 *   row   — the compact one-line variant
 * Buttons raise `alert-action` / `alert-secondary` events; the host decides.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, when } from '../core/dom.js';
import { icon } from '../core/icons.js';

class StateAlert extends SiteComponent {
  connectedCallback() {
    if (this._body === undefined) this._body = this.innerHTML.trim();
    super.connectedCallback();
  }

  render() {
    const tone = this.prop('tone', 'error');
    const row = this.boolProp('row');
    const action = this.prop('action');
    const secondary = this.prop('secondary');

    return html`
      <div class="blueprint alert alert--${tone} ${row ? 'alert--row' : ''}"
           role="${tone === 'error' ? 'alert' : 'status'}">
        ${raw(icon(this.prop('icon', tone === 'error' ? 'alert-circle' : 'info'), row ? 24 : 26))}
        <div class="alert-body">
          ${row
            ? html`
              <div class="alert-title">${this.prop('heading')}</div>
              <div class="alert-text">${raw(this._body)}</div>`
            : html`
              <h2>${this.prop('heading')}</h2>
              <p>${raw(this._body)}</p>`}
          ${when(!row && (action || secondary), () => html`
            <div class="alert-actions">
              ${when(action, () => html`<button type="button" class="btn btn-primary" data-action>${action}</button>`)}
              ${when(secondary, () => html`<button type="button" class="btn btn-secondary" data-secondary>${secondary}</button>`)}
            </div>`)}
        </div>
        ${when(row && action, () => html`
          <button type="button" class="btn btn-secondary" data-action>${action}</button>`)}
      </div>`;
  }

  hydrate() {
    this.querySelector('[data-action]')?.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('alert-action', { bubbles: true })));
    this.querySelector('[data-secondary]')?.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('alert-secondary', { bubbles: true })));
  }
}

define('state-alert', StateAlert);
