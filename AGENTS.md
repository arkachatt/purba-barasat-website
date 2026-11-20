# AGENTS.md

The instructions for working on this repository are in **[CLAUDE.md](CLAUDE.md)**.

They apply to any agent or person, whichever tool you are using. This file
exists only because different tools look for different filenames; it is a
pointer, not a second set of rules. Do not let the two drift — edit CLAUDE.md.

The short version, which is not enough on its own:

- Pushing to `main` publishes to <https://pbab.in>. There is no staging site.
- Change page content, then re-run `python3 tools/prerender.py` and commit it.
- Never delete `google8ee09cf939e8a258.html` or the `google-site-verification`
  meta in `index.html`.
- Never submit a test application against the live admission endpoint; real
  families' applications are in those sheets.
- Run `python3 tools/check.py` before pushing.
