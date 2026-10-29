/**
 * content.js — where page content is fetched from.
 *
 * Today every collection resolves straight out of data/site.js, so the site
 * works with no server at all. The call is a Promise on purpose: when the
 * office's CMS arrives, point `setContentAdapter()` at it and the components
 * that already await this — and already render skeletons while they wait —
 * keep working unchanged.
 */
import { notices, noticeBoard, events, staff } from '../data/site.js';

const LOCAL = {
  notices: () => notices,
  noticeBoard: () => noticeBoard.list,
  events: () => events,
  staff: () => staff,
};

let adapter = async (key) => {
  const get = LOCAL[key];
  if (!get) throw new Error(`Unknown content collection: ${key}`);
  return get();
};

export function setContentAdapter(next) { adapter = next; }

/** Load a collection by name. Rejects the way a real fetch would. */
export function load(key) { return adapter(key); }
