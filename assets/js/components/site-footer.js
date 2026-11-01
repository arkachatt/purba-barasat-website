/**
 * <site-footer>
 *
 * Identity, contact, quick links and the affiliation statement. The legal rule
 * below carries the DISE code and the "last updated" date the office is
 * required to show.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { school, footerLinks, affiliation, features } from '../data/site.js';

class SiteFooter extends SiteComponent {
  render() {
    const year = new Date().getFullYear();
    return html`
      <footer class="site-footer">
        <div class="footer-grid">
          <div class="footer-col footer-col--brand">
            ${when(school.logo, () => html`
              <img class="footer-mark" src="${school.logo}" alt="" width="56" height="56">`)}
            <span class="footer-name">${school.name}</span>
            <span class="footer-name-bn">${school.nameBn}</span>
            <address class="footer-address">
              ${raw(school.address.join('<br>'))}
            </address>
          </div>

          <div class="footer-col">
            <span class="footer-kicker">Contact · যোগাযোগ</span>
            ${each(school.phones, (line, i) => html`
              <a class="footer-contact" href="${line.href}">
                ${raw(i === 0 ? icon('phone', 16) : '<span style="width:16px"></span>')}${line.label}
              </a>`)}
            <a class="footer-contact" href="${school.email.href}">${raw(icon('mail', 16))}${school.email.label}</a>
            <span class="footer-hours">${school.officeHours}</span>
          </div>

          <div class="footer-col">
            <span class="footer-kicker">Quick links</span>
            <div class="footer-links">
              ${each(footerLinks.filter((link) => !link.feature || features[link.feature]),
                     (link) => html`<a href="${link.href}">${link.label}</a>`)}
            </div>
          </div>

          <div class="footer-col">
            <span class="footer-kicker">Affiliation</span>
            <span class="footer-affiliation blueprint">${raw(affiliation)}</span>
          </div>
        </div>

        <div class="footer-legal">
          <span>© ${year} ${school.name} · DISE code ${school.diseCode}</span>
          <span>Content maintained by the school office · Last updated ${school.lastUpdated}</span>
        </div>
      </footer>`;
  }
}

define('site-footer', SiteFooter);
