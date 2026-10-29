/**
 * <admission-banner>
 *
 * The one block on the home page that comes and goes with the calendar. It
 * renders nothing at all when `admissionBanner.active` is false, so the page
 * closes up cleanly outside the admission window.
 *
 * Attributes:
 *   force-on / force-off — override the data toggle (useful for previews)
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { admissionBanner } from '../data/site.js';

class AdmissionBanner extends SiteComponent {
  render() {
    const on = this.boolProp('force-on') ||
      (admissionBanner.active && !this.boolProp('force-off'));
    if (!on) return '';

    return html`
      <section class="admission-banner" aria-label="Admission banner">
        <div class="admission-banner-body">
          <span class="tag tag-invert">${admissionBanner.chip}</span>
          <div>
            <div class="admission-banner-title">${admissionBanner.title}</div>
            <div class="admission-banner-sub">${admissionBanner.sub}</div>
          </div>
        </div>
        <a class="btn btn-invert btn-lg" href="${admissionBanner.cta.href}">
          ${admissionBanner.cta.label}${raw(icon('arrow-right', 16))}
        </a>
      </section>`;
  }
}

define('admission-banner', AdmissionBanner);
