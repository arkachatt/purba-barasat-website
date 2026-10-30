# Connecting the admission form to a Google Sheet

Ten minutes, once. Until you do this the form still works — it validates, it
produces the printable PDF, and it tells the applicant the reference number
came from the website rather than the office. Only the spreadsheet row is
missing.

## 1. Make the spreadsheets

**One per medium** — each keeps its own applications and its own serial
numbering, so both start at 00001 and neither depends on the other. Create
them in the school's own Google account, not a personal one:

- **PBAB Admission Applications 2027–28 — Bengali Medium**
- **PBAB Admission Applications 2027–28 — English Medium**

Do **not** share either with "anyone with the link". The web app writes to
them through your account; nobody else needs access.

Copy each spreadsheet's id out of its URL — the long string between
`/spreadsheets/d/` and `/edit` — and paste them into `STREAMS` at the top of
`Code.gs`. Leave the `Applications` tab to the script; it creates it, with the
right header, on the first submission.

## 2. Add the script

In that sheet: **Extensions → Apps Script**. Delete whatever is in the editor
and paste the whole of `Code.gs` from this folder. Save.

## 3. Deploy it

First run **`checkStreams`** from the editor's Run menu. It opens both books,
which is what makes Google ask for the wider permission the script needs —
without it the permission is only asked for on the first real application,
where it fails where nobody is watching. The log should name both
spreadsheets.

Then **Deploy → New deployment → ⚙ → Web app**:

| Setting | Value |
|---|---|
| Description | `Admission form` |
| Execute as | **Me** (your account) |
| Who has access | **Anyone** |

"Anyone" is required. "Anyone with a Google account" forces a sign-in that the
website cannot complete, and every submission will fail.

Google will ask you to authorise the script the first time. It will warn that
the app is unverified — that is normal for your own script: **Advanced → Go to
(project name)**.

## 4. Copy the URL

Deploying gives you a **Web app URL** ending in `/exec`. Copy it.

## 5. Check it

Paste that URL into a browser tab. You should see:

```json
{"ok":true,"service":"pbab-admission","columns":31,"streams":{"bengali":"B","english":"E"}}
```

If you are asked to sign in instead, the access setting in step 3 is wrong.
Fix it and deploy a new version.

## 6. Tell the website

Open `assets/js/config.js` and paste the URL:

```js
admissionEndpoint: 'https://script.google.com/macros/s/AKfy..../exec',
```

Submit a test application in each medium. A row appears in that medium's
**Applications** tab and nowhere else, the reference on the downloaded PDF
matches the one in the sheet, and both mediums' first application is numbered
00001.

References read `PBAB/27/B/V/00001` for Bengali medium and
`PBAB/27/E/VII/00002` for English — session, medium, class, then a serial that
counts per medium.

---

## Changing the questions later

Add the field to `admissionForm.groups` in `assets/js/data/site.js`, then add
its `name` to the **end** of the `COLUMNS` list in `Code.gs` and deploy a new
version (**Deploy → Manage deployments → ✎ → New version**, which keeps the
same URL).

`COLUMNS` is the same for both mediums, and so is the deployment: one script
writes to both books. There is nothing to paste twice.

Never reorder `COLUMNS` once applications have been received — rows already
written are positional, and reordering would misalign every past application.
While the sheet still holds no applications the script notices a changed
question list and rewrites the header row itself, so reordering during setup is
safe; once there is data it leaves the header alone on purpose, because a
visible mismatch is better than silently renaming somebody's answers.

## What to expect

- **Duplicate protection.** Each attempt carries a submission key. If an
  applicant retries after a dropped connection, the script returns the
  original reference rather than writing a second row.
- **Junk rows.** The endpoint is public — it has to be, for a form on a public
  website to post to it. Expect the occasional bot submission. The reference
  numbers and the printed forms brought to the office are the real record.
- **Quota.** Apps Script allows far more executions per day than an admission
  window will ever use.
- **Restarting the numbering.** `resetBengaliNumbering` and
  `resetEnglishNumbering` in the Run menu, one per medium. Only ever when that
  medium's sheet holds no application you intend to keep.

## Privacy

The sheet holds, for each child, an Aadhaar number, a PEN, an APAAR ID and a
full bank account — number, bank, branch, IFSC and MICR. That is enough to be
worth stealing, and it arrives through an endpoint that is public by necessity. Keep it inside the
school's Google account, do not enable link sharing, and give edit access only
to the staff who process admissions.

If you would rather the most sensitive of those were never stored online, tell
the developer: any field can be marked so that it prints on the PDF the
guardian brings in, without ever being written to the sheet. The bank details
in particular are only needed once a child is admitted, not to decide an
application.
