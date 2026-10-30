/**
 * Purba Barasat Adarsha Bidyapith — admission form receiver.
 *
 * Paste this into the Apps Script editor of the spreadsheet that should hold
 * the applications, then deploy it as a web app. See README.md beside this
 * file for the exact steps.
 *
 * It appends one row per application and returns the official reference
 * number, which the website then prints on the applicant's PDF.
 */

/** The tab the applications are written to. Created on first use. */
const SHEET_NAME = 'Applications';

/** Reference numbers read PBAB/<SESSION>/<stream code>/<class>/00042. */
const SESSION = '27';

/**
 * Two registers, one script.
 *
 * Each medium has its own spreadsheet and its own serial counter, so the
 * numbering in one is untouched by the other: the counters are script
 * properties rather than sheet rows, and the scan that heals a lost counter
 * only ever reads the one book this request opened.
 *
 * `code` is the letter in the reference number and must match
 * `admissionStreams` in assets/js/data/site.js. A new medium is an entry
 * here, an entry there, and a new spreadsheet.
 *
 * NOTE: opening a book by id needs the full Spreadsheets scope. A bound
 * script that only ever called getActiveSpreadsheet() may be authorised for
 * `spreadsheets.currentonly`, under which every openById below throws — and
 * it throws on the first live submission, not at deploy time. Run
 * checkStreams() from the editor before deploying; that is what it is for.
 */
const STREAMS = {
  bengali: {
    code: 'B',
    bookId: '14e2mlrLIKFV4-YwmBNu9AvVhAqT6FHzA_qrYgWyceGg',
    serialKey: 'lastSerial.bengali',
  },
  english: {
    code: 'E',
    bookId: '18dN2jNYg7EOlBBgUL71LsifBxzFERZjm7x4ZwmqPzZ8',
    serialKey: 'lastSerial.english',
  },
};

/**
 * Columns, in order. These are the `name` keys from the website's form
 * schema (assets/js/data/site.js). To collect a new question: add the field
 * on the website, then add its name to the END of this list and re-deploy.
 * Never reorder — existing rows are positional.
 */
const COLUMNS = [
  'class', 'nameEn', 'nameBn', 'dob',
  'gender', 'category', 'religion', 'bloodGroup',
  'bpl', 'aadhaar', 'pen', 'apaar',
  'father', 'fatherOccupation', 'mother', 'motherOccupation',
  'guardian', 'guardianOccupation', 'phone', 'village',
  'postOffice', 'policeStation', 'district', 'pin',
  'lastSchool', 'lastClass', 'bankAccount', 'bankName',
  'branchName', 'ifsc', 'micr',
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    /* Two guardians can submit at the same moment; serialise so no reference
       number is ever handed out twice. */
    lock.waitLock(25000);

    const body = JSON.parse(e.postData.contents);
    const data = body.data || {};
    const clientRef = String(body.clientRef || '');

    /* A missing medium is an old cached copy of the website, which only ever
       collected Bengali-medium Class V — route it there. An unrecognised one
       is refused rather than guessed: a child written into the wrong register
       cannot be taken back out of it, and the website already handles a
       refusal by issuing its own reference and telling the applicant the
       office has not registered it yet. */
    const mediumId = String(body.medium || 'bengali');
    const stream = STREAMS[mediumId];
    if (!stream) return json_({ ok: false, error: 'unknown medium: ' + mediumId });

    const sheet = getSheet_(stream);

    /* A retry after a dropped connection carries the same clientRef — update
       nothing, just hand back the reference the first attempt was given. */
    const already = findByClientRef_(sheet, clientRef);
    if (already) return json_({ ok: true, reference: already, duplicate: true });

    const reference = 'PBAB/' + SESSION + '/' + stream.code + '/' +
      classNumeral_(data['class']) + '/' + pad_(nextSerial_(sheet, stream), 5);

    sheet.appendRow([
      new Date(),
      reference,
      clientRef,
      mediumId,
      ...COLUMNS.map(function (key) { return String(data[key] == null ? '' : data[key]); }),
    ]);

    return json_({ ok: true, reference: reference });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  } finally {
    try { lock.releaseLock(); } catch (ignored) { /* never had it */ }
  }
}

/**
 * Open this deployment's URL in a browser to check it is live. You should
 * see {"ok":true,...}. If you are asked to sign in, the deployment's access
 * is wrong — see step 5 of the README.
 */
function doGet() {
  const streams = {};
  for (const id in STREAMS) streams[id] = STREAMS[id].code;
  return json_({ ok: true, service: 'pbab-admission', columns: COLUMNS.length, streams: streams });
}

/**
 * Run this from the editor before deploying, and after changing STREAMS.
 *
 * It opens both books, which is what forces the authorisation dialog for the
 * wider Spreadsheets scope. Without it the scope is only asked for on the
 * first real submission, where it fails silently as far as the applicant is
 * concerned. The log should name both spreadsheets.
 */
function checkStreams() {
  for (const id in STREAMS) {
    const stream = STREAMS[id];
    const book = SpreadsheetApp.openById(stream.bookId);
    Logger.log(id + ' (' + stream.code + ') -> ' + book.getName());
  }
}

/**
 * The class segment of a reference: `Class VII` -> `VII`.
 *
 * Not a lookup table. Classes are written `Class <numeral>` everywhere in the
 * website's data, so both sides can do the same trivial thing to the same
 * string without sharing code — which is the only reason it stays honest.
 * Anything that is not a numeral becomes `?`, which is visibly wrong in the
 * reference but never a reason to lose the application.
 */
function classNumeral_(klass) {
  const text = String(klass == null ? '' : klass).replace(/^Class\s+/i, '').trim().toUpperCase();
  return /^[IVX]+$/.test(text) ? text : '?';
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

/**
 * The next reference number.
 *
 * Deriving it from the row number looked simpler, but it meant the number
 * followed the row's POSITION: delete a withdrawn application six months from
 * now and the next applicant is handed a reference some family already holds a
 * printed form for — two children, one number, and nothing in the sheet to
 * show it happened.
 *
 * So the serial is stored and only ever counts up. A deleted row leaves a gap
 * in the numbering, which is the correct outcome: the gap is the record that
 * something was removed.
 *
 * Called only from inside the lock in doPost, so the read-increment-write
 * cannot interleave with another submission.
 */
function nextSerial_(sheet, stream) {
  const props = PropertiesService.getScriptProperties();
  let last = Number(props.getProperty(stream.serialKey)) || 0;

  /* If the counter is missing or has fallen behind the sheet — a fresh
     deployment, or someone cleared it — never hand out a number the sheet has
     already used. */
  const highest = highestSerialInSheet_(sheet);
  if (highest > last) last = highest;

  const next = last + 1;
  props.setProperty(stream.serialKey, String(next));
  return next;
}

/**
 * The largest serial already written to the Reference column, or 0.
 *
 * Reads only the book it was handed, which is the property the whole
 * per-medium numbering rests on: one medium's references are never visible
 * here while healing the other's counter. The pattern is anchored to the end
 * of the string, so it matches `PBAB/27/B/V/00001` and skips a `W-` reference
 * — which was issued by the website and never registered anyway.
 */
function highestSerialInSheet_(sheet) {
  const rows = sheet.getLastRow() - 1;
  if (rows < 1) return 0;

  const references = sheet.getRange(2, 2, rows, 1).getValues();
  let highest = 0;
  for (let i = 0; i < references.length; i += 1) {
    const match = /\/(\d+)$/.exec(String(references[i][0]));
    if (match) highest = Math.max(highest, Number(match[1]));
  }
  return highest;
}

/**
 * Restart the numbering. Run this by hand from the Apps Script editor — never
 * from the website — and only when the sheet holds no applications you intend
 * to keep, such as after clearing out test rows. The next application then
 * takes the lowest number the sheet allows.
 */
function resetSerialNumbering_(mediumId) {
  const stream = STREAMS[mediumId];
  if (!stream) throw new Error('unknown medium: ' + mediumId);
  PropertiesService.getScriptProperties().deleteProperty(stream.serialKey);
  Logger.log(mediumId + ' serial counter cleared. Next reference follows that sheet.');
}

/* The editor's Run button can only start a function that takes no arguments,
   so each medium gets its own way in. */
function resetBengaliNumbering() { resetSerialNumbering_('bengali'); }
function resetEnglishNumbering() { resetSerialNumbering_('english'); }

function getSheet_(stream) {
  const book = SpreadsheetApp.openById(stream.bookId);
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME);

  /* `Medium` is bookkeeping, not an answer, so it sits with the other three
     rather than in COLUMNS — which is defined as the form schema's field
     names. It goes fourth, leaving the Reference and Submission key columns
     where findByClientRef_ and highestSerialInSheet_ expect them. Keeping it
     makes a mis-routed row visible, and survives the two books being read
     side by side. */
  const header = ['Received at', 'Reference', 'Submission key', 'Medium'].concat(COLUMNS);

  if (sheet.getLastRow() === 0) {
    writeHeader_(sheet, header);
  } else if (sheet.getLastRow() === 1 && !sameRow_(headerOf_(sheet), header)) {
    /* The question list changed while the sheet still held no applications —
       a redeploy during setup. Rewrite the header so the first real row lands
       under the right names. With data present we leave it alone: existing
       rows are positional, and silently renaming their columns would be worse
       than a visible mismatch. */
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).clearContent();
    writeHeader_(sheet, header);
  }
  return sheet;
}

function writeHeader_(sheet, header) {
  sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function headerOf_(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function (cell) { return String(cell); });
}

function sameRow_(a, b) {
  return a.length === b.length && a.every(function (cell, i) { return cell === b[i]; });
}

/** Column 3 holds the submission key. Returns the stored reference, or null. */
function findByClientRef_(sheet, clientRef) {
  if (!clientRef) return null;
  const rows = sheet.getLastRow() - 1;
  if (rows < 1) return null;

  const keys = sheet.getRange(2, 3, rows, 1).getValues();
  for (let i = 0; i < keys.length; i += 1) {
    if (String(keys[i][0]) === clientRef) return String(sheet.getRange(i + 2, 2).getValue());
  }
  return null;
}

function pad_(value, width) {
  let out = String(value);
  while (out.length < width) out = '0' + out;
  return out;
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
