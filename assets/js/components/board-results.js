/**
 * <board-results>
 *
 * Madhyamik and Higher Secondary results, one tab each: five years of the
 * school's own record beside the current year's headline. No individual marks
 * are published — those live behind the student portal.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when, qsa } from '../core/dom.js';
import { results } from '../data/site.js';

class BoardResults extends SiteComponent {
  render() {
    const current = results.boards[0].id;
    return html`
      <div class="results-split">
        <div>
          <div class="tabs" role="tablist" style="margin-bottom:20px">
            ${each(results.boards, (board) => html`
              <a class="tab" role="tab" href="#${board.id}" data-board="${board.id}"
                 aria-selected="${board.id === current}">${board.label} <span class="bn">${board.bn}</span></a>`)}
          </div>

          ${each(results.boards, (board) => html`
            <div data-board-panel="${board.id}" ${raw(board.id === current ? '' : 'hidden')}>
              ${when(board.pending, () => html`
                <empty-state inline icon="clock" heading="${board.pending.heading}"
                             style="display:block;margin-bottom:20px">
                  ${board.pending.text}
                </empty-state>`)}
              <div class="blueprint">
                <table class="table results-table">
                  <thead><tr>
                    <th>Year</th><th>Topper's name</th>
                    <th class="is-num">Highest marks</th>
                    <th class="is-num is-appeared">Appeared</th>
                    <th class="is-pass">Pass %</th>
                  </tr></thead>
                  <tbody>
                    ${each(board.rows, (row) => html`
                      <tr>
                        <td>${row.year}</td>
                        <td>${row.topper}</td>
                        <td class="is-num">${row.marks}</td>
                        <td class="is-num is-appeared">${row.appeared}</td>
                        <td class="is-pass"><span class="tag tag-${row.tone}">${row.pass}</span></td>
                      </tr>`)}
                  </tbody>
                </table>
              </div>
              <div class="results-source">${results.source}</div>
            </div>`)}
        </div>

        <aside class="results-aside">
          ${each(results.boards, (board) => html`
            <div class="blueprint results-highlight" data-board-panel="${board.id}"
                 ${raw(board.id === current ? '' : 'hidden')}>
              <div class="kicker">${board.highlight.kicker}</div>
              <div>
                <div class="results-figure">${board.highlight.figure}</div>
                <div class="results-figure-caption">${board.highlight.caption}</div>
              </div>
              <div class="results-detail">${board.highlight.detail}</div>
              <a class="btn btn-secondary btn-md" href="${board.highlight.cta.href}">${board.highlight.cta.label}</a>
            </div>`)}
        </aside>
      </div>`;
  }

  hydrate() {
    qsa('[data-board]', this).forEach((tab) => tab.addEventListener('click', (event) => {
      event.preventDefault();
      const id = tab.dataset.board;
      qsa('[data-board]', this).forEach((t) => t.setAttribute('aria-selected', String(t.dataset.board === id)));
      qsa('[data-board-panel]', this).forEach((panel) => { panel.hidden = panel.dataset.boardPanel !== id; });
    }));
  }
}

define('board-results', BoardResults);
