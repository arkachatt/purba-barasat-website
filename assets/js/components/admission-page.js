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

/**
 * The notice-and-button pairs a block offers.
 *
 * Block A runs two mediums and names them; Block B runs one and does not, so
 * it keeps its plain `notice` / `apply` pair and needs no data of its own
 * here. The untitled single stream renders exactly the markup it always did.
 */
/**
 * Whether a notice has a real file behind it.
 *
 * A placeholder href is still '#pdf'; putting `download` on that would save
 * the admission page itself under the name "pdf", which looks like a working
 * button right up to the moment the guardian opens the file.
 */
function hasFile(notice) {
  return Boolean(notice.href) && !notice.href.startsWith('#');
}

function streamsOf(block) {
  return block.streams || [{ notice: block.notice, apply: block.apply }];
}

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

            <div class="admission-streams">
              ${each(streamsOf(block), (stream) => html`
                <div class="admission-stream">
                  ${when(stream.title, () => html`
                    <div class="admission-stream-title">${stream.title}</div>`)}

                  <div class="doc-row">
                    <div class="doc-row-main">
                      ${raw(icon('file-text', 22))}
                      <div>
                        <div class="doc-row-title">${open ? stream.notice.title : stream.notice.titleClosed}</div>
                        <div class="doc-row-meta">${open ? stream.notice.meta : stream.notice.metaClosed}</div>
                      </div>
                    </div>
                    <a class="btn btn-secondary btn-md" href="${stream.notice.href}"
                       ${raw(hasFile(stream.notice) ? 'download' : '')}>
                      ${raw(icon('download', 16))}Download
                    </a>
                  </div>

                  ${open && block.open !== false
                    ? html`<a class="btn btn-primary btn-apply" href="${stream.apply.href}">${stream.apply.label}</a>`
                    : html`<button type="button" class="btn btn-primary btn-apply" disabled>
                             ${open ? block.closedApply : admission.closed.applyLabel}
                           </button>`}
                </div>`)}
            </div>
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
