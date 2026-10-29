/**
 * <about-page>
 *
 * The school's own account of itself: rich-text history and mission, a
 * milestone rail, the "at a glance" facts panel and the photo gallery.
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

      <section>
        <div class="section-head section-head--roomy">
          <h2>Photo gallery <span class="bn">/ চিত্রশালা</span></h2>
          <span class="text-muted" style="font-size:14px">${about.gallery.note}</span>
        </div>
        <photo-gallery source="about" cols="3"></photo-gallery>
      </section>`;
  }
}

define('about-page', AboutPage);
