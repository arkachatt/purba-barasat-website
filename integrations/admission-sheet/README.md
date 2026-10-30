# Connecting the admission form to a Google Sheet

Ten minutes, once. Until you do this the form still works — it validates, it
produces the printable PDF, and it tells the applicant the reference number
came from the website rather than the office. Only the spreadsheet row is
missing.

## 1. Make the spreadsheet

Create a new Google Sheet in the school's own Google account — not a personal
one. Name it something like **PBAB Admission Applications 2027–28**.

Do **not** share it with "anyone with the link". The web app writes to it
through your account; nobody else needs access.

## 2. Add the script

In that sheet: **Extensions → Apps Script**. Delete whatever is in the editor
and paste the whole of `Code.gs` from this folder. Save.

## 3. Deploy it

**Deploy → New deployment → ⚙ → Web app**, then:

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
{"ok":true,"service":"pbab-admission","columns":31}
```

If you are asked to sign in instead, the access setting in step 3 is wrong.
Fix it and deploy a new version.

## 6. Tell the website

Open `assets/js/config.js` and paste the URL:

```js
admissionEndpoint: 'https://script.google.com/macros/s/AKfy..../exec',
```

Submit a test application. A row appears in the **Applications** tab, and the
reference on the downloaded PDF matches the one in the sheet.

---

## Changing the questions later

Add the field to `admissionForm.groups` in `assets/js/data/site.js`, then add
its `name` to the **end** of the `COLUMNS` list in `Code.gs` and deploy a new
version (**Deploy → Manage deployments → ✎ → New version**, which keeps the
same URL).

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
