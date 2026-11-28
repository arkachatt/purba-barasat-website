/**
 * erp-enquiry.js — the contact form, carried to the office through Chalked.
 *
 * `/queries` is a public, unauthenticated POST linked from a page that is in
 * Google's index, which is a spam magnet. Two defences, neither of them here:
 * the ERP rate-limits by address, and the form carries a honeypot field that a
 * person never fills and a bot usually does. This module only refuses to send
 * when the honeypot is full.
 */
import { erpErrorKind, erpPost } from './erp.js';
import { config } from '../config.js';
import { queryPayload } from './erp-map.js';
import { EnquiryError, setEnquiryAdapter } from './enquiry.js';
import { school } from '../data/site.js';

/** The office's real fallback, in the school's own words. */
const BY_HAND = `Please email ${school.email.label} or call ${school.phone.label} ` +
                `(10:30–16:30, Mon–Sat).`;

const SAYS = {
  'rate-limited': 'Too many enquiries have been sent from this connection in the last hour.',
  timeout: 'The school office did not answer in time.',
  network: 'Your enquiry could not be sent — the connection failed.',
};

async function erpEnquiryAdapter(data) {
  /* A filled honeypot is a bot. Say nothing useful and do not send: telling
     it which field gave it away is telling it how to pass next time. */
  if ((data.website || '').trim()) return { ok: true };

  try {
    const out = await erpPost(config.erp.contentTenant, '/queries', queryPayload(data));
    if (!out?.ok) throw new EnquiryError(`Your enquiry was not accepted. ${BY_HAND}`);
    return out;
  } catch (err) {
    if (err instanceof EnquiryError) throw err;
    const kind = erpErrorKind(err);
    throw new EnquiryError(`${SAYS[kind] || 'Your enquiry could not be sent.'} ${BY_HAND}`);
  }
}

export function installErpEnquiry() { setEnquiryAdapter(erpEnquiryAdapter); }
