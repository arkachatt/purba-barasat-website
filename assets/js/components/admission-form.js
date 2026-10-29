/**
 * <admission-form>
 *
 * The five-step online application. Everything it renders — fields, options,
 * validation rules, the review summary — comes from `admissionForm` in
 * data/site.js, so the office can add a question without touching this file.
 *
 * The draft is written to the browser on every change and restored on return;
 * uploads and submission go through services/admission.js, which is stubbed
 * until the school's system is connected.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when, qsa } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { admissionForm } from '../data/site.js';
import {
  validateStep, uploadDocument, UploadError, formatSize,
  loadDraft, saveDraft, draftReference, submitApplication,
} from '../services/admission.js';

const STEPS = admissionForm.steps;

class AdmissionForm extends SiteComponent {
  step = 0;
  data = {};
  docs = {};
  errors = {};
  declared = false;
  savedAt = null;

  connectedCallback() {
    /* Pick up an unfinished application before the first paint. */
    const draft = loadDraft();
    if (draft) {
      this.data = draft.data || {};
      this.docs = draft.docs || {};
      this.step = Math.min(draft.step ?? 0, STEPS.length - 1);
      this.savedAt = draft.savedAt || null;
    }
    /* Seed defaults so what the browser shows and what we hold agree: a
       <select> already displays its first option, so an untouched select is
       answered, not empty. */
    STEPS.forEach((s) => (s.fields || []).forEach((f) => {
      if (this.data[f.name] !== undefined) return;
      if (f.value !== undefined) this.data[f.name] = f.value;
      else if ((f.type === 'select' || f.type === 'seg') && f.options) this.data[f.name] = f.options[0];
    }));
    this.ref = draftReference(draft);
    super.connectedCallback();
  }

  /* ── shell ────────────────────────────────────────────────────────────── */

  render() {
    return html`
      <div class="page-header" style="margin-bottom:36px">
        <div>
          <div class="kicker">
            <span class="login-title-long">${admissionForm.kicker}</span>
            <span class="login-title-short">${admissionForm.titleShort}</span>
          </div>
          <h1 style="font-size:40px">${admissionForm.title}
            <span class="bn" style="font-size:22px">/ ${admissionForm.titleBn}</span></h1>
        </div>
        <div class="page-header-meta" data-draft-note></div>
      </div>

      <div class="form-shell">
        <ol class="stepper">
          ${each(STEPS, (step, i) => html`
            <li class="step-item" data-state="${i === this.step ? 'current' : i < this.step ? 'done' : 'todo'}">
              <span class="step-mark">${i + 1}</span>
              <div>
                <div class="step-name">${step.title}</div>
                <div class="step-sub">${step.titleBn}${when(i === this.step, () => ' · In progress')}</div>
              </div>
            </li>`)}
          <li class="stepper-note">
            Fields marked <span class="req">*</span> are required. Write names exactly as on the
            birth certificate.
          </li>
        </ol>

        <div data-panel></div>
      </div>`;
  }

  hydrate() { this.paintPanel(); }

  /* ── the current step ─────────────────────────────────────────────────── */

  paintPanel() {
    const step = STEPS[this.step];
    const body = step.documents ? this.renderDocuments(step)
      : step.declaration ? this.renderReview(step)
      : this.renderFields(step);

    this.querySelector('[data-panel]').innerHTML = String(html`
      <form class="form-panel blueprint" novalidate>
        <div class="form-panel-head">
          <h2>${this.step + 1}. ${step.title} <span class="bn">/ ${step.titleBn}</span></h2>
          <span class="form-step-count">Step ${this.step + 1} of ${STEPS.length}</span>
        </div>

        <div class="progress" style="--steps:${STEPS.length}">
          ${each(STEPS, (_, i) => html`<span ${raw(i <= this.step ? 'data-done' : '')}></span>`)}
        </div>

        <div data-submit-error></div>

        ${body}

        <div class="form-actions">
          <button type="button" class="btn btn-ghost form-actions-save" data-save>Save draft &amp; exit</button>
          <div class="form-actions-main">
            <button type="button" class="btn btn-secondary" data-back
                    ${raw(this.step === 0 ? 'disabled' : '')}>← Back</button>
            ${this.step === STEPS.length - 1
              ? html`<button type="submit" class="btn btn-primary" data-submit>Submit application</button>`
              : html`<button type="submit" class="btn btn-primary" ${raw(this.canContinue() ? '' : 'disabled')}>
                       Continue${when(STEPS[this.step + 1], () => ` to ${STEPS[this.step + 1].title}`)} →
                     </button>`}
          </div>
        </div>
        ${when(step.documents && !this.canContinue(), () => html`
          <div class="form-foot-note">Continue unlocks when all required documents are uploaded.</div>`)}
      </form>`);

    this.wirePanel();
    this.paintDraftNote();
  }

  renderFields(step) {
    return html`
      <div class="form-grid">
        ${each(step.fields, (field) => this.renderField(field))}
      </div>`;
  }

  renderField(field) {
    const id = `f-${field.name}`;
    const value = this.data[field.name] ?? '';
    const error = this.errors[field.name];
    const classes = ['field', field.half ? 'field-half' : 'field-full', error ? '' : ''].join(' ');

    const control = () => {
      if (field.type === 'select') return html`
        <select class="input" id="${id}" name="${field.name}">
          ${each(field.options, (option) => html`
            <option ${raw(option === value ? 'selected' : '')}>${option}</option>`)}
        </select>`;

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

      if (field.type === 'seg') return html`
        <div class="seg" role="radiogroup" aria-label="${field.label}">
          ${each(field.options, (option) => html`
            <label class="seg-opt">
              <input type="radio" name="${field.name}" value="${option}"
                     ${raw(option === value ? 'checked' : '')}>${option}
            </label>`)}
        </div>`;

      return html`
        <input class="input ${field.bengali ? 'input-bn' : ''}" id="${id}" name="${field.name}"
               type="${field.type === 'date' ? 'date' : field.type === 'tel' ? 'tel' : 'text'}"
               value="${value}" placeholder="${field.placeholder || ''}"
               ${raw(field.inputmode ? `inputmode="${field.inputmode}"` : '')}
               ${raw(field.readonly ? 'readonly' : '')}
               ${raw(error ? 'aria-invalid="true"' : '')}>`;
    };

    return html`
      <div class="${classes}" data-field="${field.name}" ${raw(error ? 'data-invalid' : '')}>
        <label for="${id}">${field.label}${when(field.required, () => html` <span class="req">*</span>`)}</label>
        ${control()}
        ${when(error, () => html`
          <div class="field-error">${raw(icon('alert-circle', 14))}${error}</div>`)}
      </div>`;
  }

  renderDocuments(step) {
    return html`
      <div class="doc-list">
        ${each(step.documents, (doc) => {
          const state = this.docs[doc.name];
          if (!state || state.status === 'empty') return this.renderSlot(doc);
          return html`
            <div class="doc-item blueprint" data-state="${state.status}">
              <div class="doc-item-head">
                <div>
                  <div class="doc-item-name">
                    ${doc.label}${when(doc.required, () => html` <span class="req">*</span>`)}
                  </div>
                  ${state.status === 'error'
                    ? html`<div class="doc-error">${raw(icon('alert-circle', 14))}${state.error}</div>`
                    : html`<div class="doc-item-meta">
                        ${state.fileName} · ${state.size}${when(state.status === 'uploading',
                          () => ` · uploading ${state.progress}%`)}
                      </div>`}
                </div>
                ${state.status === 'uploaded'
                  ? html`<span class="tag tag-accent" style="gap:4px">${raw(icon('check', 12))}Uploaded</span>`
                  : state.status === 'uploading'
                    ? html`<button type="button" class="btn btn-ghost" data-cancel="${doc.name}">Cancel</button>`
                    : ''}
              </div>

              ${when(state.status === 'uploading', () => html`
                <div class="doc-progress"><span style="width:${state.progress}%"></span></div>`)}

              ${when(state.status === 'uploaded', () => html`
                <div class="doc-item-actions">
                  <button type="button" class="btn btn-ghost" data-view="${doc.name}">View</button>
                  <label class="btn btn-ghost" style="position:relative">Replace
                    <input type="file" data-file="${doc.name}"
                           style="position:absolute;opacity:0;width:0;height:0"></label>
                </div>`)}

              ${when(state.status === 'error', () => html`
                <div class="doc-item-actions">
                  <label class="btn btn-secondary" style="flex:1;position:relative">Choose a smaller file
                    <input type="file" data-file="${doc.name}"
                           style="position:absolute;opacity:0;width:0;height:0"></label>
                </div>`)}
            </div>`;
        })}
      </div>`;
  }

  renderSlot(doc) {
    return html`
      <label class="doc-slot blueprint">
        ${raw(icon('upload', 26))}
        <div class="doc-item-name">
          ${doc.label}${doc.required ? raw(' <span class="req">*</span>') : ''}
          ${when(doc.note, () => html`<span class="doc-slot-note">${doc.note}</span>`)}
        </div>
        <div class="doc-item-meta">
          ${doc.hint || `JPG or PDF, under ${admissionForm.maxUploadMb} MB`}
        </div>
        <input type="file" data-file="${doc.name}"
               accept="${admissionForm.acceptedTypes.join(',')}">
      </label>`;
  }

  renderReview(step) {
    return html`
      <div class="review-list">
        ${each(STEPS.slice(0, 4), (source, i) => html`
          <section class="blueprint">
            <div class="review-head">
              <span class="review-title">${i + 1} · ${source.reviewTitle}</span>
              <a href="#" data-goto="${i}">Edit</a>
            </div>
            ${source.documents
              ? html`<div class="review-docs">
                  ${each(source.documents.filter((d) => this.docs[d.name]?.status === 'uploaded'),
                    (d) => html`<span>✓ ${d.label}</span>`)}
                  ${when(!source.documents.some((d) => this.docs[d.name]?.status === 'uploaded'),
                    () => html`<span class="text-muted">No documents uploaded</span>`)}
                </div>`
              : html`<dl>
                  ${each(source.review, ([term, keys]) => html`
                    <dt>${term}</dt><dd>${this.reviewValue(keys)}</dd>`)}
                </dl>`}
          </section>`)}

        <label class="radio declaration">
          <input type="checkbox" data-declare ${raw(this.declared ? 'checked' : '')}>
          <span class="dot"></span>${step.declaration}
        </label>
      </div>`;
  }

  /** "nameEn+nameBn" → the two values joined, skipping blanks. */
  reviewValue(keys) {
    const parts = keys.split('+').map((key) => this.data[key]).filter(Boolean);
    return parts.length ? parts.join(' · ') : '—';
  }

  /* ── behaviour ────────────────────────────────────────────────────────── */

  wirePanel() {
    const form = this.querySelector('form.form-panel');

    form.addEventListener('input', (event) => {
      const input = event.target;
      if (!input.name) return;
      this.data[input.name] = input.type === 'checkbox' ? input.checked : input.value;
      if (this.errors[input.name]) {
        delete this.errors[input.name];
        const field = input.closest('.field');
        if (field) {
          delete field.dataset.invalid;
          field.querySelector('.field-error')?.remove();
          input.removeAttribute('aria-invalid');
        }
      }
      this.persist();
    });
    form.addEventListener('change', (event) => {
      if (event.target.name) { this.data[event.target.name] = event.target.value; this.persist(); }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (this.step === STEPS.length - 1) this.submit();
      else this.next();
    });

    this.querySelector('[data-back]').addEventListener('click', () => {
      if (this.step > 0) { this.step -= 1; this.errors = {}; this.persist(); this.update(); }
    });
    this.querySelector('[data-save]').addEventListener('click', () => {
      this.persist();
      window.location.href = 'admission.html';
    });

    qsa('[data-goto]', this).forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      this.step = Number(link.dataset.goto);
      this.update();
    }));

    qsa('[data-file]', this).forEach((input) =>
      input.addEventListener('change', () => this.receiveFile(input.dataset.file, input.files[0])));

    qsa('[data-cancel]', this).forEach((button) =>
      button.addEventListener('click', () => {
        this.docs[button.dataset.cancel] = { status: 'empty' };
        this.paintPanel();
      }));

    qsa('[data-view]', this).forEach((button) =>
      button.addEventListener('click', () => {
        const state = this.docs[button.dataset.view];
        if (state?.objectUrl) window.open(state.objectUrl, '_blank', 'noopener');
      }));

    const declare = this.querySelector('[data-declare]');
    if (declare) declare.addEventListener('change', () => {
      this.declared = declare.checked;
      this.querySelector('[data-submit]').disabled = !this.declared;
    });
    if (this.querySelector('[data-submit]')) {
      this.querySelector('[data-submit]').disabled = !this.declared;
    }
  }

  /** Required documents all uploaded? Gates the Continue button on step 4. */
  canContinue() {
    const step = STEPS[this.step];
    if (!step.documents) return true;
    return step.documents
      .filter((doc) => doc.required)
      .every((doc) => this.docs[doc.name]?.status === 'uploaded');
  }

  next() {
    const step = STEPS[this.step];
    this.errors = validateStep(step, this.data);
    if (Object.keys(this.errors).length) {
      this.paintPanel();
      this.querySelector('[data-invalid] .input')?.focus();
      return;
    }
    this.step += 1;
    this.persist();
    this.update();
    this.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  async receiveFile(name, file) {
    if (!file) return;
    const doc = STEPS.find((s) => s.documents)?.documents.find((d) => d.name === name);

    this.docs[name] = { status: 'uploading', fileName: file.name, size: formatSize(file.size), progress: 0 };
    this.paintPanel();

    try {
      await uploadDocument(
        file,
        { maxMb: admissionForm.maxUploadMb, accept: admissionForm.acceptedTypes },
        (progress) => {
          if (this.docs[name]?.status !== 'uploading') return;   // cancelled
          this.docs[name].progress = progress;
          this.paintPanel();
        },
      );
      if (this.docs[name]?.status !== 'uploading') return;
      this.docs[name] = {
        status: 'uploaded', fileName: file.name, size: formatSize(file.size),
        objectUrl: URL.createObjectURL(file),
      };
    } catch (error) {
      this.docs[name] = {
        status: 'error', fileName: file.name, size: formatSize(file.size),
        error: error instanceof UploadError ? error.message : 'Upload failed. Try again.',
      };
    }
    this.persist();
    this.paintPanel();
  }

  async submit() {
    if (!this.declared) return;
    const button = this.querySelector('[data-submit]');
    const slot = this.querySelector('[data-submit-error]');
    slot.innerHTML = '';
    button.disabled = true;
    try {
      await submitApplication({ data: this.data, documents: this.docs });
      window.location.href = 'admission-submitted.html';
    } catch {
      /* The draft is already on disk, so the honest message is "nothing is
         lost" plus the reference they can come back with. */
      button.disabled = false;
      slot.innerHTML = String(html`
        <state-alert tone="error" heading="Your application could not be submitted"
                     action="Try again" secondary="Save and exit">
          The server did not respond. Your answers are saved as a draft (Ref. ${this.ref}) —
          nothing is lost. Try again, or come back later and resume from the Admission page.
          <span class="bn">আপনার তথ্য সংরক্ষিত আছে।</span>
        </state-alert>`);
      const alert = slot.querySelector('state-alert');
      alert.addEventListener('alert-action', () => this.submit());
      alert.addEventListener('alert-secondary', () => {
        this.persist();
        window.location.href = 'admission.html';
      });
      slot.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  /* Drafts keep only what survives a reload: files cannot be serialised, so a
     document's status is remembered but its blob is not. */
  persist() {
    const docs = Object.fromEntries(Object.entries(this.docs).map(([key, value]) => {
      const { objectUrl, ...rest } = value;
      return [key, rest];
    }));
    this.savedAt = Date.now();
    saveDraft({ step: this.step, data: this.data, docs, ref: this.ref });
    this.paintDraftNote();
  }

  paintDraftNote() {
    const note = this.querySelector('[data-draft-note]');
    if (!note) return;
    const saved = this.savedAt ? `Draft saved ${relativeTime(this.savedAt)}` : 'Draft not saved yet';
    note.innerHTML = String(html`${saved} · Ref.
      <span style="font-variant-numeric:tabular-nums">${this.ref}</span>`);
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
