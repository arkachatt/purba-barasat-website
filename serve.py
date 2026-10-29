#!/usr/bin/env python
"""
Local preview server.

`python -m http.server` lets the browser cache aggressively, and this site
loads its CSS through a chain of @import rules — which browsers hold on to
even across a reload. The result is edits that appear to do nothing.

This serves exactly the same files with caching turned off, so a plain
refresh always shows the current state.

    python serve.py [port]        # default 8000

Nothing here ships: GitHub Pages serves the files with its own headers.
"""
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, fmt, *args):      # quiet: only report failures
        if not args or str(args[1]).startswith(('2', '3')):
            return
        super().log_message(fmt, *args)


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f'Serving this folder at http://localhost:{port}  (caching off)')
    ThreadingHTTPServer(('127.0.0.1', port), NoCacheHandler).serve_forever()
