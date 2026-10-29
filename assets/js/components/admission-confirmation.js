/**
 * <admission-confirmation>
 *
 * The receipt. It reads what services/admission.js stored on submit; arriving
 * here directly (a bookmarked link, a new tab) shows the same layout with the
 * fields it cannot know left as dashes rather than inventing a reference.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { admissionConfirmation } from '../data/site.js';
import { loadSubmission } from '../services/admission.js';

const formatWhen = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).replace(',', '');
};

class AdmissionConfirmation extends SiteComponent {
  render() {
    const receipt = loadSubmission();
    const when_ = receipt ? formatWhen(receipt.submittedAt) : '—';

    return html`
      <div class="confirmation">
        <div style="display:flex;flex-direction:column;gap:24px">
          <div class="confirmation-head">
            <span class="confirmation-mark blueprint">${raw(icon('check', 32))}</span>
            <div>
              <h1>${admissionConfirmation.title}</h1>
              <div class="confirmation-head-bn">${admissionConfirmation.titleBn}</div>
            </div>
          </div>

          <p class="confirmation-lede">
            ${receipt
              ? html`Thank you. Your application for <strong>${receipt.name}, ${receipt.class}</strong>
                     was received on ${when_}. An SMS with the reference number has been sent to
                     ${receipt.mobile}.`
              : html`This page shows the receipt for an application submitted from this device.
                     If you have just submitted one and it is not shown, please call the office
                     with your reference number.`}
          </p>

          ${when(receipt?.pending, () => html`
            <div class="note blueprint">
              ${raw(icon('info', 20))}
              <span>The school's application system is not connected yet, so this reference was
                    issued by the website. Bring the printout to the office to have it registered.</span>
            </div>`)}

          <h2 style="font-size:26px;margin:8px 0 0">What happens next</h2>
          <ol class="confirmation-next">
            ${each(admissionConfirmation.next, (item) => html`
              <li><div class="confirmation-next-title">${item.title}</div>${item.text}</li>`)}
          </ol>
        </div>

        <aside class="confirmation-aside blueprint">
          <div class="kicker">Application reference</div>
          <div class="confirmation-ref">${receipt ? receipt.reference : '—'}</div>
          <div class="confirmation-ref-meta">
            ${receipt ? `${receipt.name} · ${receipt.class} · ${when_}` : 'No application found on this device'}
          </div>
          <button type="button" class="btn btn-primary btn-lg" data-print>
            ${raw(icon('download', 18))}Download application PDF
          </button>
          <a class="btn btn-secondary btn-lg" href="index.html">Back to home</a>
        </aside>
      </div>`;
  }

  hydrate() {
    /* Until there is a server to render the PDF, the browser's own
       "Save as PDF" print target is the honest way to produce one. */
    this.querySelector('[data-print]').addEventListener('click', () => window.print());
  }
}

define('admission-confirmation', AdmissionConfirmation);
