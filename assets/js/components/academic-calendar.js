/**
 * <academic-calendar>
 *
 * Holidays, exam schedule and syllabus, as three tabs of one page. The tab
 * lives in the URL hash (calendar.html#exams) so the header dropdown can link
 * straight to a view and the browser's Back button steps between them.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when, qsa } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { calendar, holidays, exams, syllabus, features } from '../data/site.js';

/** Only the tabs whose feature switch is on. */
const tabs = calendar.tabs.filter((tab) => !tab.feature || features[tab.feature]);

/**
 * A tab with nothing in it yet. Published lists are what this page is for,
 * so an empty one is said plainly rather than drawn as a table with no rows.
 */
function awaiting(what, bn) {
  return html`
    <empty-state icon="calendar" heading="Not published yet"
                 action="Contact the office" action-href="contact.html">
      The school office has not published ${what} for this academic year.
      It appears here as soon as it does.
      <span class="bn">${bn}</span>
    </empty-state>`;
}

/** Days from today to a date, for the "next holiday" panel. */
function daysUntil(iso) {
  const day = 24 * 60 * 60 * 1000;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((new Date(iso) - today) / day);
}

/**
 * What the panel should say about closures.
 *
 * A vacation that has already started still matters — more, in fact, than the
 * one after it: during the Puja vacation a guardian wants to know when school
 * reopens, not which holiday is next. So a run that covers today wins.
 *
 * Entries with no fixed date, and those falling on a Sunday (counted as 0
 * days, because school is shut anyway), are not closures and are skipped.
 */
function closureNow() {
  const closures = holidays.list.filter((holiday) => holiday.date && holiday.days > 0);

  const ongoing = closures.find((holiday) =>
    holiday.end && daysUntil(holiday.date) <= 0 && daysUntil(holiday.end) >= 0);
  if (ongoing) return { holiday: ongoing, ongoing: true };

  const next = closures.find((holiday) => daysUntil(holiday.date) >= 0);
  return { holiday: next || null, ongoing: false };
}

/** The first school day after a vacation ends. */
function reopensOn(holiday) {
  const day = new Date(holiday.end);
  do { day.setDate(day.getDate() + 1); } while (day.getDay() === 0);   // skip Sunday
  return day.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

class AcademicCalendar extends SiteComponent {
  get tab() {
    const fromHash = window.location.hash.replace('#', '');
    return tabs.some((t) => t.id === fromHash) ? fromHash : tabs[0].id;
  }

  connectedCallback() {
    super.connectedCallback();
    this._onHash = () => this.showTab(this.tab);
    window.addEventListener('hashchange', this._onHash);
  }

  disconnectedCallback() { window.removeEventListener('hashchange', this._onHash); }

  render() {
    const current = this.tab;
    return html`
      ${when(tabs.length > 1, () => html`
      <div class="tabs" role="tablist">
        ${each(tabs, (tab) => html`
          <a class="tab" role="tab" href="#${tab.id}" data-tab="${tab.id}"
             aria-selected="${tab.id === current}">${tab.label} <span class="bn">${tab.bn}</span></a>`)}
      </div>
      <div class="seg tabs-seg" role="tablist">
        ${each(tabs, (tab) => html`
          <a class="seg-opt" role="tab" href="#${tab.id}" data-tab="${tab.id}"
             aria-selected="${tab.id === current}">${tab.short}</a>`)}
      </div>`)}

      <div class="calendar-panel" data-panel="holidays" ${raw(current === 'holidays' ? '' : 'hidden')}>
        ${this.renderHolidays()}
      </div>
      ${when(features.exams, () => html`
        <div class="calendar-panel" data-panel="exams" ${raw(current === 'exams' ? '' : 'hidden')}>
          ${this.renderExams()}
        </div>`)}
      ${when(features.syllabus, () => html`
        <div class="calendar-panel" data-panel="syllabus" ${raw(current === 'syllabus' ? '' : 'hidden')}>
          ${this.renderSyllabus()}
        </div>`)}`;
  }

  renderHolidays() {
    if (!holidays.list.length) {
      return awaiting('the holiday list', 'ছুটির তালিকা এখনও প্রকাশিত হয়নি।');
    }
    const { holiday: next, ongoing } = closureNow();
    const away = next && !ongoing ? daysUntil(next.date) : null;
    const when_ = ongoing
      ? `School reopens ${reopensOn(next)}`
      : away === 0 ? 'today' : away === 1 ? 'tomorrow'
      : away > 0 ? `in ${away} days` : 'the last of this year';

    return html`
      <div class="calendar-split">
        <div class="blueprint">
          <table class="table holiday-table">
            <thead><tr>
              <th style="width:200px">Date</th><th class="is-day" style="width:130px">Day</th>
              <th>Holiday</th><th class="is-days" style="width:120px">Days</th>
            </tr></thead>
            <tbody>
              ${each(holidays.list, (holiday) => html`
                <tr ${raw(holiday.days === 0 ? 'class="is-nil"' : '')}>
                  <td class="is-date">${holiday.label}</td>
                  <td class="is-day">${holiday.day}</td>
                  <td>${holiday.name}${when(holiday.observed,
                    () => html` <span class="text-muted">· to be observed</span>`)}</td>
                  <td class="is-days">
                    ${holiday.days === 0
                      ? html`<span class="text-muted" title="Falls on a Sunday">—</span>`
                      : html`${holiday.days}`}
                  </td>
                </tr>`)}
            </tbody>
            <tfoot>
              <tr><td colspan="3">Total</td><td class="is-days">${holidays.totalDays} days</td></tr>
            </tfoot>
          </table>
        </div>

        <aside class="calendar-aside" style="display:flex;flex-direction:column;gap:20px">
          ${when(next, () => html`
            <div class="blueprint next-holiday">
              <div class="kicker kicker-sm">${ongoing ? 'School is closed' : 'Next holiday'}</div>
              <div class="next-holiday-name">${next.name.split(' (')[0]}</div>
              <div class="next-holiday-when">${next.label}${ongoing ? '' : ' · '}${ongoing ? '' : when_}</div>
              ${when(ongoing, () => html`<div class="next-holiday-when">${when_}</div>`)}
            </div>`)}
          <div class="blueprint calendar-note">
            <div class="kicker kicker-sm" style="margin-bottom:6px">Note</div>
            ${holidays.note}
          </div>
        </aside>
      </div>`;
  }

  renderExams() {
    if (!exams.rows.length) {
      return awaiting('the examination schedule', 'পরীক্ষার সূচি এখনও প্রকাশিত হয়নি।');
    }
    const cell = (value) => typeof value === 'string'
      ? html`${value}`
      : html`${value.text}<span class="tag tag-${value.tone}">${value.tag}</span>`;

    return html`
      <div class="exam-legend">
        <div><span class="exam-legend-long">${raw(exams.legend)}</span><span class="exam-legend-short">${exams.legendShort}</span></div>
        <a class="btn btn-secondary btn-md" href="${exams.pdf.href}">${exams.pdf.label}</a>
      </div>

      <div class="blueprint exam-table-wrap">
        <table class="table exam-table">
          <thead><tr>
            <th>Class</th>
            ${each(exams.columns, (column) => html`<th>${column.label} <span>${column.note}</span></th>`)}
          </tr></thead>
          <tbody>
            ${each(exams.rows, (row) => html`
              <tr>
                <td>${row.klass}</td>
                ${each(exams.columns, (column) => html`<td>${cell(row[column.id])}</td>`)}
              </tr>`)}
          </tbody>
        </table>
      </div>

      <div class="exam-cards">
        ${each(exams.rows, (row) => html`
          <section class="blueprint">
            <div class="exam-card-head">${row.klass}</div>
            <dl style="margin:0">
              ${each(exams.columns.filter((column) => row[column.id] !== '—'), (column) => html`
                <div class="exam-card-row">
                  <dt>${column.label}${column.note.replace('·', '')}</dt>
                  <dd>${cell(row[column.id])}</dd>
                </div>`)}
            </dl>
          </section>`)}
      </div>`;
  }

  renderSyllabus() {
    if (!syllabus.length) {
      return awaiting('the syllabus', 'পাঠ্যসূচি এখনও প্রকাশিত হয়নি।');
    }
    return html`
      <div class="syllabus-list">
        ${each(syllabus, (item) => html`
          <details class="syllabus-item blueprint" ${raw(item.open ? 'open' : '')}>
            <summary>
              <span>${item.klass}<span class="syllabus-meta">${item.meta}</span></span>
              ${raw(icon('chevron-down', 20))}
            </summary>
            ${item.subjects
              ? html`
                <table class="table syllabus-table">
                  <thead><tr>
                    <th>Subject</th><th>Textbook</th><th>Updated</th><th class="is-pdf">Syllabus</th>
                  </tr></thead>
                  <tbody>
                    ${each(item.subjects, (subject) => html`
                      <tr>
                        <td>${subject.name}</td>
                        <td class="is-book">${subject.book}</td>
                        <td class="is-updated">${subject.updated}</td>
                        <td class="is-pdf">
                          <a class="btn btn-ghost btn-md" href="${subject.href}">
                            ${raw(icon('download', 16))}${subject.pdf}
                          </a>
                        </td>
                      </tr>`)}
                  </tbody>
                </table>`
              : html`<div class="syllabus-empty">
                  The ${item.klass} syllabus has not been published yet. It appears here once the
                  office uploads it.
                </div>`}
          </details>`)}
      </div>`;
  }

  hydrate() {
    qsa('[data-tab]', this).forEach((link) => link.addEventListener('click', () => {
      /* The hash change does the work; this only keeps the click snappy. */
      this.showTab(link.dataset.tab);
    }));
  }

  showTab(id) {
    qsa('[data-tab]', this).forEach((link) =>
      link.setAttribute('aria-selected', String(link.dataset.tab === id)));
    qsa('[data-panel]', this).forEach((panel) => { panel.hidden = panel.dataset.panel !== id; });
  }
}

define('academic-calendar', AcademicCalendar);
