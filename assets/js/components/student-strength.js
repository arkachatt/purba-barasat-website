/**
 * <student-strength>
 *
 * Class-wise enrolment. The wide layout is one table with a class spanning its
 * sections; the phone layout is a panel per class, because a three-column
 * table with row spans does not survive a 390px screen.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when } from '../core/dom.js';
import { students, features } from '../data/site.js';

const classTotal = (klass) => klass.sections.reduce((sum, [, count]) => sum + count, 0);

class StudentStrength extends SiteComponent {
  render() {
    return html`
      <div class="strength">
        <div class="blueprint strength-table-wrap">
          <table class="table strength-table">
            <thead><tr><th>Class</th><th>Section</th><th class="is-count">Total students</th></tr></thead>
            <tbody>
              ${each(students.classes, (klass) => each(klass.sections, ([section, count], i) => html`
                <tr>
                  ${i === 0 ? raw(`<td class="is-class" rowspan="${klass.sections.length}">${klass.name}</td>`) : ''}
                  <td>${section}</td>
                  <td class="is-count">${count}</td>
                </tr>`))}
            </tbody>
            <tfoot>
              <tr><td colspan="2">Total</td><td class="is-count">${students.total}</td></tr>
            </tfoot>
          </table>
        </div>

        <div class="strength-cards">
          <div class="blueprint strength-bar">
            <div>
              <div class="kicker kicker-sm">Total enrolment</div>
              <div class="strength-total-sub">${students.sections} sections · as on 01 Jul 2026</div>
            </div>
            <div class="strength-bar-figure">${students.total}</div>
          </div>
          ${each(students.classes, (klass) => html`
            <section class="blueprint">
              <div class="strength-group-head">
                <span class="strength-group-name">${klass.name}</span>
                <span class="strength-group-total">${classTotal(klass)} students</span>
              </div>
              ${each(klass.sections, ([section, count]) => html`
                <div class="strength-row"><span>Section ${section}</span><span>${count}</span></div>`)}
            </section>`)}
          <div class="strength-note">${students.privacyNote}</div>
        </div>

        <aside class="strength-aside">
          <div class="blueprint strength-total">
            <div class="kicker kicker-sm">Total enrolment</div>
            <div class="strength-total-figure">${students.total}</div>
            <div class="strength-total-sub">${students.summary}</div>
          </div>
          <div class="blueprint strength-streams">
            <div class="kicker kicker-sm">Streams in Class XI–XII</div>
            ${each(Object.entries(students.streams), ([stream, subjects]) => html`
              <p>${stream}: ${subjects}</p>`)}
          </div>
          ${when(features.login, () => html`
            <a class="btn btn-secondary btn-lg" href="login.html">Student portal → Log In</a>`)}
        </aside>
      </div>`;
  }
}

define('student-strength', StudentStrength);
