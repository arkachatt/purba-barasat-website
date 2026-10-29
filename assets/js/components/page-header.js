/**
 * <page-header kicker="01 · About the school" title="About Us"
 *              title-bn="আমাদের সম্পর্কে" bn-meta="38 teaching staff"
 *              meta="Updated 01 Jul 2026">
 *
 * The opening block of every inner page. Attributes rather than a data import,
 * because the values differ per page and nothing else needs them.
 *
 *   bn-meta — appended to the Bengali line, which only shows on a phone
 *   meta    — right-hand column; use "|" to break it across lines
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when } from '../core/dom.js';

class PageHeader extends SiteComponent {
  render() {
    const titleBn = this.prop('title-bn');
    const bnMeta = this.prop('bn-meta');
    const meta = this.prop('meta');

    return html`
      <div class="page-header">
        <div>
          <div class="kicker">${this.prop('kicker')}</div>
          <h1>${this.prop('title')}${when(titleBn, () => html` <span class="bn">/ ${titleBn}</span>`)}</h1>
          ${when(titleBn, () => html`
            <div class="page-header-bn">${titleBn}${when(bnMeta, () => html` · ${bnMeta}`)}</div>`)}
        </div>
        ${when(meta, () => html`
          <div class="page-header-meta">
            ${each(meta.split('|'), (line, i) => html`${when(i > 0, () => raw('<br>'))}${line}`)}
          </div>`)}
      </div>`;
  }
}

define('page-header', PageHeader);
