/**
 * <notice-list limit="4" heading="Notices">
 *
 * The school's circulars. Rows are links, not accordions: a notice usually
 * ends in a PDF, and a parent on a phone should reach it in one tap.
 *
 * Attributes:
 *   limit    — how many rows to show (default: all)
 *   all-href — target of the "view all" link
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each } from '../core/dom.js';
import { notices } from '../data/site.js';

class NoticeList extends SiteComponent {
  render() {
    const limit = Number(this.prop('limit', 0));
    const rows = limit > 0 ? notices.slice(0, limit) : notices;
    const allHref = this.prop('all-href', 'notice.html');

    return html`
      <section aria-label="Announcements">
        <div class="section-head">
          <h2>Notices <span class="bn">/ বিজ্ঞপ্তি</span></h2>
          <a href="${allHref}">View all notices →</a>
        </div>
        <div class="notice-list">
          ${each(rows, (notice) => html`
            <a class="notice" href="${notice.href}">
              <span class="notice-date">${notice.day}<span class="notice-year">${notice.year}</span></span>
              <span class="notice-text">${notice.text}</span>
              <span class="tag tag-${notice.tone === 'accent' ? 'accent' : 'neutral'}">${notice.tag}</span>
            </a>`)}
        </div>
      </section>`;
  }
}

define('notice-list', NoticeList);
