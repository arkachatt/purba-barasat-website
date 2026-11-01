/**
 * <administration-bodies>
 *
 * The Academic Council, the Managing Committee and the Finance Committee, as
 * three tabs of one page. The tab lives in the URL hash
 * (administration.html#finance-committee) so the header dropdown can link
 * straight to a body and the browser's Back button steps between them.
 *
 * Each body is only a list of names, which is why they share a page rather
 * than having one apiece: three shells for three lists would be three places
 * to keep a heading in step.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when, qsa } from '../core/dom.js';
import { administration } from '../data/site.js';

const bodies = administration.bodies;
const bodyFromHash = () => {
  const id = window.location.hash.replace('#', '');
  return bodies.some((body) => body.id === id) ? id : null;
};

class AdministrationBodies extends SiteComponent {
  get current() { return bodyFromHash() || bodies[0].id; }

  connectedCallback() {
    super.connectedCallback();
    this._onHash = () => this.showTab(this.current);
    window.addEventListener('hashchange', this._onHash);
  }

  disconnectedCallback() { window.removeEventListener('hashchange', this._onHash); }

  render() {
    const current = this.current;
    return html`
      <div class="tabs" role="tablist">
        ${each(bodies, (body) => html`
          <a class="tab" role="tab" href="#${body.id}" data-tab="${body.id}"
             aria-selected="${body.id === current}">${body.label}
            <span class="bn">${body.bn}</span></a>`)}
      </div>
      <div class="seg tabs-seg" role="tablist">
        ${each(bodies, (body) => html`
          <a class="seg-opt" role="tab" href="#${body.id}" data-tab="${body.id}"
             aria-selected="${body.id === current}">${body.short}</a>`)}
      </div>

      ${each(bodies, (body) => html`
        <div class="body-panel" data-panel="${body.id}" ${raw(body.id === current ? '' : 'hidden')}>
          ${body.members.length
            ? html`
              <div class="blueprint body-list">
                <div class="body-list-head">
                  <span class="body-list-name">${body.label}</span>
                  <span class="body-list-count">${body.members.length} members</span>
                </div>
                <ol class="body-members">
                  ${each(body.members, (member) => html`
                    <li>
                      <span class="body-member-name">${member.name}</span>
                      ${when(member.post, () => html`
                        <span class="body-member-post">${member.post}</span>`)}
                    </li>`)}
                </ol>
              </div>`
            : html`
              <empty-state icon="${body.icon}" heading="${administration.emptyHeading}"
                           action="Contact the office" action-href="contact.html">
                ${administration.emptyBody}
                <span class="bn">এই তালিকা এখনও প্রকাশিত হয়নি।</span>
              </empty-state>`}
        </div>`)}`;
  }

  hydrate() {
    qsa('[data-tab]', this).forEach((link) => link.addEventListener('click', () => {
      /* The hash change does the work; this only keeps the click snappy. */
      this.showTab(link.dataset.tab);
    }));
  }

  showTab(id) {
    qsa('[data-tab]', this).forEach((link) =>
      link.setAttribute('aria-selected', String(link.dataset.tab === id)));
    qsa('[data-panel]', this).forEach((panel) => { panel.hidden = panel.dataset.panel !== id; });
  }
}

define('administration-bodies', AdministrationBodies);
