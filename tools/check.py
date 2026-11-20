#!/usr/bin/env python3
"""
Check the rules in CLAUDE.md that a machine can check.

Run it before pushing:

    python3 tools/check.py

It needs no server and no browser — it reads the files. The one rule it
cannot check here is prerender freshness, which needs a render; that one is

    python3 serve.py &
    python3 tools/prerender.py && git diff --quiet && echo fresh

Exit status is 0 when everything passes, 1 otherwise, so it can gate a push.
"""

import io
import os
import re
import sys
import xml.etree.ElementTree as ET

BASE = 'https://pbab.in/'
SITEMAP_NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'

# The pages meant to be found. Anything else with a .html at the root must
# carry noindex. Keep this list and sitemap.xml saying the same thing.
INDEXED = {
    'index.html': BASE,
    'about.html': BASE + 'about.html',
    'hm.html': BASE + 'hm.html',
    'admission.html': BASE + 'admission.html',
    'notice.html': BASE + 'notice.html',
    'teachers.html': BASE + 'teachers.html',
    'students.html': BASE + 'students.html',
    'administration.html': BASE + 'administration.html',
    'contact.html': BASE + 'contact.html',
    'terms-of-service.html': BASE + 'terms-of-service.html',
    'terms-and-conditions.html': BASE + 'terms-and-conditions.html',
    'privacy-policy.html': BASE + 'privacy-policy.html',
}

# Google drops the Search Console property if its proof disappears.
VERIFY_FILE = 'google8ee09cf939e8a258.html'
VERIFY_META = 'google-site-verification'

problems = []


def complain(page, message):
    problems.append('%-28s %s' % (page, message))


def read(path):
    return io.open(path, encoding='utf-8').read()


def head_of(source):
    end = source.find('</head>')
    return source[:end if end > 0 else len(source)]


def check_pages():
    pages = sorted(p for p in os.listdir('.') if p.endswith('.html')
                   and p != VERIFY_FILE)
    for page in pages:
        head = head_of(read(page))
        noindex = 'content="noindex' in head
        canonical = re.search(r'<link rel="canonical" href="([^"]+)"', head)
        og = 'og:image' in head

        if page in INDEXED:
            if noindex:
                complain(page, 'is in INDEXED but carries noindex')
            if not canonical:
                complain(page, 'is indexed but has no canonical')
            elif canonical.group(1) != INDEXED[page]:
                complain(page, 'canonical is %s, expected %s'
                         % (canonical.group(1), INDEXED[page]))
            if not og:
                complain(page, 'is indexed but has no og: block')
            if not re.search(r'<meta name="description" content="[^"]{50,}"', head):
                complain(page, 'is indexed but its description is missing or thin')
        else:
            if not noindex:
                complain(page, 'is not in INDEXED and does NOT carry noindex')
            if canonical or og:
                complain(page, 'carries noindex but also a canonical/og: block')
    return pages


def check_sitemap():
    if not os.path.exists('sitemap.xml'):
        complain('sitemap.xml', 'is missing')
        return
    try:
        root = ET.parse('sitemap.xml').getroot()
    except ET.ParseError as err:
        complain('sitemap.xml', 'is not valid XML: %s' % err)
        return
    listed = {u.findtext(SITEMAP_NS + 'loc') for u in root.iter(SITEMAP_NS + 'url')}
    expected = set(INDEXED.values())
    for extra in sorted(listed - expected):
        complain('sitemap.xml', 'lists %s, which is not an indexed page' % extra)
    for missing in sorted(expected - listed):
        complain('sitemap.xml', 'does not list %s' % missing)


def check_robots():
    if not os.path.exists('robots.txt'):
        complain('robots.txt', 'is missing')
        return
    text = read('robots.txt')
    if BASE + 'sitemap.xml' not in text:
        complain('robots.txt', 'does not point at the sitemap')
    for line in text.splitlines():
        rule = line.split('#')[0].strip()
        if rule.lower().startswith('disallow:') and rule.split(':', 1)[1].strip():
            complain('robots.txt', 'has a Disallow (%r) — see CLAUDE.md §4' % rule)


def check_verification():
    if not os.path.exists(VERIFY_FILE):
        complain(VERIFY_FILE, 'is MISSING — this un-verifies Search Console')
    if VERIFY_META not in read('index.html'):
        complain('index.html', 'has lost its google-site-verification meta')


def check_prerender_markers(pages):
    """Baked markup must be balanced, and must only exist on indexed pages."""
    for page in pages:
        source = read(page)
        opens = source.count('<!--prerender-->')
        closes = source.count('<!--/prerender-->')
        if opens != closes:
            complain(page, 'has %d prerender opens but %d closes' % (opens, closes))
        if opens and page not in INDEXED:
            complain(page, 'is not indexed but carries prerendered markup')


def main():
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    pages = check_pages()
    check_sitemap()
    check_robots()
    check_verification()
    check_prerender_markers(pages)

    if problems:
        print('%d problem(s):\n' % len(problems))
        for line in problems:
            print('  ' + line)
        print('\nSee CLAUDE.md for what each rule is for.')
        return 1

    print('OK — %d pages, %d indexed, sitemap and verification in order.'
          % (len(pages), len(INDEXED)))
    print('Prerender freshness is not checked here; see CLAUDE.md §1.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
