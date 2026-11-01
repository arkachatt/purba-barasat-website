/**
 * <hm-desk>
 *
 * The Headmaster's standing note. Rich text with a portrait — the excerpt is
 * whatever the office writes; "Read more" carries the full letter.
 *
 * The portrait and the name travel together in `.hm-head` so that the mobile
 * layout can set them side by side while the desktop grid still treats them
 * as two separate columns (`display: contents`).
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw } from '../core/dom.js';
import { headmaster } from '../data/site.js';

class HmDesk extends SiteComponent {
  render() {
    const photo = headmaster.photo
      ? raw(`<img src="${headmaster.photo}" alt="${headmaster.name}">`)
      : html`<span class="hm-photo-label">HM photo</span>`;

    return html`
      <section class="hm-desk blueprint" aria-label="From the HM's Desk">
        <div class="hm-head">
          <div class="hm-photo blueprint ${headmaster.photo ? '' : 'hatch'}">${photo}</div>
          <div class="hm-id">
            <div class="kicker kicker-sm">
              <span class="hm-kicker-long">${headmaster.kicker}</span>
              <span class="hm-kicker-short">${headmaster.kickerShort}</span>
            </div>
            <h3 class="hm-name">${headmaster.name}</h3>
            <div class="hm-post">
              <span class="hm-post-long">${headmaster.post}</span>
              <span class="hm-post-short">${headmaster.postShort}</span>
            </div>
          </div>
        </div>
        <div class="hm-body">
          <p class="hm-excerpt">${headmaster.excerpt}</p>
          <a class="btn btn-ghost hm-more" href="${headmaster.href}">Read more<span class="hm-more-arrow"> →</span></a>
        </div>
      </section>`;
  }
}

define('hm-desk', HmDesk);
