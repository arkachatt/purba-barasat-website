/**
 * <event-detail>
 *
 * One event, chosen by `?id=` in the URL. The gallery shows the first seven
 * frames and counts the rest, matching what the office actually uploads.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when } from '../core/dom.js';
import { events } from '../data/site.js';

const GALLERY_PREVIEW = 7;

class EventDetail extends SiteComponent {
  get event() {
    const id = new URLSearchParams(window.location.search).get('id');
    return events.find((event) => event.id === id) || events[0];
  }

  render() {
    const event = this.event;
    const index = events.indexOf(event);
    const previous = events[index + 1];
    const shown = Math.min(GALLERY_PREVIEW, event.photoCount);
    const rest = event.photoCount - shown;

    return html`
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="results.html">Results &amp; Events</a><span>/</span>
        <a href="results.html#events">Events</a><span>/</span>
        <span>${event.title}</span>
      </nav>

      <div class="event-detail-top">
        <div class="event-detail-head">
          <div class="event-detail-kicker">
            <span class="tag tag-neutral">${event.tag}</span>
            <span class="event-date">${event.day}, ${event.date}</span>
          </div>
          <h1>${event.title}<span class="bn">${event.titleBn}</span></h1>
          <article class="event-article">
            ${each(event.body, (paragraph) => html`<p>${paragraph}</p>`)}
          </article>
          <div class="event-posted">${event.posted}</div>
        </div>

        <figure class="blueprint event-cover-figure ${event.cover.image ? '' : 'hatch'}">
          ${event.cover.image
            ? raw(`<img src="${event.cover.image}" alt="${event.cover.caption}">`)
            : html`<figcaption>${event.cover.caption}</figcaption>`}
        </figure>
      </div>

      <section>
        <div class="section-head section-head--roomy">
          <h2>Gallery <span class="bn">/ চিত্রশালা</span></h2>
          <span class="text-muted" style="font-size:14px">Tap a photo to open it full-size</span>
        </div>
        <div class="gallery" style="--gallery-cols:4;--gallery-cols-sm:2">
          ${each(Array.from({ length: shown }), () => html`<figure class="blueprint hatch"></figure>`)}
          ${when(rest > 0, () => html`<figure class="blueprint gallery-more">+${rest} more</figure>`)}
        </div>
      </section>

      <div class="event-detail-foot">
        ${previous
          ? html`<a class="btn btn-ghost btn-md" href="event.html?id=${previous.id}">← ${previous.title}</a>`
          : html`<span></span>`}
        <a class="btn btn-secondary btn-md" href="results.html#events">All events</a>
      </div>`;
  }
}

define('event-detail', EventDetail);
