/**
 * admission.js — the seam between the application form and the school office.
 *
 * The form posts to a Google Apps Script web app, which appends a row to the
 * school's spreadsheet and hands back an official reference number. None of
 * that is required for the form to work: with no endpoint configured, or with
 * the network down, the applicant still gets a validated form and a printable
 * PDF carrying a locally-minted reference. The printout is what they bring to
 * school, so it must never depend on a server answering.
 */
import { config } from '../config.js';
import { admissionForm, admissionStreams } from '../data/site.js';

/* Drafts are per medium: one family applying for two children, one in each
   medium, is an ordinary case, and a shared key would have the second
   overwrite the first.

   The receipt is not. It means "the last thing submitted in this tab",
   sessionStorage is already per tab, and the medium is recorded inside the
   receipt — so the confirmation page needs no URL parameter to find it. */
const draftKey = (medium) => `pbab.admission.draft.${medium}`;
const SUBMISSION_KEY = 'pbab.admission.submitted';

/**
 * Every field, in order, flattened out of the form's visual groups.
 * Takes a stream's form from formFor(); defaults to the shared schema, whose
 * two class fields have no options of their own.
 */
export const allFields = (form = admissionForm) =>
  form.groups.flatMap((group) => group.fields);

/**
 * The class segment of a reference: `Class VII` → `VII`.
 *
 * Not a lookup table, because classes are written `Class <roman>` everywhere
 * in the data already. Code.gs does the same thing to the same strings — it
 * cannot import this, so the two have to stay honest by being trivial.
 */
const roman = (klass) => String(klass || '').replace('Class ', '').trim() || '?';

/* ── validation ─────────────────────────────────────────────────────────── */

/** Named rules referenced by `rule` in the form schema. */
export const rules = {
  aadhaar(value) {
    const digits = String(value).replace(/\D/g, '');
    if (digits.length !== 12) return `Aadhaar has 12 digits — you entered ${digits.length}.`;
    return null;
  },
  mobile(value) {
    const digits = String(value).replace(/\D/g, '');
    if (digits.length !== 10) return `Mobile number has 10 digits — you entered ${digits.length}.`;
    return null;
  },
  pin(value) {
    const digits = String(value).replace(/\D/g, '');
    if (digits.length !== 6) return `A PIN code has 6 digits — you entered ${digits.length}.`;
    return null;
  },
  /** An IFSC is four letters, a zero, then six characters. */
  ifsc(value) {
    const code = String(value).toUpperCase().replace(/\s/g, '');
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(code)) {
      return 'An IFSC looks like SBIN0001234 — four letters, a zero, then six characters.';
    }
    return null;
  },
  micr(value) {
    const digits = String(value).replace(/\D/g, '');
    if (digits.length !== 9) return `A MICR code has 9 digits — you entered ${digits.length}.`;
    return null;
  },
  /** Account numbers vary by bank, so only the plausible range is checked. */
  bankAccount(value) {
    const digits = String(value).replace(/\s/g, '');
    if (!/^\d{9,18}$/.test(digits)) return 'A bank account number is between 9 and 18 digits.';
    return null;
  },
  apaar(value) {
    const digits = String(value).replace(/\D/g, '');
    if (digits.length !== 12) return `An APAAR ID has 12 digits — you entered ${digits.length}.`;
    return null;
  },

  /**
   * Each class has its own age window, listed in admissionForm.ageRanges.
   * Nothing is computed from the class here — the bounds are a policy the
   * office changes, not arithmetic.
   *
   * The cutoff is split by hand rather than handed to `new Date`, because
   * `new Date('2027-01-01')` is UTC midnight while the getters below are
   * local: anywhere west of Greenwich the comparison slips a day. India is
   * east of it, so this has never shown — which is exactly why it would not
   * be found later.
   */
  age(value, data) {
    if (!value) return null;
    const [cy, cm, cd] = String(admissionForm.ageCutoff || '2027-01-01').split('-').map(Number);
    const cutoff = new Date(cy, cm - 1, cd);
    const dob = new Date(value);
    if (Number.isNaN(dob.getTime())) return 'Enter a valid date of birth.';
    let age = cutoff.getFullYear() - dob.getFullYear();
    const before = cutoff.getMonth() < dob.getMonth() ||
      (cutoff.getMonth() === dob.getMonth() && cutoff.getDate() < dob.getDate());
    if (before) age -= 1;
    const range = admissionForm.ageRanges[data.class];
    if (!range) return null;            /* a class with no rule written for it */
    if (age < range.min) return `Applicant must be ${range.min}+ on 1 Jan 2027 for ${data.class}.`;
    if (age > range.max) return `Please check the date of birth — the applicant is over ${range.max}.`;
    return null;
  },
  /**
   * A class the school lists but is not admitting to this session.
   *
   * The dropdown already greys it, so this catches only the two ways round
   * that: a draft saved before the class was closed, and a tampered select.
   * Both would otherwise file a child into a register the office is not
   * reading.
   */
  classOffered(value, data) {
    const stream = admissionStreams[data.medium] || admissionStreams.bengali;
    if ((stream.notYet || []).includes(value)) {
      return `${value} is not being admitted this session. Choose another class.`;
    }
    return null;
  },

  /**
   * The class passed has to be the one below the class applied for.
   *
   * It is a plain list rather than a select that follows the class above it,
   * because narrowing it live would mean re-rendering mid-form and taking the
   * focus with it. Checking on submit costs nothing and reads the same.
   */
  lastClass(value, data) {
    const stream = admissionStreams[data.medium] || admissionStreams.bengali;
    const index = stream.classes.indexOf(data.class);
    if (index < 0) return null;
    const expected = stream.lastClasses[index];
    if (expected && value !== expected) {
      return `For ${data.class} the last class passed should be ${expected}.`;
    }
    return null;
  },
};

/**
 * Validate a set of fields. Takes anything with a `.fields` array, which is
 * why the contact form reuses it — do not narrow this signature.
 * @returns {Record<string,string>} field name → message; empty when clean
 */
export function validateStep(step, data) {
  const errors = {};
  for (const field of step.fields || []) {
    const value = (data[field.name] ?? '').toString().trim();
    if (field.required && !value) {
      errors[field.name] = field.requiredMessage || `Enter ${field.label}.`;
      continue;
    }
    if (value && field.rule && rules[field.rule]) {
      const message = rules[field.rule](value, data);
      if (message) errors[field.name] = message;
    }
  }
  return errors;
}

/** The whole form at once, across every group. */
export function validateAll(data, form = admissionForm) {
  return validateStep({ fields: allFields(form) }, data);
}

/* ── references ─────────────────────────────────────────────────────────── */

/**
 * A stable key for one attempt, so a retry updates the same row rather than
 * adding a second one. Minted once per draft and carried through.
 */
export function newClientRef() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * The reference used when the office's sheet could not be reached. The `W-`
 * marks it as issued by the website, so the office can tell at a glance that
 * this printout was never registered online.
 */
export function localReference({ medium, klass } = {}) {
  const stream = admissionStreams[medium] || admissionStreams.bengali;
  const serial = String(Math.floor(Math.random() * 9000) + 1000);
  return `PBAB/27/${stream.letter}/${roman(klass)}/W-${serial}`;
}

/** A temporary reference shown while the application is still a draft. */
export function draftReference(draft, medium) {
  const stream = admissionStreams[medium] || admissionStreams.bengali;
  return draft?.ref || `TMP-27-${stream.letter}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
}

/* ── the sheet ──────────────────────────────────────────────────────────── */

/**
 * Post to the Apps Script web app.
 *
 * The request must be a CORS "simple request", because an Apps Script web app
 * does not answer a preflight: that means POST with `text/plain`, never
 * `application/json`. Done this way there is no preflight at all and the
 * response stays readable, which is how the official reference comes back.
 * (`mode: 'no-cors'` would also avoid the preflight, but makes the response
 * opaque — we would lose the reference and could not tell success from
 * failure.)
 */
async function postToSheet({ data, clientRef, medium }) {
  const endpoint = config.admissionEndpoint;
  if (!endpoint) return { synced: false, syncError: 'not-configured' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.admissionTimeoutMs || 12000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      /* `medium` travels beside `data`, not inside it: `data` is exactly the
         form schema's field set, which is what COLUMNS in Code.gs is defined
         against. Which register to write to is not an answer to a question. */
      body: JSON.stringify({ clientRef, medium, data }),
      signal: controller.signal,
    });
    const out = await response.json();
    if (!out?.ok || !out.reference) return { synced: false, syncError: 'rejected' };
    return { synced: true, syncError: null, reference: out.reference };
  } catch {
    return { synced: false, syncError: 'unreachable' };
  } finally {
    clearTimeout(timer);
  }
}

/** Swap the transport — a different backend, or a test double. */
let submitAdapter = postToSheet;
export function setSubmitAdapter(next) { submitAdapter = next; }

/**
 * Send the application. Resolves with a receipt whatever happens: the caller
 * must still be able to produce the PDF when the network is down.
 */
export async function submitApplication({ data, clientRef, medium }) {
  let result;
  try {
    result = await submitAdapter({ data, clientRef, medium });
  } catch {
    result = { synced: false, syncError: 'unreachable' };
  }

  const receipt = {
    reference: result.reference || localReference({ medium, klass: data.class }),
    submittedAt: new Date(),
    synced: Boolean(result.synced),
    syncError: result.syncError ?? null,
    medium,
    clientRef,
    data,
  };

  saveSubmission(receipt);
  /* Always drop the draft. A retry works from the receipt, so keeping it
     would only leave a child's Aadhaar in localStorage on what may well be a
     shared family phone. */
  clearDraft(medium);
  return receipt;
}

/* ── storage ────────────────────────────────────────────────────────────── */

export function loadDraft(medium) {
  try { return JSON.parse(localStorage.getItem(draftKey(medium))) || null; } catch { return null; }
}

export function saveDraft(medium, draft) {
  try {
    localStorage.setItem(draftKey(medium), JSON.stringify({ ...draft, savedAt: Date.now() }));
  } catch { /* private mode */ }
}

export function clearDraft(medium) {
  try { localStorage.removeItem(draftKey(medium)); } catch { /* private mode */ }
}

/**
 * The receipt lives in sessionStorage, not localStorage: it holds the whole
 * answer set including Aadhaar, and it should die with the tab rather than
 * sit on a shared family phone.
 */
export function saveSubmission(receipt) {
  try {
    sessionStorage.setItem(SUBMISSION_KEY, JSON.stringify({
      ...receipt,
      submittedAt: new Date(receipt.submittedAt).toISOString(),
    }));
  } catch { /* private mode — the confirmation page degrades to its empty state */ }
}

export function loadSubmission() {
  try { return JSON.parse(sessionStorage.getItem(SUBMISSION_KEY)) || null; } catch { return null; }
}

/** Re-send an application the office never received, under its original key. */
export async function retrySubmission(receipt) {
  /* The medium has to travel with the retry. Without it the script falls back
     to Bengali, and an English application that failed the first time would
     quietly land in the wrong register on the second. */
  const result = await submitAdapter({
    data: receipt.data, clientRef: receipt.clientRef, medium: receipt.medium,
  });
  if (!result?.synced) return { ...receipt, syncError: result?.syncError || 'unreachable' };

  const updated = {
    ...receipt,
    reference: result.reference || receipt.reference,
    submittedAt: new Date(receipt.submittedAt),
    synced: true,
    syncError: null,
  };
  saveSubmission(updated);
  clearDraft(receipt.medium);
  return updated;
}
