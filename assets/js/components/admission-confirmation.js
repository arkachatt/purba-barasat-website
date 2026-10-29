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
import { loadSubmission, retrySubmission } from '../services/admission.js';
import { downloadApplicationPdf } from '../services/pdf.js';

const formatWhen = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).replace(',', '');
};

class AdmissionConfirmation extends SiteComponent {
  render() {
    const receipt = this.receipt ?? (this.receipt = loadSubmission());
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
              ? html`Thank you. The application for
                     <strong>${receipt.data?.nameEn || '—'}, ${receipt.data?.class || 'Class V'}</strong>
                     was completed on ${when_}. Keep the reference number below — the office will
                     ask for it.`
              : html`This page shows the receipt for an application submitted from this device.
                     If you have just submitted one and it is not shown, please call the office
                     with your reference number.`}
          </p>

          ${when(receipt && !receipt.synced, () => html`
            <state-alert tone="status" heading="Your details were not sent online"
                         action="Try sending again">
              ${receipt.syncError === 'not-configured'
                ? 'The school\'s online register is not connected yet, so this reference was issued by the website.'
                : 'The school\'s server could not be reached, so this reference was issued by the website.'}
              Your application counts once the office receives the printout — please print the PDF
              and bring it in.
            </state-alert>`)}

          ${when(receipt?.pdfFailed, () => html`
            <state-alert tone="error" heading="The PDF could not be generated on this device"
                         action="Try the download again" secondary="Print this page instead">
              Your answers are safe. Try the download again, or print this page and bring it to the
              office with your reference number.
            </state-alert>`)}

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
            ${receipt ? `${receipt.data?.nameEn || '—'} · ${receipt.data?.class || 'Class V'} · ${when_}` : 'No application found on this device'}
          </div>
          <button type="button" class="btn btn-primary btn-lg" data-download
                  ${raw(receipt ? '' : 'disabled')}>
            ${raw(icon('download', 18))}Download application PDF
          </button>
          <p class="login-status" data-status role="status"></p>
          <a class="btn btn-secondary btn-lg" href="index.html">Back to home</a>
        </aside>
      </div>`;
  }

  hydrate() {
    const status = this.querySelector('[data-status]');
    const say = (text, tone) => {
      status.textContent = text || '';
      if (tone) status.dataset.tone = tone; else status.removeAttribute('data-tone');
    };

    this.querySelector('[data-download]')?.addEventListener('click', async (event) => {
      if (!this.receipt) return;
      event.target.disabled = true;
      say('Building your application form…');
      try {
        await downloadApplicationPdf({ receipt: this.receipt });
        say('');
      } catch {
        say('The PDF could not be built on this device. Use your browser\'s Print option and choose “Save as PDF”.', 'error');
      } finally {
        event.target.disabled = false;
      }
    });

    /* The status alert offers to resend; the error alert offers print. */
    this.querySelectorAll('state-alert').forEach((alert) => {
      alert.addEventListener('alert-secondary', () => window.print());
      alert.addEventListener('alert-action', async () => {
        if (!this.receipt) return;
        if (this.receipt.pdfFailed) {
          this.querySelector('[data-download]')?.click();
          return;
        }
        say('Sending your details to the school…');
        const updated = await retrySubmission(this.receipt);
        this.receipt = updated;
        if (updated.synced) { this.update(); say('Your details reached the school office.', 'ok'); }
        else say('Still could not reach the school. The printout is what matters — please bring it in.', 'error');
      });
    });
  }
}

define('admission-confirmation', AdmissionConfirmation);
