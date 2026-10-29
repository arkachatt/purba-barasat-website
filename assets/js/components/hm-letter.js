/**
 * <hm-letter>
 *
 * The Headmaster's message in full. The identity column sticks while the
 * letter scrolls, so the reader keeps the sender in view.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each } from '../core/dom.js';
import { hmLetter } from '../data/site.js';

class HmLetterPage extends SiteComponent {
  render() {
    return html`
      <div class="hm-letter">
        <aside class="hm-letter-aside">
          <figure class="hm-letter-photo blueprint ${hmLetter.photo ? '' : 'hatch'}">
            ${hmLetter.photo
              ? raw(`<img src="${hmLetter.photo}" alt="${hmLetter.name}">`)
              : html`<figcaption>Headmaster photo</figcaption>`}
          </figure>
          <div>
            <h2 class="hm-letter-name">${hmLetter.name}</h2>
            <div class="hm-letter-post">${hmLetter.post}</div>
            <div class="hm-letter-cred">${hmLetter.credentials}</div>
          </div>
          <dl class="hm-letter-details">
            ${each(hmLetter.details, ([term, value]) => html`<dt>${term}</dt><dd>${raw(value)}</dd>`)}
          </dl>
        </aside>

        <article class="hm-letter-body">
          <div class="hm-letter-meta">
            ${each(hmLetter.meta, (item, i) => html`${i > 0 ? '·' : ''}<span>${item}</span>`)}
          </div>
          <p class="hm-letter-salutation">${hmLetter.salutation}</p>
          ${each(hmLetter.paragraphs, (text) => html`<p>${text}</p>`)}
          <p class="hm-letter-sign">
            <span class="hm-letter-sign-name">${hmLetter.signature.name}</span>
            <span class="hm-letter-sign-post">${hmLetter.signature.post}</span>
          </p>
        </article>
      </div>`;
  }
}

define('hm-letter', HmLetterPage);
