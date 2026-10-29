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
| Academic Calendar | `calendar.html` (`#holidays` `#exams` `#syllabus`) | 04 · all |
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

**Forms are schema-driven.** The five-step admission wizard and the contact
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

## Feature switches

`features` at the top of `data/site.js` hides parts of the site without
deleting anything — the page, its component and its content all stay in place:

```js
export const features = { login: false, results: false, syllabus: false };
```

Turning one off hides every way in (header button, nav item, dropdown entry,
footer link, home tile) **and** closes the page itself: a gated page carries
`class="gated"` on `<body>`, which `site.css` renders invisible, and
`core/gate.js` either reveals it or redirects to the home page. So a bookmark
or a typed URL cannot reach a hidden page either. Flip a flag back to `true`
and everything returns.

Currently off: **login** (the management-software gateway, `login.html`),
**results** (Results & Events and the event detail page) and **syllabus** (the
third tab of the Academic Calendar — holidays and exams are unaffected).

## Known stubs

Everything that would need a server is isolated in `assets/js/services/`, each
with a `set*Adapter()` seam. Until those are wired:

- **`auth.js`** — the log-in forms validate, then report that the management
  software is not connected. `setAuthAdapter(fn)` makes all three roles live.
- **`admission.js`** — the draft is saved to the browser (`localStorage`),
  uploads are checked for size and type but never leave the device, and
  submission mints a local reference so the confirmation can be printed. The
  confirmation page says so in as many words. Three seams:
  `setUploadAdapter`, `setSubmitAdapter`, and `rules` for validation.
- **`enquiry.js`** — the contact form validates, then points the visitor at the
  phone number. `setEnquiryAdapter(fn)` connects the office inbox.
- **Photographs** — every image slot (`carouselSlides`, `headmaster.photo`,
  `school.logo`, `about.gallery`, event covers, staff portraits) is `null` and
  renders a hatched placeholder naming its subject. Set a path and the
  placeholder steps aside.
- **PDFs** — notice, syllabus, merit-list and routine links point at `#pdf`
  pending the real files.
- **Map** — `contact.map.embed` is `null`, which draws the graph-paper
  placeholder; set it to an embed URL to show a real map.
