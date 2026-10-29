/**
 * <photo-gallery source="about" cols="3">
 *
 * A grid of photographs. `source` names the gallery in data/site.js, so the
 * same component serves the About page and an event's own set.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each } from '../core/dom.js';
import { about } from '../data/site.js';

/** Registry of galleries the tag can name. Add an entry to expose a new one. */
const GALLERIES = {
  about: () => about.gallery.photos,
};

export function registerGallery(name, getPhotos) { GALLERIES[name] = getPhotos; }

class PhotoGallery extends SiteComponent {
  render() {
    const photos = (GALLERIES[this.prop('source', 'about')] || (() => []))();
    const cols = this.prop('cols', '3');
    const colsSm = this.prop('cols-sm', '2');

    return html`
      <div class="gallery" style="--gallery-cols:${cols};--gallery-cols-sm:${colsSm}">
        ${each(photos, (photo) => html`
          <figure class="blueprint ${photo.image ? '' : 'hatch'}">
            ${photo.image ? raw(`<img src="${photo.image}" alt="${photo.caption}">`) : ''}
            <figcaption>${photo.caption}</figcaption>
          </figure>`)}
      </div>`;
  }
}

define('photo-gallery', PhotoGallery);
