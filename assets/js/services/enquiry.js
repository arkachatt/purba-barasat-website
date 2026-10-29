/**
 * enquiry.js — the contact form's seam to the office.
 *
 * Nothing is sent until an adapter is supplied. The default one reports that
 * honestly and points the visitor at the phone number, which is the school's
 * real fallback.
 */
import { school } from '../data/site.js';

export class EnquiryError extends Error {}

let adapter = async () => {
  throw new EnquiryError(
    `The enquiry form is not connected to the office inbox yet. Please email ${school.email.label} ` +
    `or call ${school.phone.label} (10:30–16:30, Mon–Sat).`
  );
};

export function setEnquiryAdapter(next) { adapter = next; }

export async function sendEnquiry(data) { return adapter(data); }
