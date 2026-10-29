/**
 * component.js — base class for every site component.
 *
 * Components render into the light DOM on purpose: the design system is one
 * global stylesheet, and a shadow root would cut every block off from it.
 * Subclasses implement `render()` (markup) and optionally `hydrate()`
 * (listeners, state) — `hydrate` runs after each render, so re-rendering
 * never leaves stale handlers behind.
 */
export class SiteComponent extends HTMLElement {
  connectedCallback() {
    if (this._mounted) return;
    this._mounted = true;
    this.update();
  }

  /** Re-render and re-attach behaviour. Call after changing state. */
  update() {
    this.innerHTML = String(this.render());
    this.hydrate();
  }

  /** Read an attribute with a fallback — attributes are this component's props. */
  prop(name, fallback = '') {
    return this.hasAttribute(name) ? this.getAttribute(name) : fallback;
  }

  /** Read a boolean attribute (`<x-thing open>` or `open="true"`). */
  boolProp(name) {
    const value = this.getAttribute(name);
    return value !== null && value !== 'false';
  }

  render() { return ''; }
  hydrate() {}
}

/** Register a component, ignoring a duplicate definition on hot reload. */
export function define(tagName, componentClass) {
  if (!customElements.get(tagName)) customElements.define(tagName, componentClass);
}
