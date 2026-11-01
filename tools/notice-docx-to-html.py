"""Render the office's .docx admission notice as an A4 HTML page.

    python3 tools/notice-docx-to-html.py notice.docx notice.html [letterhead.jpg]
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
      --headless --no-pdf-header-footer --print-to-pdf=notice.pdf \
      "file://$PWD/notice.html"

Run by hand when a new notice arrives; the site itself still has no build
step. The text is pulled straight out of word/document.xml rather than
retyped, so no Bengali character can be lost in transcription — only the
typography is ours, and every string, table cell and line break is the
document's own. Check that by stripping the tags from both and comparing:
they should be identical once whitespace is removed.

Expects the shape the office's notices have so far: a letterhead image, a
memo/date line, headings, two-column tables, and a signature table at the
foot. A notice built differently will need the CSS below looked at.

The optional third argument replaces the letterhead with an image file. The
notices arrive with the same letterhead scanned to different standards —
some crops carry a pen mark or a neighbouring stamp — so the cleanest scan
can be used for all of them.
"""
import base64, html as H, sys, zipfile
from xml.etree import ElementTree as ET

DOCX, OUT = sys.argv[1], sys.argv[2]
LETTERHEAD = sys.argv[3] if len(sys.argv) > 3 else None
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
NS = {'w': W}
book = zipfile.ZipFile(DOCX)
root = ET.fromstring(book.read('word/document.xml'))
body = root.find('w:body', NS)

def inline(p):
    """A paragraph as HTML: bold runs kept, <w:br> kept, <w:tab> marked.

    Runs nested in a <w:hyperlink> count too — www.pbab.in sits in one, and
    reading only direct children silently dropped it.
    """
    out = []
    runs = []
    for node in p:
        tag = node.tag.split('}')[1]
        if tag == 'r': runs.append(node)
        elif tag == 'hyperlink': runs.extend(node.findall('w:r', NS))
    for r in runs:
        pr = r.find('w:rPr', NS)
        bold = pr is not None and pr.find('w:b', NS) is not None
        for node in r:
            tag = node.tag.split('}')[1]
            if tag == 't':
                txt = H.escape(node.text or '', quote=False)   # text node: an apostrophe is itself
                out.append(f'<b>{txt}</b>' if bold else txt)
            elif tag == 'br':
                out.append('<br>')
            elif tag == 'tab':
                out.append('\x00TAB\x00')
    return ''.join(out)

def cell_html(tc):
    return '<br>'.join(inline(p) for p in tc.findall('w:p', NS))

if LETTERHEAD:
    head_bytes = open(LETTERHEAD, 'rb').read()
else:
    media = [n for n in book.namelist() if n.startswith('word/media/')]
    head_bytes = book.read(media[0]) if media else b''
logo = base64.b64encode(head_bytes).decode()
parts = []
for child in body:
    tag = child.tag.split('}')[1]
    if tag == 'p':
        if child.find('.//{http://schemas.openxmlformats.org/drawingml/2006/main}blip') is not None:
            parts.append(f'<img class="letterhead" src="data:image/jpeg;base64,{logo}" alt="">')
            continue
        pPr = child.find('w:pPr', NS)
        jc = pPr.find('w:jc', NS) if pPr is not None else None
        align = jc.get(f'{{{W}}}val') if jc is not None else None
        text = inline(child)
        if not text.strip():
            continue
        if '\x00TAB\x00' in text:                    # memo number left, date right
            left, right = text.split('\x00TAB\x00', 1)
            right = right.replace('\x00TAB\x00', '')
            parts.append(f'<p class="memo"><span>{left}</span><span>{right}</span></p>')
            continue
        cls = {'center': 'center'}.get(align, '')
        parts.append(f'<p class="{cls}">{text}</p>')
    elif tag == 'tbl':
        rows = child.findall('w:tr', NS)
        sign = len(rows) == 1                        # the date / signature footer
        body_rows = []
        for i, tr in enumerate(rows):
            cells = tr.findall('w:tc', NS)
            el = 'th' if (i == 0 and not sign) else 'td'
            body_rows.append('<tr>' + ''.join(
                f'<{el}>{cell_html(tc)}</{el}>' for tc in cells) + '</tr>')
        parts.append(f'<table class="{"sign" if sign else "grid"}">' + ''.join(body_rows) + '</table>')

open(OUT, 'w', encoding='utf-8').write("""<!DOCTYPE html>
<html lang="bn"><head><meta charset="utf-8"><title>notice</title><style>
  /* Sized so the longest notice so far — English medium, four classes in the
     date-of-birth table and the selection-by-lottery section — still lands on
     one page. Tightened once already when that section was added; the next
     notice that grows will need the body font dropped to 9.5pt. */
  @page { size: A4; margin: 10mm 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Kohinoor Bangla", "Noto Sans Bengali", sans-serif;
         font-size: 10pt; line-height: 1.38; color: #000; }
  .letterhead { display: block; width: 100%; margin: 0 0 6px; }
  p { margin: 0 0 5px; text-align: justify; }
  p.center { text-align: center; }
  .memo { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 9px;
          border-bottom: 1px solid #000; padding-bottom: 4px; text-align: left; }
  table { width: 100%; border-collapse: collapse; margin: 4px 0 9px; }
  table.grid th, table.grid td { border: 1px solid #000; padding: 4px 8px; vertical-align: top;
                                 text-align: left; }
  table.grid th { background: #ececec; }
  table.grid tr td:first-child, table.grid tr th:first-child { width: 38%; }
  table.sign { margin-top: 24px; }
  table.sign td { vertical-align: top; width: 50%; }
  table.sign td:last-child { text-align: right; font-weight: 700; }
</style></head><body>
""" + '\n'.join(parts) + "\n</body></html>\n")
print('wrote', OUT)
