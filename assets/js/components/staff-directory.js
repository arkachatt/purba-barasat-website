/**
 * <staff-directory>
 *
 * The staff list, in full. Search, post filter and the teaching/non-teaching
 * segments all narrow the same array, and whatever survives is shown in one
 * page — the roster is a public record, so a reader scrolling for one name
 * should never have to guess which page it is on, and Ctrl-F should find it.
 *
 * The controls are rendered once and only the result region re-renders, so
 * typing in the search box never loses focus.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when, qsa } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { staff, staffPosts } from '../data/site.js';

/* The header's Teachers dropdown links here with a hash, so the two items
   land on the segment they name instead of on the same unchanged page. */
const KIND_BY_HASH = {
  teaching: 'teaching', 'non-teaching': 'nonTeaching',
  'casual-teaching': 'casualTeaching', 'casual-non-teaching': 'casualNonTeaching',
  all: 'all',
};

/* The segments, in the order the control shows them. The sanctioned posts
   first, then the casual register, then everyone. */
const SEGMENTS = [
  ['teaching', 'Teaching'],
  ['nonTeaching', 'Non-teaching'],
  ['casualTeaching', 'Casual teaching'],
  ['casualNonTeaching', 'Casual non-teaching'],
  ['all', 'All'],
];
const kindFromHash = () => KIND_BY_HASH[window.location.hash.replace('#', '')] || null;

class StaffDirectory extends SiteComponent {
  state = { query: '', post: '', kind: kindFromHash() || 'teaching' };

  connectedCallback() {
    super.connectedCallback();
    /* Arriving at teachers.html#non-teaching from another page is handled by
       the initial state above. Clicking the same link while already here
       changes only the hash, which fires this and nothing else. */
    this._onHash = () => {
      const kind = kindFromHash();
      if (!kind || kind === this.state.kind) return;
      this.state.kind = kind;
      this.syncSegment();
      this.paint();
    };
    window.addEventListener('hashchange', this._onHash);
  }

  disconnectedCallback() { window.removeEventListener('hashchange', this._onHash); }

  /** Move the segment control to wherever the state now is. */
  syncSegment() {
    qsa('input[name="staff-kind"]', this).forEach((input) => {
      input.checked = input.value === this.state.kind;
    });
  }

  /** Rows surviving the current search, post filter and staff segment. */
  get matches() {
    const query = this.state.query.trim().toLowerCase();
    return staff.filter((person) => {
      if (this.state.kind !== 'all' && person.kind !== this.state.kind) return false;
      if (this.state.post && person.group !== this.state.post) return false;
      if (query && !(person.name || '').toLowerCase().includes(query)) return false;
      return true;
    });
  }

  /** Staff in post for the current segment — vacancies are listed, not counted. */
  get declaredTotal() {
    return this.matches.filter((person) => !person.vacant).length;
  }

  /** Contact columns only exist if anyone has contact details to show. */
  get hasContact() {
    return staff.some((person) => person.phone || person.email);
  }

  render() {
    return html`
      <div class="directory-controls">
        <div class="field directory-search">
          <label for="staff-search">Search by name</label>
          <div class="input-wrap">
            <input class="input" id="staff-search" placeholder="Type a name…" data-search>
            ${raw(icon('search', 18))}
          </div>
        </div>

        <div class="field directory-post">
          <label for="staff-post">Filter by post</label>
          <select class="input" id="staff-post" data-post>
            <option value="">All posts</option>
            ${each(staffPosts, (post) => html`<option value="${post}">${post}</option>`)}
          </select>
        </div>

        <div class="seg directory-seg" role="radiogroup" aria-label="Staff type">
          ${each(SEGMENTS, ([value, label]) => html`
            <label class="seg-opt">
              <input type="radio" name="staff-kind" value="${value}"
                     ${raw(this.state.kind === value ? 'checked' : '')}>${label}
            </label>`)}
        </div>

        <span class="directory-count" data-count></span>
      </div>

      <div data-results></div>`;
  }

  hydrate() {
    const rerender = () => this.paint();

    this.querySelector('[data-search]').addEventListener('input', (event) => {
      this.state.query = event.target.value;
      rerender();
    });
    this.querySelector('[data-post]').addEventListener('change', (event) => {
      this.state.post = event.target.value;
      rerender();
    });
    qsa('input[name="staff-kind"]', this).forEach((input) =>
      input.addEventListener('change', () => { this.state.kind = input.value; rerender(); }));

    this.paint();
  }

  /** Re-render only the results, leaving the controls (and focus) alone. */
  paint() {
    const matches = this.matches;

    const vacancies = matches.filter((person) => person.vacant).length;
    this.querySelector('[data-count]').textContent = matches.length
      ? `Showing all ${matches.length} · ${this.declaredTotal} in post`
        + (vacancies ? ` · ${vacancies} vacant` : '')
      : 'No matches';

    this.querySelector('[data-results]').innerHTML = String(matches.length
      ? html`
        <div class="blueprint directory-table-wrap">
          <table class="table directory-table">
            <thead><tr>
              <th style="width:56px">Sl.</th><th style="width:72px">Photo</th>
              <th>Name</th><th>Post</th><th>Qualification</th>
              ${when(this.hasContact, () => html`<th>Contact</th><th>Email</th>`)}
            </tr></thead>
            <tbody>
              ${each(matches, (person) => html`
                <tr ${raw(person.vacant ? 'class="is-vacant"' : '')}>
                  <td class="is-sl">${person.sl}</td>
                  <td class="is-photo">${raw(this.thumb(person))}</td>
                  <td class="is-name">
                    ${person.vacant
                      ? html`<span class="tag tag-outline">Vacant post</span>`
                      : html`${person.name}`}
                  </td>
                  <td>${person.post}</td>
                  <td>${person.qualification || '—'}</td>
                  ${when(this.hasContact, () => html`
                    <td>${person.phone ? html`<a href="tel:${person.tel}">${person.phone}</a>` : '—'}</td>
                    <td>${person.email ? html`<a href="mailto:${person.email}">${person.email}</a>` : '—'}</td>`)}
                </tr>`)}
            </tbody>
          </table>
        </div>
        </div>

        <div class="directory-cards">
          ${each(matches, (person) => html`
            <article class="directory-card blueprint ${person.vacant ? 'is-vacant' : ''}">
              ${raw(this.thumb(person))}
              <div>
                <div class="directory-card-sl">Sl. ${person.sl}</div>
                <div class="directory-card-name">
                  ${person.vacant
                    ? html`<span class="tag tag-outline">Vacant post</span>`
                    : html`${person.name}`}
                </div>
                <div class="directory-card-post">${person.post}</div>
                ${when(person.qualification, () => html`
                  <div class="directory-card-qual">${person.qualification}</div>`)}
              </div>
              ${when(person.phone || person.email, () => html`
                <div class="directory-card-actions">
                  ${when(person.phone, () => html`
                    <a class="btn btn-secondary btn-md" href="tel:${person.tel}">${raw(icon('phone', 16))}Call</a>`)}
                  ${when(person.email, () => html`
                    <a class="btn btn-secondary btn-md" href="mailto:${person.email}">${raw(icon('mail', 16))}Email</a>`)}
                </div>`)}
            </article>`)}
        </div>`
      : html`
        <div class="blueprint directory-empty">No staff match this filter.</div>`);

  }

  thumb(person) {
    if (person.vacant) return '<span class="directory-thumb blueprint"></span>';
    return person.photo
      ? `<span class="directory-thumb blueprint"><img src="${person.photo}" alt=""></span>`
      : '<span class="directory-thumb blueprint hatch"></span>';
  }
}

define('staff-directory', StaffDirectory);
