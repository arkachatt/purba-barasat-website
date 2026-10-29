/**
 * <event-list>
 *
 * School events as cards, filtered by period. Each card opens the event's own
 * page, which carries the full write-up and its gallery.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, qsa } from '../core/dom.js';
import { events, eventFilters } from '../data/site.js';

class EventList extends SiteComponent {
  filter = eventFilters[0];

  render() {
    return html`
      <div class="section-head section-head--roomy">
        <h2>Events <span class="bn">/ অনুষ্ঠান</span></h2>
        <div class="seg" style="height:40px">
          ${each(eventFilters, (label) => html`
            <label class="seg-opt" style="min-height:40px">
              <input type="radio" name="event-filter" value="${label}"
                     ${raw(label === this.filter ? 'checked' : '')}>${label}
            </label>`)}
        </div>
      </div>
      <div class="event-grid" data-events></div>`;
  }

  hydrate() {
    qsa('input[name="event-filter"]', this).forEach((input) =>
      input.addEventListener('change', () => { this.filter = input.value; this.paint(); }));
    this.paint();
  }

  paint() {
    const matches = events.filter((event) => event.filter === this.filter);
    this.querySelector('[data-events]').innerHTML = String(matches.length
      ? each(matches, (event) => html`
          <a class="blueprint event-card" href="event.html?id=${event.id}">
            <div class="event-cover ${event.cover.image ? '' : 'hatch'}">
              ${event.cover.image
                ? raw(`<img src="${event.cover.image}" alt="">`)
                : html`<span>Event photo</span>`}
            </div>
            <div class="event-body">
              <div class="event-meta">
                <span class="event-date">${event.date}</span>
                <span class="tag tag-neutral">${event.tag}</span>
              </div>
              <h3>${event.title}</h3>
              <p>${event.summary}</p>
            </div>
          </a>`)
      : html`
        <empty-state icon="calendar" heading="No events posted"
                     action="See 2025 events" action-href="results.html#events"
                     style="grid-column:1/-1">
          Photographs from school programmes will appear here. Last year's events are still
          available in the archive.
        </empty-state>`);
  }
}

define('event-list', EventList);
