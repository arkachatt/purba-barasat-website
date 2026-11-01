# Purba Barasat Adarsha Bidyapith — website

A faithful build of the claude.ai/design project (Industry design system) as a
static site: all 13 designed screens across files 01–05. No framework, no build
step.

```
python -m http.server 8000     # then http://localhost:8000
```

ES modules need HTTP — opening `index.html` over `file://` will not work.

## Pages

| Page | File | Design |
|---|---|---|
| Home | `index.html` | 01 · 1a–1d |
| Log In gateway | `login.html` | 01 · 1e–1f |
| About Us | `about.html` | 02 · 1a–1b |
| From HM's Desk | `hm.html` | 02 · 1c–1d |
| Teachers | `teachers.html` | 02 · 1e–1f |
| Students | `students.html` | 02 · 1g–1h |
| Admission | `admission.html` | 03 · 1a–1c |
| Online application | `admission-form.html` | 03 · 1d–1j |
| Confirmation | `admission-submitted.html` | 03 · 1k–1l |
| Academic Calendar | `calendar.html` (`#holidays` `#exams` `#syllabus`) — hidden | 04 · all |
| Results & Events | `results.html` | 05 · 1a–1b |
| Event detail | `event.html?id=…` | 05 · 1c–1d |
| Notice board | `notice.html` | 05 · 1e–1g |
| Contact Us | `contact.html` | 05 · 1h–1i |
| Component sheet (handoff) | `styleguide.html` | 06 · all |

## Component sheet

`styleguide.html` is the design system as applied, in one page: the token ramps
and type scale, every kit component in its variants and states, and the loading,
empty and error states. It is `noindex` and unlinked from the site nav — it is
for whoever picks the code up next. Design file 06 is its source.

## Layout

```
assets/
  css/
    tokens.css             design-system tokens (colour ramps, type, space, elevation)
    base.css               element defaults + fonts
    components.css         the Industry kit: .btn .input .seg .card .tag .table .blueprint
    layout.css             page shell: measure, section heads, splits
    site.css               the one stylesheet a page links; imports everything
    blocks/*.css           one file per site component
  js/
    core/dom.js            escaping template tag (`html`, `raw`, `each`, `when`)
    core/component.js      SiteComponent base class + define()
    core/icons.js          the icon set
    data/site.js           ALL editable content, in CMS shape, sectioned per design file
    services/              the seams to real systems: auth, admission, enquiry
    components/*.js        one custom element per block
    main.js                imports every component (registration)
```

## How it is put together

**Content is data.** Nothing in `components/` hard-codes a notice, a teacher, a
holiday or a form field. `data/site.js` is sectioned by design file; replace it
with `fetch()` against a real CMS and the components are untouched.

**Components are custom elements in the light DOM**, rendered with the `html`
tagged template, which escapes every interpolation. Light DOM is deliberate —
the design system is one global stylesheet, and a shadow root would cut each
block off from it.

**One markup tree per component, two layouts.** Where the design genuinely
changes shape between 1440 and 390 — a seven-column staff table becoming cards
with Call/Email buttons, an exam grid becoming per-class panels, three log-in
forms becoming a role picker — both structures are rendered from the same data
and CSS picks at `max-width: 1023px`.

**Forms are schema-driven.** The admission form and the contact
form both render, validate and summarise themselves from field definitions in
`data/site.js`. Adding a question is one entry there.

## Adding to it

- **A new page** — copy `contact.html`, keep `<site-header>` / `<site-footer>`,
  put blocks inside `<main class="page-main">`.
- **A new component** — add `assets/js/components/<name>.js` (extend
  `SiteComponent`, call `define()`), add `assets/css/blocks/<name>.css`, then
  one `@import` in `site.css` and one `import` in `main.js`.
- **A new nav section** — one entry in `navigation` in `data/site.js`. A
  `children` array becomes a desktop dropdown and a mobile drawer group.
- **Retuning the look** — `tokens.css` only.

## States

Three states every admin-updated site hits are real components, not decoration:

- `<skeleton-rows>` — flat grey blocks in the row's real geometry, no shimmer, so
  a low-end phone spends nothing on repaint. The notice board renders them while
  `services/content.js` resolves.
- `<empty-state>` — "no notices yet", "no events posted", "results not published
  yet". A section the office has not filled gets an explanation and a way
  forward, never a blank frame.
- `<state-alert>` — the one alert, in an error and a status tone. Errors take
  full-strength ink and a doubled hairline rather than a red fill: the palette is
  mono, so weight carries the alarm. Used by the admission form's failed submit
  and by `<offline-bar>`, which sits in every page shell and appears only when
  the browser goes offline.

## The admission form

`admission-form.html` is a single page of questions built from
`admissionForm.groups` in `data/site.js`.

It serves **two streams**, Bengali and English medium, chosen by `?medium=` on
the URL. They share all thirty-one questions and differ only in the classes on
offer — Bengali admits to Class V, English to Classes V–VIII — which
`formFor()` patches in. English lists Class IX too, greyed and unselectable:
`admissionClosedClasses` in `data/site.js` is the one place that says which
classes are listed but not admitted this session, and it also keeps the class
out of the eligibility line published on the admission page. Delete a class
from that array to open it. Each writes to its **own spreadsheet with its own serial
numbering**, so both run their own 00001, and references carry the medium and
the class: `PBAB/27/B/V/00001`, `PBAB/27/E/VII/00002`. With no usable
`?medium=` the page offers a choice rather than guessing, because a child
filed in the wrong register cannot be taken back out of it.

Submitting does three things, in this order:

1. **Posts to a Google Sheet** through a Google Apps Script web app, which
   returns the official reference number. Set the endpoint in
   `assets/js/config.js`; the script and its ten-minute deployment guide are
   in `integrations/admission-sheet/`.
2. **Builds and downloads a one-page A4 PDF** — the form the guardian prints,
   signs and brings to school, with signature lines and an office-use box.
3. **Hands over to the confirmation page**, which can download the PDF again.

The PDF is produced **whatever the network does**. If the sheet cannot be
reached the reference is minted locally and marked `W-` so the office can see
at a glance that it was never registered online, and the confirmation page
offers to retry sending.

**Adding a question** is one object in one group in `data/site.js`, plus its
`name` appended to `COLUMNS` in `Code.gs`. It then appears on screen, in both
sheets and on the PDF automatically.

**Adding a class** is a row in `admissionDobRanges` — the window of birth
dates the notice publishes for it — and an entry in that stream's `classes` /
`lastClasses` in `data/site.js`. The Apps Script needs no
change: it takes the numeral off the submitted class name rather than keeping
a table of its own.

**The one dependency.** jsPDF is fetched from a CDN *only when someone
submits*, so ordinary visitors never download it. `config.pdfSources` lists
fallbacks in order; to make the form work with no network at all, drop
jsPDF's `jspdf.umd.min.js` into `assets/vendor/` and put it first in that
list. Note that jsPDF's own `.es.min.js` build cannot be imported directly in
a browser — it has bare specifiers — which is why the list uses jsDelivr's
`/+esm` endpoint.

**English only on the PDF.** The built-in PDF fonts cannot draw Bengali, so
the Bengali name is collected and stored but left off the printout, and any
other Bengali typed into an English field is dropped with a note at the foot
of the form rather than printed as mojibake.

## Hosting on GitHub Pages

The site is plain static files with no build step, so it works as-is: push the
repo and enable Pages. Every path is relative, so a project page served from
`/<repo>/` works without changes, and a `.nojekyll` file is included so that
nothing is run through Jekyll. The admission form posts cross-origin to Apps
Script, which is fine from a Pages origin.

## Feature switches

`features` at the top of `data/site.js` hides parts of the site without
deleting anything — the page, its component and its content all stay in place:

```js
export const features = { login: false, results: false, calendar: false, enquiry: false };
```

Turning one off hides every way in (header button, nav item, dropdown entry,
footer link, home tile) **and** closes the page itself: a gated page carries
`class="gated"` on `<body>`, which `site.css` renders invisible, and
`core/gate.js` either reveals it or redirects to the home page. So a bookmark
or a typed URL cannot reach a hidden page either. Flip a flag back to `true`
and everything returns.

Currently off: **login** (the management-software gateway, `login.html`),
**results** (Results & Events and the event detail page), **calendar** (the
whole Academic Calendar, `calendar.html`), **exams** and **syllabus** (two of
its three tabs, moot while the calendar itself is off) and **enquiry** (the
"Send an enquiry" form on the Contact page — the address, phone and map stay
and widen to fill the page).

## Known stubs

Everything that would need a server is isolated in `assets/js/services/`, each
with a `set*Adapter()` seam. Until those are wired:

- **`auth.js`** — the log-in forms validate, then report that the management
  software is not connected. `setAuthAdapter(fn)` makes all three roles live.
- **`admission.js`** — **live**, once you deploy the Apps Script. The form
  posts to a Google Sheet and prints a real PDF; see *The admission form*
  below. With no endpoint configured it still validates, still produces the
  PDF, and tells the applicant the reference came from the website rather than
  the office. Seams: `setSubmitAdapter` and `rules`.
- **`enquiry.js`** — unreachable for now: the contact form is hidden behind
  `features.enquiry`, because validating an enquiry and then pointing the
  visitor at the phone number reads like the office received it. Connect the
  inbox with `setEnquiryAdapter(fn)`, then switch the flag back on.
- **Photographs** — every image slot (`carouselSlides`, `headmaster.photo`,
  `school.logo`, `about.gallery`, event covers, staff portraits) is `null` and
  renders a hatched placeholder naming its subject. Set a path and the
  placeholder steps aside.
- **PDFs** — the Bengali-medium admission notice is real and lives in
  `assets/pdf/`. The English-medium and Class XI notices, and the syllabus,
  merit-list and routine links, still point at `#pdf`; a notice whose `href`
  still starts with `#` gets no `download` attribute, so the button cannot
  quietly save the admission page under the name "pdf".

  `tools/notice-docx-to-html.py` turns the office's .docx into an A4 page to
  print to PDF with headless Chrome — see the comment at the top of it. It
  lifts the text out of the document's XML rather than retyping it, which is
  what keeps the Bengali exact.
- **Map** — `contact.map.embed` is `null`, which draws the graph-paper
  placeholder; set it to an embed URL to show a real map.
