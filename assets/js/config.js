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
  admissionEndpoint: 'https://script.google.com/macros/s/AKfycbyiriORtpA-_aiamU4h9cufWucCjXjOeJS3TRhjWSDKz9X3YU-KwQk31cDDTT66hXpPkA/exec',

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
  admissionSession: '2027',

  /**
   * Chalked, the school's management software.
   *
   * Public and unauthenticated by design — there is no key to keep out of this
   * file. What there IS, is an allowlist at the other end: the ERP permits
   * browser calls only from origins the school has named, so https://pbab.in
   * and http://localhost:8000 are each separately allowed or separately
   * refused. A 'network' failure on localhost usually means the latter.
   *
   * The switch is `features.erp` in data/site.js, not here: this file holds
   * where things are, that one holds whether they are on.
   */
  erp: {
    /** `{code}` is substituted twice — once as subdomain, once in the path. */
    urlTemplate: 'https://{code}.chalked.in/api/public/{code}',

    /* Site content comes from the Bengali-medium tenant alone. The English
       tenant is a separate register, not a second website. */
    contentTenant: 'purba-barasat',

    /* Applications route by medium, because the two mediums are two tenants
       with two application registers — the same split the spreadsheets had. */
    tenants: { bengali: 'purba-barasat', english: 'pbab-english' },

    /**
     * Content timeout. Keep it WELL under the --virtual-time-budget in
     * tools/prerender.py: a timer armed past that budget means the prerender
     * dump fires while the fetch is still in flight, and a loading skeleton
     * gets baked into the page. 4s against a 9s budget leaves room.
     */
    contentTimeoutMs: 4000,

    /* Submissions get longer: a parent will wait, and losing an application
       to an impatient timeout is worse than a slow spinner. */
    submitTimeoutMs: 12000,

    /* How many notices to ask for. The notice board pages client-side, so it
       needs the whole list rather than a window of it. */
    noticeLimit: 200,

    /* Cache the content response for a few minutes in sessionStorage, so
       clicking Home → Notice does not fetch the same payload twice. */
    contentCacheMs: 5 * 60 * 1000,
  },
};
