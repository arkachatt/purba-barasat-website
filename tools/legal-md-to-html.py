"""Turn the office's three legal templates into pages of this site.

Every `[PLACEHOLDER]` is either filled from the school's own record (name,
address, codes, telephone, office hours, e-mail) or rewritten so the page
states a rule the school already has, rather than a figure invented here.
The templates' own editorial notes are dropped.

    python3 -I build.py <out-dir>
"""
import html as H
import re
import sys

OUT = sys.argv[1]

SCHOOL = 'Purba Barasat Adarsha Bidyapith'
ADDRESS = '121/2 Taki Road, Purba Barasat, P.O. & P.S. Barasat'
EMAIL = 'pbab.1963@gmail.com'
PHONE = '(033) 2552 2928'
HOURS = 'Monday–Saturday, 10:30–16:30 IST'
CODES = ('UDISE 19112301305 · WBCHSE institute code 103182 · '
         'affiliated to WBBSE and WBCHSE')
UPDATED = '3 November 2026'

# Facts, then the clauses the templates leave open. Where a figure would be a
# promise the school has not made, the sentence is rewritten to point at the
# policy the school does have instead of inventing a number.
SUBS = [
    ('Purba Barasat Adarsha Bidyapeeth', SCHOOL),
    # these composites first, so the single-word fills below do not leave a
    # doubled "Barasat, Barasat" or name the aggregator twice in one sentence
    ('[full postal address], Barasat, North 24 Parganas, West Bengal, PIN [XXXXXX]',
     f'{ADDRESS}, North 24 Parganas, West Bengal, PIN 700124'),
    ('[Full postal address], Barasat, North 24 Parganas, West Bengal – [PIN]',
     f'{ADDRESS}, North 24 Parganas, West Bengal – 700124'),
    ('means [PAYMENT GATEWAY NAME], the authorised third-party payment aggregator that processes online payments on the School\u2019s behalf.',
     'means the authorised third-party payment aggregator that processes online payments on the School\u2019s behalf, as named on the payment page.'),
    ("means [PAYMENT GATEWAY NAME], the authorised third-party payment aggregator that processes online payments on the School's behalf.",
     "means the authorised third-party payment aggregator that processes online payments on the School's behalf, as named on the payment page."),
    ('our Payment Gateway, [PAYMENT GATEWAY NAME], and are processed by it',
     'our Payment Gateway and are processed by it'),
    ('**Payment Gateway and banks** (for example [PAYMENT GATEWAY NAME]) to process',
     '**Payment Gateway and banks** to process'),
    ('processed by [PAYMENT GATEWAY NAME], which has its own terms',
     "processed by the School's authorised payment aggregator, which has its own terms"),
    ('[https://www.school-domain.tld]', 'https://pbab.in'),
    ('[DD Month YYYY]', UPDATED),
    ('[SUPPORT EMAIL]', EMAIL),
    ('[ACCOUNTS EMAIL]', EMAIL),
    ('[PRIVACY EMAIL]', EMAIL),
    ('[EMAIL]', EMAIL),
    ('[PHONE]', PHONE),
    ('[OFFICE HOURS]', HOURS),
    ('[e.g. Mon–Sat, 10:00–16:00 IST]', HOURS),
    ('[Registered address]', ADDRESS),
    ('[Full postal address]', ADDRESS),
    ('[full postal address]', ADDRESS),
    ('[PIN]', '700124'),
    ('[XXXXXX]', '700124'),
    ('[NUMBER]', CODES),
    ('[UDISE / Board affiliation / Society registration no.]', CODES),
    ('[NAME, DESIGNATION]', 'The Headmaster'),
    ('[NAME, ROLE, EMAIL]', f'The Headmaster — {EMAIL} — {PHONE}'),
    ('[PAYMENT GATEWAY NAME]', "the School's authorised payment aggregator"),
    # timelines: the RBI and DPDP norms the templates themselves cite
    ('[5–7] working days', 'five to seven working days'),
    ('[7–15] working days', 'seven to fifteen working days'),
    ('[2 working days]', 'two working days'),
    ('[48 hours]', '48 hours'),
    ('[30] days', '30 days'),
    ('[30]', '30'),
    ('[15 days]', '15 days'),
    ('[12] months', '12 months'),
    ('**[8] years**, or as required by accounting/tax law',
     'As long as accounting, audit and tax law require'),
    ('[8] years, or as required by accounting/tax law',
     'As long as accounting, audit and tax law require'),
    # open clauses, rewritten rather than decided here
    ('**[₹ AMOUNT / PERCENT]**', 'the amount set out in the School’s fee policy'),
    ('[3/12]', 'twelve'),
    ('are **[borne by the School / borne by the payer]**. [Choose one.] Such charges are non-refundable.',
     'are shown before you pay and are non-refundable.'),
    ('[Full / partial] refund of fees paid, as per School policy',
     'Refund of fees paid, as per the School’s policy'),
    ("[Tuition fee for the unexpired period as per School's withdrawal policy / No refund]",
     'As per the School’s withdrawal policy — apply in writing to the School office'),
    ('([link or "available from the School office"])', '([the Fee Structure page](fee-structure.html))'),
    # the templates' own editorial asides
    ('[Delete if not applicable.]', ''),
    ('[Edit if analytics/ad tools are added.]', ''),
    ("[Edit to match the School's actual policy.]", ''),
    ('[Confirm retention periods with the School.]', ''),
    # cross-links, now that these are pages rather than files
    ('./privacy-policy.md', 'privacy-policy.html'),
    ('./terms-of-service.md', 'terms-of-service.html'),
    ('./terms-and-conditions.md', 'terms-and-conditions.html'),
]

INLINE = [
    (re.compile(r'\*\*(.+?)\*\*'), r'<strong>\1</strong>'),
    (re.compile(r'(?<!\*)\*([^*]+)\*(?!\*)'), r'<em>\1</em>'),
    (re.compile(r'`([^`]+)`'), r'<code>\1</code>'),
    (re.compile(r'\[([^\]]+)\]\(([^)]+)\)'), r'<a href="\2">\1</a>'),
]


def inline(text):
    out = H.escape(text, quote=False)
    for pattern, repl in INLINE:
        out = pattern.sub(repl, out)
    return out


def convert(md):
    """The subset of Markdown these three documents actually use."""
    for old, new in SUBS:
        md = md.replace(old, new)

    lines = md.split('\n')
    parts, i = [], 0
    while i < len(lines):
        line = lines[i].rstrip()

        if not line or line == '---':
            i += 1
            continue
        if line.startswith('> '):                       # template note
            i += 1
            continue
        if line.startswith('# '):                       # the page's own <h1>
            i += 1
            continue

        if line.startswith('## '):
            parts.append(f'<h2>{inline(line[3:])}</h2>')
            i += 1
            continue

        if line.startswith('- '):
            items = []
            while i < len(lines) and lines[i].startswith('- '):
                items.append(f'<li>{inline(lines[i][2:].strip())}</li>')
                i += 1
            parts.append('<ul>' + ''.join(items) + '</ul>')
            continue

        if line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                cells = [c.strip() for c in lines[i].strip('|').split('|')]
                if not all(set(c) <= set('-: ') for c in cells):
                    rows.append(cells)
                i += 1
            head = ''.join(f'<th>{inline(c)}</th>' for c in rows[0])
            body = ''.join(
                '<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>'
                for r in rows[1:])
            parts.append('<div class="blueprint legal-table-wrap">'
                         f'<table class="table"><thead><tr>{head}</tr></thead>'
                         f'<tbody>{body}</tbody></table></div>')
            continue

        block = []
        while i < len(lines) and lines[i].strip() and not lines[i].startswith(
                ('#', '-', '|', '>')):
            block.append(lines[i].strip())
            i += 1
        parts.append('<p>' + '<br>'.join(inline(b) for b in block) + '</p>')

    return '\n        '.join(parts)


PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} — {school}</title>
  <meta name="description" content="{description}">
  <!-- The content is still part placeholder (notices, results, contact details),
       so the site is deliberately kept out of search results. Delete this tag on
       every page once the school's real content is in. -->
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" type="image/png" href="assets/img/favicon.png">
  <link rel="apple-touch-icon" href="assets/img/logo-flat.png">
  <link rel="stylesheet" href="assets/css/site.css">
  <script type="module" src="assets/js/main.js"></script>
</head>
<body class="page">
  <a class="skip-link" href="#main">Skip to content</a>

  <offline-bar></offline-bar>

  <site-header></site-header>

  <main class="page-main page-main--narrow" id="main" style="gap:24px">
    <page-header kicker="{kicker}" title="{title}"
                 meta="Last updated {updated}|{school}"></page-header>
    {notice}
    <article class="prose legal">
        {body}
    </article>
  </main>

  <site-footer></site-footer>
</body>
</html>
"""

# Online fee payment is not open yet — the only fee the site names, the ₹100
# application fee, is taken at the office counter. Saying so on the page that
# governs online payment keeps it true on the day it is published, and it is
# one line to delete when the facility opens.
NOT_LIVE = """<state-alert tone="status" icon="info"
                 heading="Online fee payment is not open yet">
      The School does not yet accept fees through this website. These Terms
      apply from the day the online payment facility opens, and to every
      payment made through it after that. The ₹100 application fee for the
      2027 admission is paid in cash at the school office counter — see the
      <a href="admission.html">Admission page</a>.
    </state-alert>"""

DOCS = [
    ('terms-of-service', 'Terms of Service', 'Legal',
     "Terms of Service for the website and online portal of "
     f"{SCHOOL}, North 24 Parganas, West Bengal."),
    ('terms-and-conditions', 'Terms and Conditions', 'Legal · Fees and payments',
     "Terms and Conditions covering fees, online payments, refunds and "
     f"cancellation at {SCHOOL}, North 24 Parganas, West Bengal."),
    ('privacy-policy', 'Privacy Policy', 'Legal',
     f"How {SCHOOL} collects, uses and protects the personal data of "
     "students, parents, guardians and staff."),
]

for slug, title, kicker, description in DOCS:
    body = convert(open(f'{slug}.md', encoding='utf-8').read())
    page = PAGE.format(title=title, school=SCHOOL, description=description,
                       kicker=kicker, updated=UPDATED, body=body,
                       notice=NOT_LIVE if slug == 'terms-and-conditions' else '')
    with open(f'{OUT}/{slug}.html', 'w', encoding='utf-8') as handle:
        handle.write(page)
    print(slug, len(page), 'bytes')
