/**
 * <notice-board page-size="8">
 *
 * The full notice archive with search, year and category filters. When a
 * filter finds nothing the page says what it looked for and offers to clear
 * it, rather than showing an empty frame.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when, qsa } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { noticeBoard } from '../data/site.js';
import { load } from '../services/content.js';

class NoticeBoard extends SiteComponent {
  state = { query: '', year: noticeBoard.years[0], category: '', page: 0 };
  /* null while the list is on its way, so the first paint is a skeleton and
     not an empty frame that then jumps. */
  list = null;
  loadError = null;

  get pageSize() { return Number(this.prop('page-size', 8)); }

  get matches() {
    const query = this.state.query.trim().toLowerCase();
    return (this.list || []).filter((notice) => {
      if (this.state.year !== 'All years' && notice.year !== this.state.year) return false;
      if (this.state.category && notice.category !== this.state.category) return false;
      if (query && !`${notice.title} ${notice.ref}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }

  render() {
    return html`
      <div class="notice-filters">
        <div class="field field-search">
          <label for="notice-search">Search notices</label>
          <div class="input-wrap">
            <input class="input" id="notice-search" data-search
                   placeholder="e.g. puja vacation, Class XI, S2 routine…">
            ${raw(icon('search', 18))}
          </div>
        </div>

        <div class="field-pair" style="display:contents">
          <div class="field field-year">
            <label for="notice-year">Year</label>
            <select class="input" id="notice-year" data-year>
              ${each(noticeBoard.years, (year) => html`<option>${year}</option>`)}
              <option>All years</option>
            </select>
          </div>
          <div class="field field-category">
            <label for="notice-category">Category</label>
            <select class="input" id="notice-category" data-category>
              <option value="">All categories</option>
              ${each(noticeBoard.categories, (category) => html`<option>${category}</option>`)}
            </select>
          </div>
        </div>

        <span class="notice-count" data-count></span>
      </div>

      <div data-results></div>`;
  }

  hydrate() {
    this.querySelector('[data-search]').addEventListener('input', (event) => {
      this.state.query = event.target.value; this.state.page = 0; this.paint();
    });
    this.querySelector('[data-year]').addEventListener('change', (event) => {
      this.state.year = event.target.value; this.state.page = 0; this.paint();
    });
    this.querySelector('[data-category]').addEventListener('change', (event) => {
      this.state.category = event.target.value; this.state.page = 0; this.paint();
    });
    this.fetch();
  }

  async fetch() {
    this.paint();
    try {
      this.list = await load('noticeBoard');
    } catch {
      this.loadError = true;
    }
    this.paint();
  }

  paint() {
    /* Still loading: hold the row geometry with skeletons. */
    if (this.list === null && !this.loadError) {
      this.querySelector('[data-count]').textContent = '';
      this.querySelector('[data-results]').innerHTML =
        '<skeleton-rows count="4"></skeleton-rows>';
      return;
    }
    if (this.loadError) {
      this.querySelector('[data-count]').textContent = '';
      this.querySelector('[data-results]').innerHTML = String(html`
        <state-alert tone="error" heading="The notice list could not be loaded" action="Try again">
          The school office's server did not respond. Older notices may still be available from
          the office on 033 2552 0000.
        </state-alert>`);
      this.querySelector('state-alert')
        ?.addEventListener('alert-action', () => { this.loadError = null; this.fetch(); });
      return;
    }

    const matches = this.matches;
    const start = this.state.page * this.pageSize;
    const rows = matches.slice(start, start + this.pageSize);
    const pages = Math.max(1, Math.ceil(matches.length / this.pageSize));

    this.querySelector('[data-count]').textContent = matches.length
      ? `Showing ${rows.length} of ${noticeBoard.declaredTotal}`
      : '';

    const unfiltered = !this.state.query && !this.state.category &&
      (this.state.year === 'All years' || this.list.length === 0);

    this.querySelector('[data-results]').innerHTML = String(!this.list.length && unfiltered
      ? html`
        <empty-state icon="bell" heading="No notices yet"
                     action="Contact the office" action-href="contact.html">
          Nothing has been published for this session. New circulars appear here as soon as the
          office uploads them.
          <span class="bn">এখনও কোনো বিজ্ঞপ্তি প্রকাশিত হয়নি।</span>
        </empty-state>`
      : matches.length
      ? html`
        <div class="blueprint">
          ${each(rows, (notice) => html`
            <div class="notice-row">
              <span class="notice-row-date">${notice.date}</span>
              <span class="notice-row-title">
                <strong>${notice.title}</strong>
                <span class="notice-row-ref">${notice.ref}</span>
                <span class="notice-row-size">${notice.pdf}</span>
              </span>
              <span class="notice-row-tag"><span class="tag tag-${notice.tone}">${notice.category}</span></span>
              <a class="btn btn-secondary btn-md notice-row-pdf" href="${notice.href}"
                 aria-label="Download ${notice.title} — ${notice.pdf}">
                ${raw(icon('download', 16))}<span class="notice-row-pdf-label">${notice.pdf}</span>
              </a>
            </div>`)}
          <div class="notice-pager">
            <span>Page ${this.state.page + 1} of ${pages}</span>
            <div class="notice-pager-actions">
              <button type="button" class="btn btn-secondary" data-page="-1"
                      ${raw(this.state.page === 0 ? 'disabled' : '')}>Previous</button>
              <button type="button" class="btn btn-secondary" data-page="1"
                      ${raw(this.state.page >= pages - 1 ? 'disabled' : '')}>Next</button>
            </div>
          </div>
        </div>`
      : html`
        <div class="blueprint notice-empty">
          ${raw(icon('file-text', 40))}
          <h2>No notices match</h2>
          <p>
            Nothing found${when(this.state.query, () => html` for “${this.state.query}”`)}
            in ${this.state.category || 'all categories'} · ${this.state.year}.
            Try another word, or clear the filters.
            <span class="bn">কোনো বিজ্ঞপ্তি পাওয়া যায়নি।</span>
          </p>
          <button type="button" class="btn btn-primary btn-lg" data-clear>Clear filters</button>
        </div>`);

    qsa('[data-page]', this).forEach((button) => button.addEventListener('click', () => {
      this.state.page += Number(button.dataset.page); this.paint();
    }));
    const clear = this.querySelector('[data-clear]');
    if (clear) clear.addEventListener('click', () => {
      this.state = { query: '', year: 'All years', category: '', page: 0 };
      this.querySelector('[data-search]').value = '';
      this.querySelector('[data-year]').value = 'All years';
      this.querySelector('[data-category]').value = '';
      this.paint();
    });
  }
}

define('notice-board', NoticeBoard);
