/**
 * dom.js — the smallest useful template layer.
 *
 * `html` is a tagged template that escapes every interpolation, so content
 * coming from the CMS-shaped data modules can never inject markup. Wrap a
 * value in `raw()` when it is markup you produced yourself (an icon, a nested
 * component's output), and interpolate arrays directly — they join with "".
 */

const RAW = Symbol('raw');

/**
 * Mark a string as trusted markup so `html` interpolates it verbatim.
 * The result stringifies to the markup, so it can be assigned to innerHTML or
 * nested inside another `html` template without ceremony.
 */
export function raw(value) {
  return { [RAW]: true, value: String(value), toString() { return this.value; } };
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function interpolate(value) {
  if (value == null || value === false) return '';
  if (Array.isArray(value)) return value.map(interpolate).join('');
  if (typeof value === 'object' && value[RAW]) return value.value;
  return escapeHtml(value);
}

/**
 * Tagged template for markup. Interpolations are escaped unless they are
 * already trusted (another `html` result, `raw`, `each`, `when`), so nesting
 * components composes naturally and CMS text never escapes its slot.
 */
export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += interpolate(values[i]) + strings[i + 1];
  return raw(out);
}

/** Conditional fragment — `when(cond, () => html`…`)`. */
export function when(condition, fragment) {
  return condition ? raw(typeof fragment === 'function' ? fragment() : fragment) : '';
}

/** Map a list to markup — `each(items, it => html`…`)`. */
export function each(items, fragment) {
  return raw((items || []).map((item, i) => fragment(item, i)).join(''));
}

export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
