/**
 * <admission-page>
 *
 * The admission landing screen, in whichever state `admission.open` says.
 * Closed is not a stripped-down page: eligibility and the archived notices
 * stay published, the apply buttons carry the date they reopen, and a banner
 * explains the wait. One flag flips the whole screen.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { admission } from '../data/site.js';

class AdmissionPage extends SiteComponent {
  get isOpen() {
    if (this.boolProp('force-closed')) return false;
    if (this.boolProp('force-open')) return true;
    return admission.open;
  }

  render() {
    const open = this.isOpen;

    return html`
      ${when(!open, () => html`
        <section class="blueprint admission-closed">
          ${raw(icon('calendar-days', 40))}
          <div>
            <h2>${admission.closed.heading}</h2>
            <div class="admission-closed-body">${raw(admission.closed.body)}</div>
          </div>
          <a class="btn btn-secondary btn-lg" href="${admission.closed.cta.href}">${admission.closed.cta.label}</a>
        </section>`)}

      <div class="admission-blocks">
        ${each(admission.blocks, (block) => html`
          <section class="admission-block blueprint">
            <div>
              <div class="kicker">${block.kicker}</div>
              <h2>${block.title}</h2>
              <div class="admission-block-sub">${open ? block.sub : block.subClosed}</div>
            </div>

            ${when(open && block.open !== false, () => html`
              <ul>${each(block.rules, (rule) => html`<li>${rule}</li>`)}</ul>`)}

            ${when(open && block.open === false, () => html`
              <div class="admission-block-shut">
                <span class="tag tag-neutral">Closed</span>
                <p class="admission-block-shut-line">${block.closedLine}</p>
              </div>`)}

            <div class="doc-row">
              <div class="doc-row-main">
                ${raw(icon('file-text', 22))}
                <div>
                  <div class="doc-row-title">${open ? block.notice.title : block.notice.titleClosed}</div>
                  <div class="doc-row-meta">${open ? block.notice.meta : block.notice.metaClosed}</div>
                </div>
              </div>
              <a class="btn btn-secondary btn-md" href="${block.notice.href}">
                ${raw(icon('download', 16))}Download
              </a>
            </div>

            ${open && block.open !== false
              ? html`<a class="btn btn-primary btn-apply" href="${block.apply.href}">${block.apply.label}</a>`
              : html`<button type="button" class="btn btn-primary btn-apply" disabled>
                       ${open ? block.closedApply : admission.closed.applyLabel}
                     </button>`}
          </section>`)}
      </div>

      ${when(open, () => html`
        <div class="admission-notes">
          ${each(admission.notes, (note) => html`
            <div><div class="kicker">${note.heading}</div>${note.text}</div>`)}
        </div>`)}`;
  }
}

define('admission-page', AdmissionPage);
