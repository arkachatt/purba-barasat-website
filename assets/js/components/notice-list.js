/**
 * <notice-list limit="4">
 *
 * The school's circulars. Rows are links, not accordions: a notice usually
 * ends in a PDF, and a parent on a phone should reach it in one tap.
 *
 * The heading and the "view all" link are drawn synchronously and the rows
 * arrive after, because the rows may come from the school's CMS. That split
 * matters beyond the spinner: tools/prerender.py bakes whatever is on the
 * page, so the section always has its heading and its route to the archive
 * even if the fetch never finishes.
 *
 * Attributes:
 *   limit    — how many rows to show (default: all)
 *   all-href — target of the "view all" link
 */
import { SiteComponent, define } from '../core/component.js';
import { html, each } from '../core/dom.js';
import { load } from '../services/content.js';

class NoticeList extends SiteComponent {
  /* null while the rows are on their way, so the first paint is a skeleton
     and not an empty frame that then jumps. */
  rows = null;
  loadError = null;

  get limit() { return Number(this.prop('limit', 0)); }

  render() {
    const allHref = this.prop('all-href', 'notice.html');
    return html`
      <section aria-label="Announcements">
        <div class="section-head">
          <h2>Notices <span class="bn">/ বিজ্ঞপ্তি</span></h2>
          <a href="${allHref}">View all notices →</a>
        </div>
        <div class="notice-list" data-rows></div>
      </section>`;
  }

  hydrate() { this.fetch(); }

  async fetch() {
    this.paint();
    try {
      this.rows = await load('notices');
    } catch {
      this.loadError = true;
    }
    this.paint();
  }

  paint() {
    const hole = this.querySelector('[data-rows]');

    if (this.rows === null && !this.loadError) {
      hole.innerHTML = `<skeleton-rows count="${this.limit || 4}"></skeleton-rows>`;
      return;
    }

    if (this.loadError) {
      hole.innerHTML = String(html`
        <state-alert tone="error" heading="The notices could not be loaded" action="Try again">
          The school office's server did not respond. The notice page may still have them.
        </state-alert>`);
      hole.querySelector('state-alert')
        ?.addEventListener('alert-action', () => { this.loadError = null; this.fetch(); });
      return;
    }

    const rows = this.limit > 0 ? this.rows.slice(0, this.limit) : this.rows;
    hole.innerHTML = String(each(rows, (notice) => html`
      <a class="notice" href="${notice.href}">
        <span class="notice-date">${notice.day}<span class="notice-year">${notice.year}</span></span>
        <span class="notice-text">${notice.text}</span>
        <span class="tag tag-${notice.tone === 'accent' ? 'accent' : 'neutral'}">${notice.tag}</span>
      </a>`));
  }
}

define('notice-list', NoticeList);
