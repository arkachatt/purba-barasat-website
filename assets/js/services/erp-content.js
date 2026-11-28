/**
 * erp-content.js — notices and the gallery, read from the school's CMS.
 *
 * One request serves the whole site: `GET /site` carries notices, gallery,
 * staff and admission together, and the three pages that want any of it would
 * otherwise make three. A module-level promise dedupes it within a page load;
 * sessionStorage carries it across one, so Home → Notice does not fetch twice.
 *
 * THE FALLBACK LADDER, which is the whole point of this file:
 *
 *     a fresh GET /site  →  the cached one  →  data/site.js
 *
 * It never rejects for a collection it serves. A school's notice page going
 * blank because a server blinked is worse than it being a few hours stale, and
 * a guardian looking for an admission notice at 11pm does not care whose fault
 * it is. The cost is stated plainly: **the CMS cannot publish "nothing"** — an
 * empty list reads as "say what we said last time", not "we withdrew it".
 *
 * That is only honest if data/site.js is kept as a MIRROR of the CMS rather
 * than a second, drifting copy — which is what `tools/sync-notices.py` is for,
 * and why it belongs in the release ritual in CLAUDE.md. Without that sync, a
 * notice deleted in the CMS would come back from this file forever.
 */
import { config } from '../config.js';
import { erpGet } from './erp.js';
import { localContent, setContentAdapter } from './content.js';
import { galleryPhotos, noticeBoardRow, noticeStripRow } from './erp-map.js';

/** Collections this adapter serves. Everything else goes straight to local. */
const SERVES = new Set(['notices', 'noticeBoard', 'gallery']);

const CACHE_KEY = 'pbab.erp.site';

/** Where the answer for this page load came from, for a console check. */
let source = 'local';
export function contentSource() { return source; }

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, tenant, site } = JSON.parse(raw);
    const fresh = Date.now() - at < config.erp.contentCacheMs;
    return fresh && tenant === config.erp.contentTenant ? site : null;
  } catch { return null; }
}

function writeCache(site) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      at: Date.now(), tenant: config.erp.contentTenant, site,
    }));
  } catch { /* private mode, or full — the fetch still worked */ }
}

/* One in-flight request per page load, whatever asks for it. */
let pending = null;

function fetchSite() {
  if (pending) return pending;
  pending = erpGet(config.erp.contentTenant, '/site', {
    params: { notices: config.erp.noticeLimit },
  }).then((site) => {
    writeCache(site);
    source = 'erp';
    return site;
  }).catch((err) => {
    const cached = readCache();
    if (cached) { source = 'cache'; return cached; }
    source = 'local';
    throw err;
  });
  return pending;
}

/** Pull one collection out of a /site payload, or null when it has none. */
function fromSite(site, key) {
  if (key === 'gallery') {
    const photos = galleryPhotos(site.gallery);
    return photos.length ? photos : null;
  }
  const notices = site.notices || [];
  if (!notices.length) return null;
  return key === 'notices' ? notices.map(noticeStripRow) : notices.map(noticeBoardRow);
}

export async function erpContentAdapter(key) {
  if (!SERVES.has(key)) return localContent(key);

  try {
    const got = fromSite(await fetchSite(), key);
    if (got) return got;
    /* The CMS answered, and has nothing. See the note at the top: this is
       read as "unchanged", not "withdrawn". */
    source = 'local';
  } catch {
    source = 'local';
  }
  return localContent(key);
}

export function installErpContent() { setContentAdapter(erpContentAdapter); }
