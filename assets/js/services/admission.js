/**
 * admission.js — the seam between the application form and the school office.
 *
 * Like services/auth.js, this is where the real system plugs in. Today the
 * draft lives in the browser, uploads never leave it, and submission produces
 * a local reference number. Swap the three adapters and the wizard is live.
 */

const DRAFT_KEY = 'pbab.admission.draft';
const SUBMISSION_KEY = 'pbab.admission.submitted';

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
    const cutoff = new Date('2027-01-01');
    const dob = new Date(value);
    if (Number.isNaN(dob.getTime())) return 'Enter a valid date of birth.';
    let age = cutoff.getFullYear() - dob.getFullYear();
    const before = cutoff.getMonth() < dob.getMonth() ||
      (cutoff.getMonth() === dob.getMonth() && cutoff.getDate() < dob.getDate());
    if (before) age -= 1;
    if (data.class === 'Class V' && age < 10) {
      return 'Applicant must be 10+ on 1 Jan 2027 for Class V.';
    }
    return null;
  },
};

/** Validate one step's fields. Returns { fieldName: message } — empty when clean. */
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

/* ── uploads ────────────────────────────────────────────────────────────── */

export class UploadError extends Error {}

/**
 * The upload adapter. The default one only checks the file and reports
 * progress — nothing leaves the browser. Replace it with a real upload:
 *   setUploadAdapter(async (file, onProgress) => { … return { url } })
 */
let uploadAdapter = async (file, onProgress) => {
  for (let percent = 20; percent < 100; percent += 20) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    onProgress(percent);
  }
  return { url: null, local: true };
};

export function setUploadAdapter(next) { uploadAdapter = next; }

export async function uploadDocument(file, { maxMb, accept }, onProgress = () => {}) {
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new UploadError(`${file.name} is ${formatSize(file.size)} — limit is ${maxMb} MB.`);
  }
  if (accept && !accept.includes(file.type)) {
    throw new UploadError(`${file.name} is not a JPG, PNG or PDF.`);
  }
  return uploadAdapter(file, onProgress);
}

export function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

/* ── draft ──────────────────────────────────────────────────────────────── */

export function loadDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY)) || null; } catch { return null; }
}

export function saveDraft(draft) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, savedAt: Date.now() })); } catch { /* private mode */ }
}

export function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* private mode */ }
}

/** A temporary reference shown while the application is still a draft. */
export function draftReference(draft) {
  return draft?.ref || `TMP-27-${String(Math.floor(Math.random() * 90000) + 10000)}`;
}

/* ── submission ─────────────────────────────────────────────────────────── */

/**
 * The submit adapter. Until the office supplies an endpoint this mints a local
 * reference so the confirmation screen can be reached and printed.
 */
let submitAdapter = async ({ data }) => {
  const serial = String(Math.floor(Math.random() * 900) + 100).padStart(5, '0');
  const klass = (data.class || 'Class V').replace('Class ', '');
  return {
    reference: `PBAB/27/${klass}/${serial}`,
    submittedAt: new Date(),
    pending: true,      // nothing was sent anywhere yet
  };
}

export function setSubmitAdapter(next) { submitAdapter = next; }

export async function submitApplication({ data, documents }) {
  const receipt = await submitAdapter({ data, documents });
  try {
    sessionStorage.setItem(SUBMISSION_KEY, JSON.stringify({
      ...receipt,
      submittedAt: receipt.submittedAt.toISOString(),
      name: data.nameEn,
      class: data.class,
      mobile: data.mobile,
    }));
  } catch { /* private mode — the confirmation page falls back to placeholders */ }
  clearDraft();
  return receipt;
}

export function loadSubmission() {
  try { return JSON.parse(sessionStorage.getItem(SUBMISSION_KEY)) || null; } catch { return null; }
}
