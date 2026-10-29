/**
 * <skeleton-rows count="4">
 *
 * The placeholder a list shows while its content is on the way. The blocks sit
 * in the real row's geometry so nothing jumps when the data lands, and they
 * are flat grey — no shimmer animation, so a low-end phone spends nothing on
 * repaint.
 *
 * Widths vary per row so the stack reads as text, not as a grid of bars.
 */
import { SiteComponent, define } from '../core/component.js';
import { html, each } from '../core/dom.js';

const WIDTHS = [
  { title: '78%', ref: '42%', tag: '74px' },
  { title: '64%', ref: '34%', tag: '60px' },
  { title: '88%', ref: '28%', tag: '66px' },
  { title: '56%', ref: '30%', tag: '60px' },
];

class SkeletonRows extends SiteComponent {
  render() {
    const count = Number(this.prop('count', 4));
    const rows = Array.from({ length: count }, (_, i) => WIDTHS[i % WIDTHS.length]);

    return html`
      <div class="blueprint skeleton-rows" role="status" aria-label="Loading">
        ${each(rows, (row) => html`
          <div class="skeleton-row">
            <span class="skeleton-block" style="width:90px"></span>
            <span class="skeleton-lines">
              <span class="skeleton-block" style="width:${row.title}"></span>
              <span class="skeleton-block skeleton-block--soft" style="height:12px;width:${row.ref}"></span>
            </span>
            <span class="skeleton-tag" style="width:${row.tag}"></span>
            <span class="skeleton-btn"></span>
          </div>`)}
      </div>`;
  }
}

define('skeleton-rows', SkeletonRows);
