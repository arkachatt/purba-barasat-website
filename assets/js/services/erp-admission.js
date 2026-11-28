/**
 * erp-admission.js — an application goes to the sheet AND to the ERP.
 *
 * Not "instead of". The reference a family quotes — PBAB/27/B/V/00001 — is
 * minted by the Apps Script's own counter under a script lock, and nothing in
 * a static site can mint that series: `localReference()` only produces the
 * random `W-` form that means "never registered". So the sheet stays the
 * authority and Chalked is a second, best-effort destination.
 *
 * ORDER MATTERS. The sheet is written first and alone; the ERP write cannot
 * throw, cannot delay the reference, and cannot change what the PDF prints.
 * During the admission rush a whole cybercafé sits behind one address, so a
 * 429 from Chalked is an ordinary afternoon — and it must never be the reason
 * a child's application has no number on it.
 *
 * DUPLICATES. Chalked has no idempotency key, so a second POST is a second
 * application, not an update. That shapes the retry rule below.
 */
import { config } from '../config.js';
import { erpErrorKind, erpPost } from './erp.js';
import { admissionPayload } from './erp-map.js';
import { postToSheet, setSubmitAdapter } from './admission.js';

/** Which register this medium belongs to. Unknown falls back the way the
    rest of the code does, to Bengali — a wrong guess here is the wrong
    TENANT, not just the wrong tab, so it is worth keeping in one place. */
function tenantFor(medium) {
  return config.erp.tenants[medium] || config.erp.tenants.bengali;
}

/**
 * Should a retry speak to the ERP again?
 *
 * Only when we know the first attempt never arrived. A connection that was
 * never established ('network') and an explicit refusal to serve us yet
 * ('rate-limited') are both safe to repeat. A timeout is NOT: the server may
 * have written the row and merely failed to tell us in time, and sending
 * again would file a second application for the same child. A missing mirror
 * row costs the office a lookup; a duplicate costs a family a place.
 */
function safeToRepeat(erpError) {
  return erpError === 'network' || erpError === 'rate-limited';
}

async function postToChalked({ data, clientRef, medium, websiteRef }) {
  try {
    const out = await erpPost(
      tenantFor(medium), '/admissions',
      admissionPayload({ data, medium, clientRef, websiteRef }),
    );
    return out?.reference
      ? { erpReference: out.reference, erpSynced: true, erpError: null }
      : { erpReference: null, erpSynced: false, erpError: 'rejected' };
  } catch (err) {
    return { erpReference: null, erpSynced: false, erpError: erpErrorKind(err) };
  }
}

export async function erpSubmitAdapter({ data, clientRef, medium, previous }) {
  const sheet = await postToSheet({ data, clientRef, medium });

  /* On a retry, `previous` carries what the ERP said last time. If it already
     has our application, or might have, leave it alone. */
  if (previous && previous.erpSynced) {
    return { ...sheet, erpReference: previous.erpReference, erpSynced: true, erpError: null };
  }
  if (previous && previous.erpError && !safeToRepeat(previous.erpError)) {
    return { ...sheet, erpReference: null, erpSynced: false, erpError: previous.erpError };
  }

  const erp = await postToChalked({
    data, clientRef, medium, websiteRef: sheet.reference,
  });
  return { ...sheet, ...erp };
}

export function installErpSubmit() { setSubmitAdapter(erpSubmitAdapter); }
