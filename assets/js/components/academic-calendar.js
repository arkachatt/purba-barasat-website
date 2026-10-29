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

/** Days from today to a date, for the "next holiday" panel. */
function daysUntil(iso) {
  const day = 24 * 60 * 60 * 1000;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((new Date(iso) - today) / day);
}

function nextHoliday() {
  const upcoming = holidays.list.find((h) => daysUntil(h.date) >= 0);
  return upcoming || holidays.list[0];
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
      <div class="tabs" role="tablist">
        ${each(tabs, (tab) => html`
          <a class="tab" role="tab" href="#${tab.id}" data-tab="${tab.id}"
             aria-selected="${tab.id === current}">${tab.label} <span class="bn">${tab.bn}</span></a>`)}
      </div>
      <div class="seg tabs-seg" role="tablist">
        ${each(tabs, (tab) => html`
          <a class="seg-opt" role="tab" href="#${tab.id}" data-tab="${tab.id}"
             aria-selected="${tab.id === current}">${tab.short}</a>`)}
      </div>

      <div class="calendar-panel" data-panel="holidays" ${raw(current === 'holidays' ? '' : 'hidden')}>
        ${this.renderHolidays()}
      </div>
      <div class="calendar-panel" data-panel="exams" ${raw(current === 'exams' ? '' : 'hidden')}>
        ${this.renderExams()}
      </div>
      ${when(features.syllabus, () => html`
        <div class="calendar-panel" data-panel="syllabus" ${raw(current === 'syllabus' ? '' : 'hidden')}>
          ${this.renderSyllabus()}
        </div>`)}`;
  }

  renderHolidays() {
    const next = nextHoliday();
    const away = daysUntil(next.date);
    const when_ = away === 0 ? 'today' : away === 1 ? 'tomorrow'
      : away > 0 ? `in ${away} days` : 'passed';

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
                <tr>
                  <td class="is-date">${holiday.label}</td>
                  <td class="is-day">${holiday.day}</td>
                  <td>${holiday.name}</td>
                  <td class="is-days">${holiday.days}</td>
                </tr>`)}
            </tbody>
          </table>
        </div>

        <aside class="calendar-aside" style="display:flex;flex-direction:column;gap:20px">
          <div class="blueprint next-holiday">
            <div class="kicker kicker-sm">Next holiday</div>
            <div class="next-holiday-name">${next.name.split(' · ')[0]}</div>
            <div class="next-holiday-when">${next.day}, ${next.label} · ${when_}</div>
          </div>
          <div class="blueprint calendar-note">
            <div class="kicker kicker-sm" style="margin-bottom:6px">Note</div>
            ${holidays.note}
          </div>
        </aside>
      </div>`;
  }

  renderExams() {
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
