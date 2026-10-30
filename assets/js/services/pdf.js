/**
 * pdf.js — builds the printable application form.
 *
 * The guardian prints this and carries it to the school office, so it is the
 * one artefact that must survive a bad network. jsPDF is fetched only when
 * someone actually submits, so no ordinary visitor pays for it, and every
 * jsPDF-specific coordinate stays inside this module — nothing else in the
 * site knows the library exists.
 *
 * The built-in PDF fonts are Latin-1 only, so Bengali cannot be drawn here.
 * Fields marked `pdfSkip` are left out, and anything else non-Latin is
 * flagged rather than silently turned into mojibake.
 */
import { admissionStreams } from '../data/site.js';
import { config } from '../config.js';
import { school, admissionForm } from '../data/site.js';

export class PdfUnavailableError extends Error {}

/* ── loading ────────────────────────────────────────────────────────────── */

let loading = null;

/** Load a classic script and resolve once it has run. */
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-pdf-lib="${url}"]`);
    if (existing) { existing.addEventListener('load', resolve); existing.addEventListener('error', reject); return; }
    const tag = document.createElement('script');
    tag.src = url;
    tag.dataset.pdfLib = url;
    tag.onload = resolve;
    tag.onerror = () => reject(new Error(`could not load ${url}`));
    document.head.appendChild(tag);
  });
}

/**
 * Resolve the jsPDF constructor, trying each configured source in turn.
 * Put a vendored copy first in `config.pdfSources` to make this work offline.
 */
export async function loadJsPdf() {
  if (loading) return loading;
  loading = (async () => {
    for (const source of config.pdfSources || []) {
      try {
        if (source.type === 'script') {
          await loadScript(source.url);
          const ctor = globalThis.jspdf?.jsPDF || globalThis.jsPDF;
          if (typeof ctor === 'function') return ctor;
          continue;
        }
        const module = await import(/* @vite-ignore */ source.url);
        const ctor = module.jsPDF || module.default?.jsPDF || module.default;
        if (typeof ctor === 'function') return ctor;
      } catch { /* try the next source */ }
    }
    loading = null;                       // let a later attempt try again
    throw new PdfUnavailableError('The PDF generator could not be loaded.');
  })();
  return loading;
}

/* ── text helpers ───────────────────────────────────────────────────────── */

/** `2016-04-12` from a date input → `12/04/2016`. */
function formatDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  return String(value || '');
}

function formatStamp(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).replace(',', '');
}

/**
 * The built-in fonts cover Latin-1 only, so anything beyond it is dropped
 * rather than drawn as scrambled glyphs.
 *
 * Template text — the school's name, the group headings, the declaration —
 * is bilingual by design, and losing its Bengali half here is expected, so
 * that is not reported. Only an applicant's own answer being dropped earns
 * the note at the foot of the form.
 */
const dropped = { count: 0 };

const BEYOND_LATIN1 = /[^\u0000-ÿ]/;

function latin1(value) {
  const text = String(value ?? '').trim();
  if (!BEYOND_LATIN1.test(text)) return text;
  return text.replace(/[^\u0000-ÿ]+/g, '').replace(/\s{2,}/g, ' ').trim();
}

/** As `latin1`, but counts the loss so the form can admit to it. */
function latin1Value(value) {
  const text = String(value ?? '').trim();
  if (!BEYOND_LATIN1.test(text)) return text;
  dropped.count += 1;
  return latin1(text) || "(see the school's online record)";
}

/* ── the document ───────────────────────────────────────────────────────── */

const PAGE = { w: 210, h: 297, margin: 15 };
const CONTENT = PAGE.w - PAGE.margin * 2;
const COL_W = CONTENT / 2;    // two field columns, so a short form stays one page
const LABEL_W = 34;           // label cell inside a half-width column
const LABEL_W_FULL = 58;      // label cell when the value spans the page
const ROW_H = 5.6;
const SIG_SPACE = 10;         // signature rules and their captions
const OFFICE_SPACE = 30;      // the "for office use only" box

/**
 * @param {{ receipt: { reference, submittedAt, synced, data } }} args
 * @returns {Promise<{ blob: Blob, filename: string }>}
 */
export async function buildApplicationPdf({ receipt }) {
  const JsPDF = await loadJsPdf();
  const doc = new JsPDF({ unit: 'mm', format: 'a4', compress: true });
  dropped.count = 0;

  const data = receipt.data || {};
  let y = PAGE.margin;

  /* — masthead, with the photograph box the office expects — */
  const photo = { w: 32, h: 34, x: PAGE.w - PAGE.margin - 32, y: PAGE.margin };
  doc.setDrawColor(120); doc.setLineWidth(0.3);
  doc.rect(photo.x, photo.y, photo.w, photo.h);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(110);
  doc.text(['Affix a recent', 'passport', 'photograph'], photo.x + photo.w / 2, photo.y + 14,
    { align: 'center', lineHeightFactor: 1.5 });

  const headCentre = (PAGE.margin + photo.x - 4) / 2;
  doc.setTextColor(20);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  y += 6;
  doc.text(latin1(school.name).toUpperCase(), headCentre, y, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(70);
  y += 5.5;
  doc.text(latin1(school.address.join(', ')), headCentre, y, { align: 'center' });
  y += 4;
  doc.text(`Phone ${school.phones.map((p) => p.label).join(' / ')} · ${school.email.label} · DISE ${school.diseCode}`,
    headCentre, y, { align: 'center' });
  y += 4;
  doc.text('Government-sponsored · Affiliated to WBBSE & WBCHSE', headCentre, y, { align: 'center' });

  y = photo.y + photo.h + 5;
  doc.setDrawColor(40); doc.setLineWidth(0.5);
  doc.line(PAGE.margin, y, PAGE.w - PAGE.margin, y);

  /* — title band — */
  y += 5;
  doc.setFillColor(35); doc.rect(PAGE.margin, y, CONTENT, 8, 'F');
  doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5);
  doc.text('APPLICATION FOR ADMISSION', PAGE.w / 2, y + 5.4, { align: 'center' });
  y += 11;
  doc.setTextColor(40); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  /* The masthead is the school's identity and never varies; the medium is a
     property of this one application, so it belongs on this band beside the
     class. It costs no vertical space, which matters — the form fits one page
     with about 25mm to spare and that slack is for values that wrap. */
  const stream = admissionStreams[receipt.medium];
  doc.text([latin1(data.class), stream?.label, `Session ${config.admissionSession}`]
    .filter(Boolean).join(' · '), PAGE.w / 2, y, { align: 'center' });

  /* — reference line — */
  y += 7;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text(`Application No.  ${receipt.reference}`, PAGE.margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Submitted  ${formatStamp(receipt.submittedAt)}`, PAGE.w - PAGE.margin, y, { align: 'right' });
  if (!receipt.synced) {
    y += 4.2;
    doc.setFontSize(7.5); doc.setTextColor(110);
    doc.text('Reference issued by the school website — not yet registered at the office.',
      PAGE.margin, y);
    doc.setTextColor(40);
  }
  y += 6;

  /* — the answers, grouped as they were on screen — */
  const newPageIfNeeded = (needed) => {
    if (y + needed <= PAGE.h - PAGE.margin - 6) return;
    doc.addPage();
    y = PAGE.margin;
  };

  /** One label/value cell pair. Returns the height it used. */
  const drawCell = (field, x, width, top) => {
    const labelWidth = width === CONTENT ? LABEL_W_FULL : LABEL_W;
    const raw = field.type === 'date' ? formatDate(data[field.name]) : data[field.name];
    const value = latin1Value(raw) || '—';

    /* Measure each string at the size it will actually be drawn at.
       splitTextToSize uses whatever size is current, so measuring the value
       before setting 8.5 wrapped it against the 7pt label size left over from
       the previous cell — a long school name then wrapped a word too late and
       ran over the top of the next cell's label. */
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(value, width - labelWidth - 6);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    const labelLines = doc.splitTextToSize(latin1(field.pdfLabel || field.label), labelWidth - 4);
    /* The row has to clear whichever of the two wraps further. */
    const height = Math.max(ROW_H, lines.length * 3.6 + 2.0, labelLines.length * 3.3 + 2.3);

    doc.setDrawColor(190); doc.setLineWidth(0.2);
    doc.rect(x, top, labelWidth, height);
    doc.rect(x + labelWidth, top, width - labelWidth, height);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(90);
    doc.text(labelLines, x + 2, top + 3.9);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(20);
    doc.text(lines, x + labelWidth + 2.5, top + 4.0);
    return height;
  };

  /* The shared schema, not the stream's. That is correct only while no
     label, order or pdfSkip flag varies by medium — the streams differ in a
     field's `options`, and what gets printed is the answer from `data`. The
     day a label varies, this needs formFor(receipt.medium). */
  for (const group of admissionForm.groups) {
    const printable = group.fields.filter((field) => !field.pdfSkip);
    if (!printable.length) continue;

    newPageIfNeeded(14);
    doc.setFillColor(238); doc.rect(PAGE.margin, y, CONTENT, 4.8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(40);
    doc.text(latin1(group.title).toUpperCase(), PAGE.margin + 2.5, y + 3.4);
    y += 4.8;

    /* Short answers pair up two to a row; anything full-width takes its own. */
    for (let i = 0; i < printable.length; i += 1) {
      const field = printable[i];
      const partner = field.half && printable[i + 1]?.half ? printable[i + 1] : null;

      if (!field.half) {
        newPageIfNeeded(ROW_H);
        y += drawCell(field, PAGE.margin, CONTENT, y);
        continue;
      }

      newPageIfNeeded(ROW_H);
      /* Measure both before drawing so the pair shares one row height. */
      const probe = (f, x) => drawCell(f, x, COL_W, y);
      const left = probe(field, PAGE.margin);
      const right = partner ? probe(partner, PAGE.margin + COL_W) : 0;
      const height = Math.max(left, right);
      if (!partner) {
        /* Leave the empty half ruled, so the form does not look truncated. */
        doc.setDrawColor(190); doc.setLineWidth(0.2);
        doc.rect(PAGE.margin + COL_W, y, COL_W, height);
      }
      y += height;
      if (partner) i += 1;
    }
    y += 2;
  }

  /* — declaration, signatures and the office block always travel together — */
  /* Measure the tail rather than reserving a guess: a guessed reserve was
     pushing a form that fits onto a needless second page. The tail may also
     sit closer to the foot than a table row should, so it gets its own bound. */
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  const declLines = doc.splitTextToSize(latin1(admissionForm.declaration), CONTENT - 8);
  const declHeight = declLines.length * 4 + 9;
  const tailHeight = 2 + declHeight + 12 + SIG_SPACE + OFFICE_SPACE;
  if (y + tailHeight > PAGE.h - 11) { doc.addPage(); y = PAGE.margin; }
  y += 2;
  doc.setDrawColor(120); doc.setLineWidth(0.3);
  doc.rect(PAGE.margin, y, CONTENT, declHeight);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(90);
  doc.text('DECLARATION', PAGE.margin + 4, y + 5);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(30);
  doc.text(declLines, PAGE.margin + 4, y + 10);
  y += declHeight + 12;

  const sigWidth = 52;
  [['Signature of applicant', PAGE.margin],
   ['Signature of parent / guardian', PAGE.margin + 62],
   ['Date', PAGE.margin + 130]].forEach(([caption, x]) => {
    doc.setDrawColor(60); doc.setLineWidth(0.3);
    doc.line(x, y, x + sigWidth, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(90);
    doc.text(caption, x, y + 4);
  });
  y += SIG_SPACE;

  /* — office use — */
  const officeHeight = OFFICE_SPACE;
  doc.setDrawColor(120); doc.setLineWidth(0.3);
  doc.rect(PAGE.margin, y, CONTENT, officeHeight);
  doc.setFillColor(238); doc.rect(PAGE.margin, y, CONTENT, 6, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(40);
  doc.text('FOR OFFICE USE ONLY', PAGE.margin + 3, y + 4.1);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(60);
  doc.text('Documents verified:    [  ] Birth certificate    [  ] Aadhaar    [  ] Report card    [  ] Caste certificate',
    PAGE.margin + 3, y + 11);
  doc.text('Received by ______________________     Date ______________     Remarks ______________________',
    PAGE.margin + 3, y + 18);
  doc.text('Signature of Head Master with seal', PAGE.w - PAGE.margin - 3, y + 26, { align: 'right' });

  /* — footer on every page — */
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(120);
    doc.text('Generated from the school website. Print, sign and submit at the office with the original documents.',
      PAGE.margin, PAGE.h - 8);
    doc.text(`Page ${page} of ${pages}`, PAGE.w - PAGE.margin, PAGE.h - 8, { align: 'right' });
    if (dropped.count && page === pages) {
      doc.text('Some entries could not be printed in English — the school office holds the full online record.',
        PAGE.margin, PAGE.h - 4.5);
    }
  }

  const filename = `PBAB-Application-${String(receipt.reference).replace(/[^\w]+/g, '-')}.pdf`;
  return { blob: doc.output('blob'), filename };
}

/** Build the form and hand it to the browser as a download. */
export async function downloadApplicationPdf({ receipt }) {
  const { blob, filename } = await buildApplicationPdf({ receipt });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return filename;
}
