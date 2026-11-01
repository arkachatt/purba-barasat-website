/**
 * <contact-page>
 *
 * Address, phone, email and hours beside an enquiry form. The form is built
 * from `contact.enquiry.fields` and validated by the same rules the admission
 * form uses, so a phone number is checked the same way everywhere.
 *
 * The form sits behind `features.enquiry`. With it off the address column
 * takes the whole width (`.is-plain`) and the map moves beside the details,
 * so the page is not a narrow column next to a void.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when, qsa } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { contact, school, features } from '../data/site.js';
import { validateStep } from '../services/admission.js';
import { sendEnquiry, EnquiryError } from '../services/enquiry.js';

class ContactPage extends SiteComponent {
  data = {};
  errors = {};

  render() {
    return html`
      <div class="contact-split ${features.enquiry ? '' : 'is-plain'}">
        <div class="contact-info">
          <dl class="contact-list">
            ${each(contact.details, (item) => html`
              <div class="contact-item">
                ${raw(icon(item.icon, 22))}
                <div>
                  <dt>${item.term}</dt>
                  <dd>${raw(item.lines.join('<br>'))}</dd>
                </div>
              </div>`)}
          </dl>

          <div class="contact-map-wrap">
            <div class="blueprint contact-map">
              ${contact.map.embed
                ? raw(`<iframe src="${contact.map.embed}" loading="lazy"
                         title="Map showing ${school.name}, ${school.district}"
                         referrerpolicy="no-referrer-when-downgrade"></iframe>`)
                : html`
                  <div class="contact-map-plate">
                    ${raw(icon('map-pin', 26))}
                    <span>${contact.map.label}</span>
                    <a href="${contact.map.link.href}">${contact.map.link.label}</a>
                  </div>`}
            </div>
            ${when(contact.map.embed, () => html`
              <p class="contact-map-link">
                ${raw(icon('external-link', 15))}<a href="${contact.map.link.href}">${contact.map.link.label}</a>
              </p>`)}
          </div>
        </div>

        ${when(features.enquiry, () => html`
        <form class="blueprint enquiry-form" novalidate>
          <div>
            <h2>${contact.enquiry.title} <span class="bn">/ ${contact.enquiry.titleBn}</span></h2>
            <p class="enquiry-intro">${contact.enquiry.intro}</p>
          </div>

          <div class="enquiry-grid" data-fields></div>

          <p class="login-status" data-status role="status"></p>

          <div class="enquiry-foot">
            <span class="enquiry-privacy">${contact.enquiry.privacy}</span>
            <button type="submit" class="btn btn-primary btn-lg">${contact.enquiry.submit}</button>
          </div>
        </form>`)}
      </div>`;
  }

  hydrate() {
    const form = this.querySelector('form');
    if (!form) return;                               // the enquiry form is switched off

    this.paintFields();

    form.addEventListener('input', (event) => {
      if (!event.target.name) return;
      this.data[event.target.name] = event.target.value;
      if (this.errors[event.target.name]) { delete this.errors[event.target.name]; this.paintFields(); }
    });
    form.addEventListener('change', (event) => {
      if (event.target.name) this.data[event.target.name] = event.target.value;
    });
    form.addEventListener('submit', (event) => { event.preventDefault(); this.send(); });
  }

  paintFields() {
    this.querySelector('[data-fields]').innerHTML = String(
      each(contact.enquiry.fields, (field) => {
        const id = `enq-${field.name}`;
        const value = this.data[field.name] ?? '';
        const error = this.errors[field.name];

        const control = field.type === 'select'
          ? html`<select class="input" id="${id}" name="${field.name}">
                   ${each(field.options, (option) => html`
                     <option ${raw(option === value ? 'selected' : '')}>${option}</option>`)}
                 </select>`
          : field.type === 'textarea'
            ? html`<textarea class="input" id="${id}" name="${field.name}"
                             placeholder="${field.placeholder || ''}">${value}</textarea>`
            : html`<input class="input" id="${id}" name="${field.name}" type="${field.type}"
                          value="${value}" ${raw(error ? 'aria-invalid="true"' : '')}>`;

        return html`
          <div class="field ${field.half ? '' : 'field-full'}" data-field="${field.name}"
               ${raw(error ? 'data-invalid' : '')}>
            <label for="${id}">${field.label}${when(field.required, () => html` <span class="req">*</span>`)}</label>
            ${control}
            ${when(error, () => html`<div class="field-error">${raw(icon('alert-circle', 14))}${error}</div>`)}
          </div>`;
      }));

    /* Selects show their first option, so treat that as the answer. */
    qsa('select', this).forEach((select) => { this.data[select.name] ??= select.value; });
  }

  async send() {
    const status = this.querySelector('[data-status]');
    status.textContent = '';
    status.removeAttribute('data-tone');

    this.errors = validateStep({ fields: contact.enquiry.fields }, this.data);
    if (Object.keys(this.errors).length) {
      this.paintFields();
      this.querySelector('[data-invalid] .input')?.focus();
      return;
    }

    const button = this.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      await sendEnquiry(this.data);
      status.textContent = 'Thank you — your enquiry has been sent. The office replies within 3 working days.';
      status.dataset.tone = 'ok';
    } catch (error) {
      status.textContent = error instanceof EnquiryError
        ? error.message : 'Could not send the enquiry. Please try again.';
      status.dataset.tone = 'error';
    } finally {
      button.disabled = false;
    }
  }
}

define('contact-page', ContactPage);
