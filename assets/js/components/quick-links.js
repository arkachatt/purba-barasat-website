/**
 * <quick-links>
 *
 * Four doors to the sections visitors arrive looking for. Driven by data, so
 * the count is not baked into the markup — the grid reflows on its own.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { quickLinks, features } from '../data/site.js';

class QuickLinks extends SiteComponent {
  render() {
    return html`
      <section class="quick-links" aria-label="Quick links">
        ${each(quickLinks.filter((link) => !link.feature || features[link.feature]), (link) => html`
          <a class="quick-link blueprint" href="${link.href}">
            ${raw(icon(link.icon, 28))}
            <span>
              <span class="quick-link-title">
                <span class="ql-title-long">${link.title}</span>
                <span class="ql-title-short">${link.shortTitle}</span>
              </span>
              <span class="quick-link-sub">${link.bn}<span class="ql-sub-long"> · ${link.sub}</span></span>
            </span>
          </a>`)}
      </section>`;
  }
}

define('quick-links', QuickLinks);
