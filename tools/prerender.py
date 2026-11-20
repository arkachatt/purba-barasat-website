#!/usr/bin/env python3
"""
Bake each page's rendered content back into its own HTML file.

WHY
---
Every page in this site is a shell: a handful of empty custom elements that
fill themselves in from assets/js/data/site.js when the browser runs the
module. Before this script existed, the HTML a crawler was served held about
fifteen characters of text. Googlebot does run JavaScript, so the pages were
indexable either way — but rendering happens in a slower second pass, and a
page that throws on the way up is a blank page in the index. Baking the
rendered markup in means the first fetch already carries the words.

WHAT IT DOES NOT CHANGE
-----------------------
No JavaScript. The components still render on load and still replace what is
baked in, so the browser's copy is always the live one and this file can
never go subtly out of step with site.js — only stale, and only until the
next run.

admission-form.html and admission-submitted.html are deliberately absent from
PAGES. They are noindex, so they would gain nothing, and they are the two
pages the application runs through: not touching them is cheaper than
reasoning about whether touching them is safe.

IDEMPOTENT
----------
Injected markup is wrapped in <!--prerender--> … <!--/prerender--> inside the
element it belongs to. Every run strips those regions first, which restores
the authored shell exactly, so the .html files stay the thing you edit and
re-running after a content change is the whole maintenance story.

RUN
---
    python3 serve.py &                 # the site, on :8000
    python3 tools/prerender.py

Re-run it whenever site.js changes, and before a release. Dated content —
the admission banner in particular — is a snapshot of the moment it ran.
"""

import html.parser
import io
import os
import re
import subprocess
import sys

CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
ORIGIN = 'http://localhost:8000/'

# The twelve pages that are meant to be found; see the robots meta on each.
PAGES = [
    'index.html', 'about.html', 'hm.html', 'admission.html', 'notice.html',
    'teachers.html', 'students.html', 'administration.html', 'contact.html',
    'terms-of-service.html', 'terms-and-conditions.html', 'privacy-policy.html',
]

OPEN, CLOSE = '<!--prerender-->', '<!--/prerender-->'
CUSTOM = re.compile(r'^[a-z][a-z0-9]*-[a-z0-9-]+$')

# An element with authored content of its own is left alone: the component may
# read that text as its input, and overwriting it would lose the page's words
# rather than publish them.
STRIP = re.compile(
    r'(<([a-z][a-z0-9]*-[a-z0-9-]+)\b[^>]*>)' + re.escape(OPEN) + r'.*?'
    + re.escape(CLOSE) + r'(</\2>)', re.S)


class TopLevel(html.parser.HTMLParser):
    """Collects the inner HTML of every custom element that is not itself
       inside one — which is exactly the set the shell authors wrote."""

    def __init__(self, source):
        super().__init__(convert_charrefs=False)
        self.source = source
        self.lines = [0]
        for line in source.splitlines(keepends=True):
            self.lines.append(self.lines[-1] + len(line))
        self.depth = 0
        self.start = None
        self.tag = None
        self.found = []

    def at(self):
        line, col = self.getpos()
        return self.lines[line - 1] + col

    def handle_starttag(self, tag, attrs):
        if not CUSTOM.match(tag):
            return
        self.depth += 1
        if self.depth == 1:
            self.tag = tag
            # Where the start tag ends is where the inner HTML begins.
            self.start = self.source.index('>', self.at()) + 1

    def handle_endtag(self, tag):
        if not CUSTOM.match(tag):
            return
        if self.depth == 1 and tag == self.tag:
            self.found.append((tag, self.source[self.start:self.at()]))
        self.depth = max(0, self.depth - 1)


def dump(page):
    """The DOM as the browser has it, once the modules have had their say."""
    out = subprocess.run(
        [CHROME, '--headless', '--disable-gpu', '--virtual-time-budget=9000',
         '--run-all-compositor-stages-before-draw', '--dump-dom', ORIGIN + page],
        capture_output=True, text=True, timeout=90)
    if not out.stdout:
        raise SystemExit('no DOM for %s\n%s' % (page, out.stderr[-800:]))
    return out.stdout


def rendered(page):
    body = dump(page)
    body = body[body.index('<body'):]
    parser = TopLevel(body)
    parser.feed(body)
    return [(tag, inner) for tag, inner in parser.found if inner.strip()]


def inject(path, blocks):
    source = io.open(path, encoding='utf-8').read()
    source = STRIP.sub(r'\1\3', source)          # back to the authored shell

    by_tag = {}
    for tag, inner in blocks:
        by_tag.setdefault(tag, []).append(inner)
    used = {}

    def fill(match):
        open_tag, tag, close_tag = match.group(1), match.group(2), match.group(3)
        queue = by_tag.get(tag, [])
        i = used.get(tag, 0)
        if i >= len(queue):
            return match.group(0)                # rendered to nothing; leave it
        used[tag] = i + 1
        return open_tag + OPEN + queue[i] + CLOSE + close_tag

    # Only empty elements are filled — see STRIP's note on authored content.
    out = re.sub(r'(<([a-z][a-z0-9]*-[a-z0-9-]+)\b[^>]*>)(</\2>)', fill, source)
    io.open(path, 'w', encoding='utf-8').write(out)
    return sum(used.values()), len(source), len(out)


def text_of(path):
    s = io.open(path, encoding='utf-8').read()
    body = s[s.find('<body'):]
    body = re.sub(r'<script.*?</script>', '', body, flags=re.S)
    return len(' '.join(re.sub(r'<[^>]+>', ' ', body).split()))


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root)
    worst = 0
    for page in PAGES:
        before = text_of(page)
        filled, _, _ = inject(page, rendered(page))
        after = text_of(page)
        worst = max(worst, 1 if after < 400 else 0)
        print('%-28s %2d elements  %5d -> %6d chars of text' %
              (page, filled, before, after))
    if worst:
        print('\nA page came out thin. Is serve.py running on :8000?')
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
