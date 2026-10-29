/**
 * gate.js — closes a page whose feature switch is off.
 *
 * Hiding the links to a page is not the same as hiding the page: a bookmark,
 * a search result or a typed URL still reaches it. A gated page starts with
 * `class="gated"` on <body> (which site.css renders invisible), so nothing of
 * it is ever painted; this either reveals it or sends the visitor home.
 *
 * Nothing is deleted — flip the switch in data/site.js and the page returns.
 */
import { features } from '../data/site.js';

export function gate(name) {
  if (features[name]) {
    document.body.classList.remove('gated');
    return true;
  }
  window.location.replace('index.html');
  return false;
}
