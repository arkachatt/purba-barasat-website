/**
 * <photo-carousel>
 *
 * Slides with arrows, a caption plate and a dot rail. A slide with no image
 * is a hatched placeholder naming its subject, which keeps the page honest
 * about what is missing. With one slide the arrows and the dots are left out
 * altogether — a control that can only return you to where you are is worse
 * than no control, and it implies photographs that are not there.
 *
 * Attributes:
 *   autoplay — ms between slides; omit or 0 to leave it manual
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when, qsa } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { carouselSlides, carouselIntro } from '../data/site.js';

class PhotoCarousel extends SiteComponent {
  index = 0;

  /** A lone slide is not a carousel; it is a picture. */
  get many() { return carouselSlides.length > 1; }

  render() {
    const total = carouselSlides.length;
    const dots = (className) => html`
      <div class="${className}" role="tablist" aria-label="Slides">
        ${each(carouselSlides, (slide, i) => html`
          <button type="button" class="carousel-dot" role="tab" data-go="${i}"
                  aria-selected="${i === this.index}"
                  aria-label="Slide ${i + 1}: ${slide.caption}"></button>`)}
      </div>`;

    return html`
      <section class="carousel blueprint hatch" aria-label="Photo carousel"
               ${raw(this.many ? 'aria-roledescription="carousel"' : '')}>
        ${each(carouselSlides, (slide, i) => html`
          <div class="carousel-slide ${slide.image && slide.duotone ? 'duotone' : ''}"
               data-slide="${i}" ${raw(i === this.index ? '' : 'hidden')}
               role="group" aria-roledescription="slide" aria-label="${i + 1} of ${total}">
            ${slide.image
              ? raw(`<img src="${slide.image}" alt="${(slide.alt || slide.caption).replace(/"/g, '&quot;')}"`
                  + `${slide.focus ? ` style="object-position:${slide.focus}"` : ''}>`)
              : html`<span class="carousel-plate">Photo ${i + 1} of ${total} · ${slide.caption}</span>`}
          </div>`)}

        ${when(this.many, () => html`
          <button type="button" class="btn btn-secondary carousel-nav carousel-nav--prev"
                  data-step="-1" aria-label="Previous">${raw(icon('chevron-left', 18))}</button>
          <button type="button" class="btn btn-secondary carousel-nav carousel-nav--next"
                  data-step="1" aria-label="Next">${raw(icon('chevron-right', 18))}</button>`)}

        <div class="carousel-caption">
          <div class="kicker-sm kicker">${carouselIntro.kicker}</div>
          <div class="carousel-title">${carouselIntro.title}</div>
          <div class="carousel-sub">${carouselIntro.titleBn}</div>
        </div>
        ${when(this.many, () => dots('carousel-dots'))}

        <div class="carousel-bar">
          <div style="min-width:0">
            <div class="carousel-bar-title" data-bar-title>${carouselSlides[this.index].caption}</div>
            <div class="carousel-bar-sub">${carouselIntro.shortMeta}</div>
          </div>
          ${when(this.many, () => dots('carousel-bar-dots'))}
        </div>
      </section>`;
  }

  hydrate() {
    qsa('[data-step]', this).forEach((button) =>
      button.addEventListener('click', () => this.go(this.index + Number(button.dataset.step))));
    qsa('[data-go]', this).forEach((button) =>
      button.addEventListener('click', () => this.go(Number(button.dataset.go))));

    const interval = this.many ? Number(this.prop('autoplay', 0)) : 0;
    clearInterval(this._timer);
    if (interval > 0) {
      this._timer = setInterval(() => this.go(this.index + 1), interval);
      this.addEventListener('pointerenter', () => clearInterval(this._timer));
    }
  }

  disconnectedCallback() { clearInterval(this._timer); }

  /** Move to a slide, wrapping at either end. */
  go(next) {
    const total = carouselSlides.length;
    this.index = (next + total) % total;

    qsa('[data-slide]', this).forEach((slide) => {
      slide.hidden = Number(slide.dataset.slide) !== this.index;
    });
    qsa('[data-go]', this).forEach((dot) => {
      dot.setAttribute('aria-selected', String(Number(dot.dataset.go) === this.index));
    });
    this.querySelector('[data-bar-title]').textContent = carouselSlides[this.index].caption;
  }
}

define('photo-carousel', PhotoCarousel);
