/**
 * <empty-state icon="bell" heading="No notices yet" action="Contact the office"
 *              action-href="contact.html" inline>
 *
 * "Nothing published yet" is a normal condition on a school site, not a fault:
 * a section the office has not filled in gets an explanation and a way
 * forward, never a blank frame.
 *
 *   inline — lays it out as a row beside older content that is still readable
 *   The body text is the element's own child content, so it can carry markup.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, when } from '../core/dom.js';
import { icon } from '../core/icons.js';

class EmptyState extends SiteComponent {
  connectedCallback() {
    /* Capture the light-DOM body before the first render replaces it. */
    if (this._body === undefined) this._body = this.innerHTML.trim();
    super.connectedCallback();
  }

  render() {
    const action = this.prop('action');
    return html`
      <div class="blueprint empty-state ${this.boolProp('inline') ? 'empty-state--inline' : ''}">
        ${raw(icon(this.prop('icon', 'file-text'), this.boolProp('inline') ? 34 : 40))}
        <div class="empty-state-body">
          <h2>${this.prop('heading')}</h2>
          <p>${raw(this._body)}</p>
          ${when(action, () => html`
            <a class="btn btn-secondary btn-md" href="${this.prop('action-href', '#')}">${action}</a>`)}
        </div>
      </div>`;
  }
}

define('empty-state', EmptyState);
