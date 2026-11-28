/**
 * erp-map.js — the one place the ERP's shape is known.
 *
 * Pure functions: no fetch, no DOM, no storage. Everything here turns what
 * Chalked sends into what data/site.js already describes, so every component
 * downstream keeps reading the shape it always read.
 *
 * `tools/sync-notices.py` holds a port of the two notice mappers in Python,
 * because the prerenderer needs them without a browser. The two stay honest by
 * staying trivial — the same bargain `roman()` in services/admission.js and
 * `classNumeral_()` in integrations/admission-sheet/Code.gs already strike.
 * Change one, change the other.
 */
import { allFields } from './admission.js';
import { formFor } from '../data/site.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `published_on` is a date or a datetime; only the date part is ever shown. */
function parts(publishedOn) {
  const [y, m, d] = String(publishedOn || '').slice(0, 10).split('-');
  const month = MONTHS[Number(m) - 1];
  return month && d && y
    ? { day: `${d} ${month}`, year: y, full: `${d} ${month} ${y}` }
    : { day: '', year: '', full: String(publishedOn || '') };
}

/**
 * PDFs the site already serves itself.
 *
 * An attachment on Chalked is a link into Chalked. Baked into a page that
 * Google indexes, that sends readers — and the crawler — off to another
 * domain for the school's own notice, and a link that is signed or rotated
 * rots the moment it changes. Where the office has uploaded a file we already
 * host, keep ours. Add a line when a notice PDF lands in assets/pdf/.
 */
const LOCAL_PDFS = {
  'admission-notice-2027-bengali-medium.pdf': 'assets/pdf/admission-notice-2027-bengali-medium.pdf',
  'admission-notice-2027-english-medium.pdf': 'assets/pdf/admission-notice-2027-english-medium.pdf',
};

/** The one attachment a row can link to, or null. The row has one button. */
export function primaryAttachment(notice) {
  const first = (notice.attachments || [])[0];
  if (!first) return null;
  return { ...first, url: LOCAL_PDFS[first.filename] || first.url };
}

/**
 * The category chip, guessed.
 *
 * Chalked has no category or tag on a notice, and the notice page filters by
 * one. So it is inferred from the wording, which is a guess and occasionally
 * a wrong one — a misfiled notice hides behind a filter nobody thinks to
 * clear. The filter defaults to "All", which keeps a wrong guess survivable.
 * Ask the ERP for a real `category` field and delete this.
 */
export function inferCategory(notice) {
  const text = `${notice.title || ''} ${notice.body || ''}`;
  if (/admission|ভর্তি/i.test(text)) return { category: 'Admission', tone: 'accent' };
  if (/result|ফলাফল/i.test(text)) return { category: 'Results', tone: 'accent' };
  if (/holiday|ছুটি/i.test(text)) return { category: 'Holidays', tone: 'neutral' };
  if (/exam|পরীক্ষা/i.test(text)) return { category: 'Examination', tone: 'neutral' };
  return { category: 'Notice', tone: 'neutral' };
}

/** ERP notice → a row of the home page strip. */
export function noticeStripRow(notice) {
  const when = parts(notice.published_on);
  const file = primaryAttachment(notice);
  const { category, tone } = inferCategory(notice);
  return {
    day: when.day,
    year: when.year,
    text: notice.title || '',
    tag: category,
    tone,
    /* No attachment means no document to open, so the row points at the
       notice page rather than nowhere. */
    href: file ? file.url : 'notice.html',
  };
}

/**
 * ERP notice → a row of the notice archive.
 *
 * Two fields cannot be carried and are worth naming. `ref` holds the school's
 * own file number ("Ref. PBAB/BMU/ADM2027/01 · Online form 5–25 Nov …") and
 * Chalked has nowhere to put it, so it is taken from the first line of the
 * body — which only works if the office writes it there. And the size in
 * "PDF · 333 KB" is not in the attachment shape at all, so the label degrades
 * to the type alone.
 */
export function noticeBoardRow(notice) {
  const when = parts(notice.published_on);
  const file = primaryAttachment(notice);
  const { category, tone } = inferCategory(notice);
  const firstLine = String(notice.body || '').split('\n').map((l) => l.trim()).find(Boolean) || '';
  return {
    date: when.full,
    year: when.year,
    title: notice.title || '',
    ref: firstLine,
    pdf: file ? 'PDF' : '',
    href: file ? file.url : '#',
    category,
    tone,
  };
}

/** ERP gallery → the shape photo-gallery.js draws. A caption with no file
    still renders, as the hatched plate the gallery already uses. */
export function galleryPhotos(items) {
  return (items || []).map((item) => ({ image: item.url || null, caption: item.caption || '' }));
}

/* ── submissions ────────────────────────────────────────────────────────── */

const digits = (value) => String(value || '').replace(/\D+/g, '');

/**
 * One application, as Chalked wants it.
 *
 * `values` is built by walking the form schema rather than a hand-written list
 * of keys, so a question added to data/site.js is carried here without anyone
 * remembering to, and a field a stream omits is omitted here too.
 *
 * Three keys are added that are not questions: `websiteReference` joins this
 * row to the PBAB number on the family's printed form, `clientRef` makes a
 * duplicate findable if a retry ever files one, and `medium` records which
 * register it belongs to even though the tenant already implies it.
 *
 * Unanswered optional fields are left out rather than sent empty, so the ERP
 * sees "not asked" rather than "asked and blank".
 */
export function admissionPayload({ data, medium, clientRef, websiteRef }) {
  const values = {};
  for (const field of allFields(formFor(medium))) {
    const value = (data[field.name] ?? '').toString().trim();
    if (value) values[field.name] = value;
  }
  values.websiteReference = websiteRef || '';
  values.clientRef = clientRef || '';
  values.medium = medium || '';

  return { name: data.nameEn || '', phone: digits(data.phone), values };
}

/**
 * One enquiry, as Chalked wants it.
 *
 * The contact form asks who is writing and what about; `/queries` has room for
 * neither. Both are folded into the top of the message, which is lossy for a
 * machine and lossless for the person who reads it. Filtering enquiries by
 * subject in the ERP will not work until `/queries` grows the field.
 */
export function queryPayload(data) {
  const preface = [
    data.subject ? `Subject: ${data.subject}` : '',
    data.role ? `I am a: ${data.role}` : '',
  ].filter(Boolean).join('\n');

  const email = (data.email || '').trim();
  return {
    name: data.name || '',
    phone: digits(data.mobile),
    ...(email ? { email, confirm_email: email } : {}),
    message: preface ? `${preface}\n\n${data.message || ''}` : (data.message || ''),
  };
}
