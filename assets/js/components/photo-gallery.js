/**
 * <photo-gallery source="about" cols="3">
 *
 * A grid of photographs. `source` names a gallery in the registry below, so
 * the same component serves the About page and an event's own set.
 *
 * A registered gallery may return its photographs or a promise of them — the
 * About gallery comes from the school's CMS and the event galleries do not —
 * so `registerGallery` keeps the signature it always had.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each } from '../core/dom.js';
import { load } from '../services/content.js';

/** Registry of galleries the tag can name. Add an entry to expose a new one. */
const GALLERIES = {
  about: () => load('gallery'),
};

export function registerGallery(name, getPhotos) { GALLERIES[name] = getPhotos; }

class PhotoGallery extends SiteComponent {
  photos = null;
  loadError = null;

  get cols() { return Number(this.prop('cols', '3')) || 3; }

  render() {
    const colsSm = this.prop('cols-sm', '2');
    return html`
      <div class="gallery" data-photos
           style="--gallery-cols:${this.cols};--gallery-cols-sm:${colsSm}"></div>`;
  }

  hydrate() { this.fetch(); }

  async fetch() {
    this.paint();
    const get = GALLERIES[this.prop('source', 'about')];
    try {
      this.photos = get ? await get() : [];
    } catch {
      this.loadError = true;
    }
    this.paint();
  }

  /** One hatched plate — what the gallery already draws for a caption whose
      photograph has not been taken yet, reused as the loading placeholder.
      `<skeleton-rows>` is row-shaped and would collapse the grid. */
  placeholder() {
    return html`<figure class="blueprint hatch"><figcaption></figcaption></figure>`;
  }

  paint() {
    const grid = this.querySelector('[data-photos]');

    if (this.photos === null && !this.loadError) {
      grid.innerHTML = String(each(Array(this.cols * 2).fill(0), () => this.placeholder()));
      return;
    }

    if (this.loadError) {
      grid.innerHTML = String(html`
        <state-alert tone="error" heading="The photographs could not be loaded" action="Try again">
          The school office's server did not respond.
        </state-alert>`);
      grid.querySelector('state-alert')
        ?.addEventListener('alert-action', () => { this.loadError = null; this.fetch(); });
      return;
    }

    grid.innerHTML = String(each(this.photos, (photo) => html`
      <figure class="blueprint ${photo.image ? '' : 'hatch'}">
        ${photo.image ? raw(`<img src="${photo.image}" alt="${photo.caption}">`) : ''}
        <figcaption>${photo.caption}</figcaption>
      </figure>`));
  }
}

define('photo-gallery', PhotoGallery);
