/**
 * content.js — where page content is fetched from.
 *
 * By default every collection resolves straight out of data/site.js, so the
 * site works with no server at all. The call is a Promise on purpose: the
 * school's CMS points `setContentAdapter()` at itself (see erp-content.js) and
 * the components that already await this — and already render skeletons while
 * they wait — keep working unchanged.
 *
 * `localContent` is exported because an adapter needs it: one that serves only
 * some collections has to hand the rest back to this file, and one that falls
 * back when the CMS is unreachable has to reach the local copy to fall back
 * TO. Replacing the adapter must not mean losing the floor underneath it.
 */
import { notices, noticeBoard, events, staff, about } from '../data/site.js';

const LOCAL = {
  notices: () => notices,
  noticeBoard: () => noticeBoard.list,
  gallery: () => about.gallery.photos,
  events: () => events,
  staff: () => staff,
};

/** A collection as data/site.js has it. Throws on a name nothing knows. */
export function localContent(key) {
  const get = LOCAL[key];
  if (!get) throw new Error(`Unknown content collection: ${key}`);
  return get();
}

let adapter = async (key) => localContent(key);

export function setContentAdapter(next) { adapter = next; }

/** Load a collection by name. Rejects the way a real fetch would. */
export function load(key) { return adapter(key); }
