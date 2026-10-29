/**
 * config.js — deployment settings, kept apart from content.
 *
 * Nothing here is a secret: a published Apps Script URL is public by design,
 * and anything in a static site is readable anyway. It lives in its own file
 * so that swapping a backend never means editing the school's content.
 */
export const config = {
  /**
   * Where the admission form posts. Paste the Apps Script web-app URL here —
   * the one ending in `/exec`. See docs/apps-script/README.md.
   *
   * Left empty, the form still works end to end: it validates, builds the PDF
   * and issues a local reference, and tells the applicant the reference was
   * issued by the website rather than the office.
   */
  admissionEndpoint: '',

  /** How long to wait for that endpoint before falling back (milliseconds). */
  admissionTimeoutMs: 12000,

  /**
   * Where to load the PDF generator from, tried in order until one works.
   *
   *   { type: 'module', url }  → dynamic import(); the module must have no
   *                              bare specifiers. jsPDF's own `dist/*.es.js`
   *                              does have them (it imports @babel/runtime),
   *                              so use a CDN that resolves them: jsDelivr's
   *                              `/+esm` endpoint or esm.sh.
   *   { type: 'script', url }  → a classic <script> tag; the UMD build puts
   *                              the constructor on window.jspdf.jsPDF.
   *
   * To make the form work with no network at all, download
   * https://cdn.jsdelivr.net/npm/jspdf@3.0.1/dist/jspdf.umd.min.js into
   * `assets/vendor/` and put it first:
   *   { type: 'script', url: 'assets/vendor/jspdf.umd.min.js' },
   */
  pdfSources: [
    { type: 'module', url: 'https://cdn.jsdelivr.net/npm/jspdf@3.0.1/+esm' },
    { type: 'module', url: 'https://esm.sh/jspdf@3.0.1' },
    { type: 'script', url: 'https://cdn.jsdelivr.net/npm/jspdf@3.0.1/dist/jspdf.umd.min.js' },
  ],

  /** Session the admission form is collecting for, used on the printed form. */
  admissionSession: '2027–28',
};
