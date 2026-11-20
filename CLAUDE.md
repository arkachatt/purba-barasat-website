# Working on this repository

**This repo is the live website of a real school.** Pushing to `main` publishes
to <https://pbab.in> through GitHub Pages, usually within a minute or two.
There is no staging site. Parents and children read what you push.

Read this before changing anything. `README.md` has the architecture; this
file has the rules that are not guessable from the code.

---

## 1. The prerender step — the one that is easy to forget

Every page is a shell of empty custom elements that fill themselves in from
`assets/js/data/site.js`. The rendered markup is **baked into the HTML files**
so crawlers and slow connections get the words on the first fetch.

**If you change page content, the baked copy goes stale.** It does not break
the site — the components re-render on load and replace it — but what Google
and a text-only reader see is the old wording until you re-run:

```sh
python3 serve.py &                 # port 8000, no-cache
python3 tools/prerender.py
git diff --stat                    # commit whatever it changed
```

Re-run it after editing `assets/js/data/site.js`, any component that renders
page content, or anything in `assets/css/` that changes what text appears.

The script is idempotent: it strips its own `<!--prerender-->` markers first,
restoring the authored shell exactly, then re-injects. So **running it when
nothing changed produces no diff** — which makes it the staleness check too:

```sh
python3 tools/prerender.py && git diff --quiet && echo "prerender is fresh"
```

It covers the twelve indexed pages only. `admission-form.html` and
`admission-submitted.html` are deliberately excluded — they are `noindex` and
they are the two pages an application runs through.

**Dated content is a snapshot.** The admission banner says whether the window
is open as of the moment the script ran. Re-run it when a date passes.

## 2. Never delete the Google verification

Two files prove to Google that we own the site:

- `google8ee09cf939e8a258.html` at the repo root
- `<meta name="google-site-verification" ...>` in `index.html`

Google re-checks periodically and **drops the Search Console property** if the
proof has gone. Either one alone is enough; both exist so a careless tidy-up
cannot un-verify us.

## 3. The admission form writes to live Google Sheets

`integrations/admission-sheet/Code.gs` is deployed as an Apps Script web app.
Two spreadsheets hold **real applications from real families**.

- **Never submit a test application against the live endpoint.** Use
  `setSubmitAdapter()` from `assets/js/services/admission.js` to swap in a
  stub; the real transport then never runs. A reference the stub invents
  (`…/TEST-0001`) proves nothing was written.
- Changing `Code.gs` requires a **manual redeploy** in the Apps Script editor
  (Deploy → Manage deployments → New version), which keeps the same `/exec`
  URL so `assets/js/config.js` needs no edit. Run `checkStreams()` first.
- Adding a class to a medium needs **no** `Code.gs` change: `classNumeral_()`
  reads the numeral off the class string, and the serial counter is keyed per
  medium, not per class.
- `resetBengaliNumbering()` / `resetEnglishNumbering()` clear a counter. Only
  run them when the sheet holds nothing you mean to keep.

## 4. Search-engine rules

- **12 pages are indexed**; the rest carry `noindex` with the reason written
  beside the tag. That comment is what tells the next person when to remove
  it — keep it true.
- `sitemap.xml` must list **exactly** the indexed pages. A sitemap naming a
  `noindex` page is a contradiction Google reports as an error.
- Nothing is `Disallow`ed in `robots.txt`, on purpose: a page a crawler cannot
  fetch is one that never reads its own `noindex`.
- An indexed page carries a `canonical` and an `og:` block; a `noindex` page
  carries neither. Making a page indexable means adding both.
- `tools/check.py` verifies all of the above.

## 5. House rules

- **No build step, no `package.json`, no dependencies.** Plain HTML, CSS and
  ES modules. Keep it that way; `tools/*.py` are developer scripts, not a
  build pipeline, and the site must work without them having been run.
- `node --check file.js` parses a file as **CommonJS** and will miss
  ESM-only errors. Copy to `/tmp/x.mjs` and check that instead.
- Preview with `python3 serve.py` (port 8000). It sends no-cache headers;
  `python -m http.server` caches hard enough to hide your edits.
- `pbab.in` serves assets with `max-age=600`. To check something live, use
  `fetch(url, {cache: 'reload'})` or wait — a stale read is not a failure.
- Content lives in **one** module, `assets/js/data/site.js`. Prefer editing
  data over editing components.
- Feature switches are in `features` at the top of `site.js`. A gated page
  carries `class="gated"` on `<body>` and calls `gate('name')`. Currently
  `login` and `results` are off; `calendar` and `syllabus` are on.

## 6. Before you push

```sh
python3 tools/check.py                      # SEO and consistency
python3 tools/prerender.py && git diff       # should be empty if content is unchanged
```

Then look at the page in a browser. Console errors are not acceptable.

---

## Things that are still open

Written down so they are not rediscovered from scratch each time:

- `fee-structure.html` is an empty state; it becomes indexable when the fee
  table is published.
- `calendar.html` is live and linked, but all three sections are empty states.
- The school's Google Maps listing is **not** claimed under the owner's
  account. Claiming it needs postcard or phone verification at the school.
- `Ismail Mollick` / `Mallick` — the roster and his own form disagree;
  awaiting the office register.
- `Bidyapith` vs `Bidyapeeth`: the site uses *Bidyapith*, the letterhead and
  the Maps listing use *Bidyapeeth*. Settle it before any bank or payment
  gateway paperwork.
- The three legal pages were written from supplied templates and have not
  been reviewed by an advocate.
