/**
 * <about-page>
 *
 * The school's own account of itself: rich-text history and mission, a
 * milestone rail, the "at a glance" facts panel, the two leadership rolls
 * transcribed from the corridor's honours boards, and the photo gallery.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when } from '../core/dom.js';
import { about } from '../data/site.js';

class AboutPage extends SiteComponent {
  render() {
    const block = (b) => b.type === 'ul'
      ? html`<ul>${each(b.items, (item) => html`<li>${item}</li>`)}</ul>`
      : html`<p>${b.text}</p>`;

    return html`
      <div class="with-aside">
        <article class="prose">
          ${each(about.sections, (section) => html`
            <section>
              <h2>${section.heading}</h2>
              ${each(section.blocks, block)}
            </section>`)}

          ${when(about.signature, () => html`
            <p class="prose-signature">
              <span class="prose-signature-name">${about.signature.name}</span>
              <span class="prose-signature-post">${about.signature.post} · ${about.signature.date}</span>
            </p>`)}

          <section>
            <h2 style="margin-bottom:16px">Milestones</h2>
            <ol class="milestones">
              ${each(about.milestones, (m) => html`
                <li class="milestone">
                  <div class="milestone-year">${m.year}</div>
                  <div class="milestone-text">${m.text}</div>
                </li>`)}
            </ol>
          </section>
        </article>

        <aside class="glance blueprint">
          <div class="glance-head">At a glance · এক নজরে</div>
          <dl>
            ${each(about.glance, ([term, value]) => html`<dt>${term}</dt><dd>${value}</dd>`)}
          </dl>
        </aside>
      </div>

      ${when(about.leadership, () => this.renderLeadership())}

      <section>
        <div class="section-head section-head--roomy">
          <h2>Photo gallery <span class="bn">/ চিত্রশালা</span></h2>
          <span class="text-muted" style="font-size:14px">${about.gallery.note}</span>
        </div>
        <photo-gallery source="about" cols="3"></photo-gallery>
      </section>`;
  }

  /**
   * The honours boards, as two tables side by side on a wide screen.
   *
   * A period reads "from — to", and the person still in post gets "present"
   * rather than a blank, so an empty cell is never left to mean two things.
   */
  renderLeadership() {
    const { heading, note, rolls } = about.leadership;
    return html`
      <section class="leadership">
        <div class="section-head section-head--roomy">
          <h2>${heading}</h2>
          <span class="text-muted" style="font-size:14px">${note}</span>
        </div>
        <div class="leadership-rolls">
          ${each(rolls, (roll) => html`
            <div class="blueprint leadership-roll">
              <div class="leadership-roll-head">
                ${roll.title}<span class="bn">${roll.titleBn}</span>
              </div>
              <table class="table leadership-table">
                <thead><tr>
                  <th style="width:44px">Sl.</th><th>Name</th><th>Period</th>
                </tr></thead>
                <tbody>
                  ${each(roll.people, (person, i) => html`
                    <tr ${raw(person.to ? '' : 'class="is-present"')}>
                      <td class="is-sl">${i + 1}</td>
                      <td>
                        <span class="leadership-name">${person.name}</span>
                        <span class="leadership-bn bn">${person.bn}</span>
                        <span class="leadership-role">${person.role}</span>
                      </td>
                      <td class="leadership-period">
                        ${person.from}<br>${person.to ? `to ${person.to}` : 'to present'}
                      </td>
                    </tr>`)}
                </tbody>
              </table>
            </div>`)}
        </div>
      </section>`;
  }
}

define('about-page', AboutPage);
