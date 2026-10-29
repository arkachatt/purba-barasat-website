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
import { admissionForm } from '../data/site.js';

const DRAFT_KEY = 'pbab.admission.draft';
const SUBMISSION_KEY = 'pbab.admission.submitted';

/** Every field, in order, flattened out of the form's visual groups. */
export const allFields = () => admissionForm.groups.flatMap((group) => group.fields);

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
  /** Class V needs the applicant to be 10+ on 1 January of the session year. */
  age(value, data) {
    if (!value) return null;
    const cutoff = new Date(admissionForm.ageCutoff || '2027-01-01');
    const dob = new Date(value);
    if (Number.isNaN(dob.getTime())) return 'Enter a valid date of birth.';
    let age = cutoff.getFullYear() - dob.getFullYear();
    const before = cutoff.getMonth() < dob.getMonth() ||
      (cutoff.getMonth() === dob.getMonth() && cutoff.getDate() < dob.getDate());
    if (before) age -= 1;
    if (age < 10) return 'Applicant must be 10+ on 1 Jan 2027 for Class V.';
    if (age > 14) return 'Please check the date of birth — the applicant is over 14.';
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
export function validateAll(data) {
  return validateStep({ fields: allFields() }, data);
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
export function localReference() {
  const serial = String(Math.floor(Math.random() * 9000) + 1000);
  return `PBAB/27/V/W-${serial}`;
}

/** A temporary reference shown while the application is still a draft. */
export function draftReference(draft) {
  return draft?.ref || `TMP-27-${String(Math.floor(Math.random() * 90000) + 10000)}`;
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
async function postToSheet({ data, clientRef }) {
  const endpoint = config.admissionEndpoint;
  if (!endpoint) return { synced: false, syncError: 'not-configured' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.admissionTimeoutMs || 12000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ clientRef, data }),
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
export async function submitApplication({ data, clientRef }) {
  let result;
  try {
    result = await submitAdapter({ data, clientRef });
  } catch {
    result = { synced: false, syncError: 'unreachable' };
  }

  const receipt = {
    reference: result.reference || localReference(),
    submittedAt: new Date(),
    synced: Boolean(result.synced),
    syncError: result.syncError ?? null,
    clientRef,
    data,
  };

  saveSubmission(receipt);
  /* Always drop the draft. A retry works from the receipt, so keeping it
     would only leave a child's Aadhaar in localStorage on what may well be a
     shared family phone. */
  clearDraft();
  return receipt;
}

/* ── storage ────────────────────────────────────────────────────────────── */

export function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) || null; } catch { return null; }
}

export function saveDraft(draft) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, savedAt: Date.now() })); } catch { /* private mode */ }
}

export function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* private mode */ }
}

/**
 * The receipt lives in sessionStorage, not localStorage: it holds the whole
 * answer set including Aadhaar, and it should die with the tab rather than
 * sit on a shared family phone.
 */
function saveSubmission(receipt) {
  try {
    sessionStorage.setItem(SUBMISSION_KEY, JSON.stringify({
      ...receipt,
      submittedAt: receipt.submittedAt.toISOString(),
    }));
  } catch { /* private mode — the confirmation page degrades to its empty state */ }
}

export function loadSubmission() {
  try { return JSON.parse(sessionStorage.getItem(SUBMISSION_KEY)) || null; } catch { return null; }
}

/** Re-send an application the office never received, under its original key. */
export async function retrySubmission(receipt) {
  const result = await submitAdapter({ data: receipt.data, clientRef: receipt.clientRef });
  if (!result?.synced) return { ...receipt, syncError: result?.syncError || 'unreachable' };

  const updated = {
    ...receipt,
    reference: result.reference || receipt.reference,
    submittedAt: new Date(receipt.submittedAt),
    synced: true,
    syncError: null,
  };
  saveSubmission(updated);
  clearDraft();
  return updated;
}
