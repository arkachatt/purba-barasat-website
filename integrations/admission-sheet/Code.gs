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

/** Reference numbers read PBAB/<SESSION>/V/00042. */
const SESSION = '27';

/**
 * Columns, in order. These are the `name` keys from the website's form
 * schema (assets/js/data/site.js). To collect a new question: add the field
 * on the website, then add its name to the END of this list and re-deploy.
 * Never reorder — existing rows are positional.
 */
const COLUMNS = [
  'class', 'nameEn', 'nameBn', 'dob', 'gender', 'category', 'religion',
  'bloodGroup', 'pen', 'aadhaar', 'father', 'mother',
  'phone', 'altPhone', 'address', 'lastSchool', 'lastClass', 'passYear',
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

    const sheet = getSheet_();

    /* A retry after a dropped connection carries the same clientRef — update
       nothing, just hand back the reference the first attempt was given. */
    const already = findByClientRef_(sheet, clientRef);
    if (already) return json_({ ok: true, reference: already, duplicate: true });

    const row = sheet.getLastRow() + 1;
    const reference = 'PBAB/' + SESSION + '/V/' + pad_(row - 1, 5);

    sheet.appendRow([
      new Date(),
      reference,
      clientRef,
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
  return json_({ ok: true, service: 'pbab-admission', columns: COLUMNS.length });
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

function getSheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    const header = ['Received at', 'Reference', 'Submission key'].concat(COLUMNS);
    sheet.appendRow(header);
    sheet.getRange(1, 1, 1, header.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
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
