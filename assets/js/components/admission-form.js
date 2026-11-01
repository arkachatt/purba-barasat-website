/**
 * <admission-form>
 *
 * One page, five groups of questions, one submit. Everything it renders —
 * fields, options, validation, the printed PDF and the spreadsheet columns —
 * comes from `admissionForm.groups` in data/site.js, so adding a question is
 * one object there and nothing else.
 *
 * Which medium it is collecting for comes from `?medium=` on the URL. The two
 * mediums write to different registers with different serial numbers, so this
 * is never guessed: with no usable medium the page offers a choice instead of
 * a form, because filing a child in the wrong register cannot be undone.
 *
 * Submitting does three things in order: send the answers to the school's
 * sheet, build the PDF, then hand over to the confirmation page. The PDF is
 * produced whatever the network does — it is what the guardian carries to
 * school, so it must not depend on a server answering.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when, qsa } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { admissionStreams, admissionWindow, formFor } from '../data/site.js';
import {
  validateAll, allFields, loadDraft, saveDraft, clearDraft, draftReference,
  newClientRef, submitApplication, saveSubmission, admissionWindowState,
} from '../services/admission.js';
import { downloadApplicationPdf, loadJsPdf } from '../services/pdf.js';

class AdmissionForm extends SiteComponent {
  data = {};
  errors = {};
  declared = false;
  savedAt = null;
  submitting = false;

  connectedCallback() {
    const asked = this.prop('medium') || new URLSearchParams(location.search).get('medium');
    this.medium = admissionStreams[asked] ? asked : null;
    if (!this.medium) { super.connectedCallback(); return; }
    this.form = formFor(this.medium);

    const draft = loadDraft(this.medium);
    if (draft) {
      this.data = draft.data || {};
      this.savedAt = draft.savedAt || null;
    }
    /* Seed defaults so what the browser shows and what we hold agree: a
       <select> already displays its first option, so an untouched select is
       answered, not empty. */
    allFields(this.form).forEach((field) => {
      if (this.data[field.name] !== undefined) return;
      if (field.value !== undefined) this.data[field.name] = field.value;
      else if (field.type === 'select' && field.options) this.data[field.name] = field.options[0];
    });
    /* A draft saved while a class was still open can carry one that has since
       been closed. The select cannot show a disabled option as chosen, so
       move the answer to where the select actually is — otherwise the form
       would reject a class the applicant can no longer see. */
    allFields(this.form).forEach((field) => {
      const closed = field.disabledOptions || [];
      if (!closed.includes(this.data[field.name])) return;
      this.data[field.name] = field.value ?? field.options.find((o) => !closed.includes(o));
    });
    /* Carried with the answers so the receipt, and therefore the PDF and the
       confirmation page, know their own medium without being told again. */
    this.data.medium = this.medium;
    this.ref = draftReference(draft, this.medium);
    this.clientRef = draft?.clientRef || newClientRef();
    super.connectedCallback();
  }

  /* ── markup ───────────────────────────────────────────────────────────── */

  /** 'before' | 'open' | 'after', read once per render. */
  get windowState() { return admissionWindowState(); }
  get frozen() { return this.windowState !== 'open'; }

  /**
   * The panel above a frozen form. The dates are the notice's own, and the
   * closed state points at the office counter rather than stopping dead —
   * printed forms are still taken there after the online form shuts.
   */
  renderWindowNotice() {
    const before = this.windowState === 'before';
    return html`
      <state-alert tone="status" icon="${before ? 'calendar' : 'info'}"
                   heading="${before
                     ? `The form opens on ${admissionWindow.opensLabel}`
                     : `Online applications closed on ${admissionWindow.closesLabel}`}">
        ${before
          ? html`Please come back on ${admissionWindow.opensLabel}. Every question is below so
                 you can see what will be asked and have the papers ready, but nothing can be
                 filled in or sent until the form opens.`
          : html`The online form closed at midnight on ${admissionWindow.closesLabel}. The school
                 office counter takes printed forms and documents ${admissionWindow.counterLabel}.`}
      </state-alert>`;
  }

  render() {
    if (!this.medium) return this.renderChooser();

    const form = this.form;
    const errorCount = Object.keys(this.errors).length;

    return html`
      <div class="page-header" style="margin-bottom:28px">
        <div>
          <div class="kicker">${form.kicker}</div>
          <h1 style="font-size:40px">${form.title}
            <span class="bn" style="font-size:22px">/ ${form.titleBn}</span></h1>
        </div>
        <div class="page-header-meta">
          <span data-draft-note></span>
          <button type="button" class="btn btn-ghost form-discard" data-discard hidden>Discard draft</button>
        </div>
      </div>

      ${when(this.frozen, () => this.renderWindowNotice())}

      <div class="form-shell">
        <aside class="form-aside">
          <p class="form-aside-intro">${form.intro}</p>
          <p class="form-aside-note">
            Fields marked <span class="req">*</span> are required; those marked
            <span class="opt">(optional)</span> may be left empty. Write names exactly as on
            the birth certificate.
          </p>
          <p class="form-aside-errors" data-error-count ${raw(errorCount ? '' : 'hidden')}>
            ${raw(icon('alert-circle', 14))}<span></span>
          </p>
        </aside>

        <form class="form-panel blueprint" novalidate>
          ${each(form.groups, (group) => html`
            <fieldset class="form-group" ${raw(this.frozen ? 'disabled' : '')}>
              <legend>${group.title} <span class="bn">/ ${group.titleBn}</span></legend>
              ${when(group.note, () => html`<p class="form-group-note">${group.note}</p>`)}
              <div class="form-grid">
                ${each(group.fields, (field) => this.renderField(field))}
              </div>
            </fieldset>`)}

          <label class="radio declaration">
            <input type="checkbox" data-declare ${raw(this.declared ? 'checked' : '')}
                   ${raw(this.frozen ? 'disabled' : '')}>
            <span class="dot"></span>${form.declaration}
          </label>

          <div data-submit-error></div>

          <!-- No save-draft-and-exit button: every keystroke is already
               saved by the input and change handlers, so offering to do it
               suggested the draft was lost without one. The note above says
               when it was last saved, and Discard draft wipes it. -->
          <div class="form-actions">
            <div class="form-actions-main">
              <button type="submit" class="btn btn-primary" data-submit
                      ${raw(this.frozen ? 'disabled' : '')}>
                ${raw(icon('download', 16))}${this.frozen
                  ? (this.windowState === 'before'
                      ? `Opens ${admissionWindow.opensLabel}`
                      : 'Online applications closed')
                  : form.submitLabel}
              </button>
            </div>
          </div>
          <p class="form-busy" data-busy role="status" aria-live="polite"></p>
          <p class="form-foot-note">
            ${this.frozen
              ? (this.windowState === 'before'
                  ? html`This form is read-only until it opens; nothing typed into it would be kept.`
                  : html`This form is read-only now that it has closed; nothing typed into it
                         would be kept.`)
              : html`Submitting downloads a PDF of this form. Print it, sign it, and bring it to
                     the school office with the original documents.`}
          </p>
        </form>
      </div>`;
  }

  /**
   * Shown when the URL names no medium, or names one we do not run.
   *
   * Picking one for them would mean a child's application landing in the
   * wrong register and taking a serial number out of the wrong sequence —
   * neither of which the office can undo from the printout. Two buttons are
   * cheaper than that.
   */
  renderChooser() {
    return html`
      <div class="page-header" style="margin-bottom:28px">
        <div>
          <div class="kicker">Admission · Session 2027</div>
          <h1 style="font-size:40px">Which medium are you applying for?
            <span class="bn" style="font-size:22px">/ কোন মাধ্যম?</span></h1>
        </div>
      </div>
      <section class="blueprint form-chooser">
        <p>The two mediums are admitted separately, each with its own
           application form and its own register. Choose the one you want.</p>
        ${each(Object.values(admissionStreams), (stream) => html`
          <a class="btn btn-primary btn-apply" href="admission-form.html?medium=${stream.id}">
            ${stream.label} <span class="bn">/ ${stream.labelBn}</span>
          </a>`)}
      </section>`;
  }

  renderField(field) {
    const id = `f-${field.name}`;
    const value = this.data[field.name] ?? '';
    const error = this.errors[field.name];

    const control = () => {
      /* A single-option select is read-only; individual options can also be
         greyed (`disabledOptions`) for a class the school lists but is not
         admitting to this session. The option keeps its plain value, so if it
         is ever opened the stored answer does not change shape. */
      if (field.type === 'select') {
        const closed = field.disabledOptions || [];
        return html`
          <select class="input" id="${id}" name="${field.name}"
                  ${raw(field.options.length === 1 ? 'disabled' : '')}>
            ${each(field.options, (option) => closed.includes(option)
              ? html`<option value="${option}" disabled>${option} — not this session</option>`
              : html`<option ${raw(option === value ? 'selected' : '')}>${option}</option>`)}
          </select>`;
      }

      if (field.type === 'textarea') return html`
        <textarea class="input" id="${id}" name="${field.name}"
                  placeholder="${field.placeholder || ''}">${value}</textarea>`;

      if (field.type === 'radio') return html`
        <div class="radio-row">
          ${each(field.options, (option) => html`
            <label class="radio">
              <input type="radio" name="${field.name}" value="${option}"
                     ${raw(option === value ? 'checked' : '')}><span class="dot"></span>${option}
            </label>`)}
        </div>`;

      /* A date of birth is bounded by the window its class publishes, so the
         picker itself will not offer a date the form would then refuse. The
         bounds follow the class — see `paintDobRange`. */
      const range = field.name === 'dob' ? this.dobRange() : null;
      return html`
        <input class="input ${field.bengali ? 'input-bn' : ''}" id="${id}" name="${field.name}"
               type="${field.type === 'date' ? 'date' : field.type === 'tel' ? 'tel' : 'text'}"
               value="${value}" placeholder="${field.placeholder || ''}"
               ${raw(range ? `min="${range.from}" max="${range.to}"` : '')}
               ${raw(field.inputmode ? `inputmode="${field.inputmode}"` : '')}
               ${raw(field.readonly ? 'readonly' : '')}
               ${raw(error ? 'aria-invalid="true"' : '')}>`;
    };

    return html`
      <div class="field ${field.half ? 'field-half' : 'field-full'}" data-field="${field.name}"
           ${raw(error ? 'data-invalid' : '')}>
        <label for="${id}">${field.label}${field.required
          ? html` <span class="req">*</span>`
          : html` <span class="opt">(optional)</span>`}</label>
        ${control()}
        ${when(error, () => html`
          <div class="field-error">${raw(icon('alert-circle', 14))}${error}</div>`)}
      </div>`;
  }

  /* ── behaviour ────────────────────────────────────────────────────────── */

  hydrate() {
    const form = this.querySelector('form');
    if (!form) return;                       /* the chooser has nothing to wire */

    /* Clear a field's error where it stands rather than re-rendering, so the
       caret and focus survive typing. */
    form.addEventListener('input', (event) => {
      const input = event.target;
      if (!input.name) return;
      this.data[input.name] = input.value;
      if (this.errors[input.name]) {
        delete this.errors[input.name];
        const field = input.closest('.field');
        if (field) {
          delete field.dataset.invalid;
          field.querySelector('.field-error')?.remove();
          input.removeAttribute('aria-invalid');
        }
        this.paintErrorCount();
      }
      this.persist();
    });
    form.addEventListener('change', (event) => {
      const input = event.target;
      if (!input.name) return;
      this.data[input.name] = input.value;
      /* A select or radio never fires `input` in every browser, so its error
         has to be cleared here too — otherwise correcting the class, or the
         last class passed, leaves its message sitting under a right answer. */
      if (this.errors[input.name]) {
        delete this.errors[input.name];
        const field = input.closest('.field');
        if (field) {
          delete field.dataset.invalid;
          field.querySelector('.field-error')?.remove();
          input.removeAttribute('aria-invalid');
        }
        this.paintErrorCount();
      }
      if (input.name === 'class') this.paintDobRange();
      this.persist();
    });
    form.addEventListener('submit', (event) => { event.preventDefault(); this.submit(); });

    /* An abandoned draft holds a child's Aadhaar on what may be a shared
       phone, so there is always a way to wipe it. */
    this.querySelector('[data-discard]').addEventListener('click', () => {
      clearDraft(this.medium);
      this.data = { medium: this.medium };
      this.errors = {};
      this.declared = false;
      this.savedAt = null;
      this.update();
    });

    const declare = this.querySelector('[data-declare]');
    const submit = this.querySelector('[data-submit]');
    declare.addEventListener('change', () => {
      this.declared = declare.checked;
      submit.disabled = !this.declared || this.submitting;
    });
    submit.disabled = !this.declared;

    this.paintErrorCount();
    this.paintDraftNote();
    this.paintDobRange();
  }

  setBusy(message) {
    const busy = this.querySelector('[data-busy]');
    if (busy) busy.textContent = message || '';
    const submit = this.querySelector('[data-submit]');
    if (submit) submit.disabled = this.submitting || !this.declared;
  }

  async submit() {
    if (this.submitting || !this.declared) return;
    /* A tab left open across either edge of the window: re-render, which
       freezes the fields and explains, rather than posting into a closed
       register. */
    if (this.frozen) { this.update(); return; }

    this.errors = validateAll(this.data, this.form);
    if (Object.keys(this.errors).length) {
      this.update();
      this.querySelector('[data-invalid] .input, [data-invalid] input')?.focus();
      return;
    }

    this.submitting = true;
    this.setBusy('Preparing your application…');

    /* Fetch the PDF library while the sheet write is in flight, so the slow
       path is one round trip rather than two. */
    const pdfReady = loadJsPdf().catch(() => null);

    this.setBusy('Sending your details to the school…');
    let receipt;
    try {
      receipt = await submitApplication({
        data: this.data, clientRef: this.clientRef, medium: this.medium,
      });
    } catch {
      /* The only thing submitApplication refuses outright is a closed
         window, and the clock can cross it between the click and here. */
      this.submitting = false;
      this.setBusy('');
      this.update();
      return;
    }

    this.setBusy('Building your application form…');
    try {
      if (!(await pdfReady)) throw new Error('unavailable');
      await downloadApplicationPdf({ receipt });
    } catch {
      /* The answers are already stored, so the confirmation page can offer
         the download again — carry on rather than losing the submission. */
      receipt.pdfFailed = true;
      saveSubmission(receipt);
    }

    window.location.href = 'admission-submitted.html';
  }

  persist() {
    this.savedAt = Date.now();
    saveDraft(this.medium, { data: this.data, ref: this.ref, clientRef: this.clientRef });
    this.paintDraftNote();
  }

  /* The count lives beside the fields rather than in them, so clearing an
     error in place has to move it too: an applicant who has just fixed the
     last one should not still be told something needs attention. */
  /** The birth-date window published for the class currently chosen. */
  dobRange() {
    return this.form?.dobRanges?.[this.data.class] || null;
  }

  /* Changing the class changes which dates the picker will offer. The field
     is not re-rendered — that would take the focus — so the bounds are moved
     on the element in place. */
  paintDobRange() {
    const input = this.querySelector('input[name="dob"]');
    if (!input) return;
    const range = this.dobRange();
    if (range) { input.min = range.from; input.max = range.to; }
    else { input.removeAttribute('min'); input.removeAttribute('max'); }
  }

  paintErrorCount() {
    const note = this.querySelector('[data-error-count]');
    if (!note) return;
    const count = Object.keys(this.errors).length;
    note.hidden = !count;
    note.querySelector('span').textContent =
      ` ${count} ${count === 1 ? 'field needs' : 'fields need'} attention.`;
  }

  paintDraftNote() {
    const note = this.querySelector('[data-draft-note]');
    if (!note) return;
    const saved = this.savedAt ? `Draft saved ${relativeTime(this.savedAt)}` : 'Draft not saved yet';
    note.innerHTML = String(html`${saved} · Ref.
      <span style="font-variant-numeric:tabular-nums">${this.ref}</span>`);
    const discard = this.querySelector('[data-discard]');
    if (discard) discard.hidden = !this.savedAt;
  }
}

function relativeTime(timestamp) {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.round(minutes / 60)} h ago`;
}

define('admission-form', AdmissionForm);
