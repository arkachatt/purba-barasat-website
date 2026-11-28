/**
 * erp.js — talking to Chalked, and nothing else.
 *
 * Transport only: this module knows how to reach the ERP and how to describe
 * a failure, and knows nothing about notices, galleries or applications. The
 * shape of what comes back is `erp-map.js`'s business; what to do when it does
 * not come back is the callers'.
 *
 * Why failures are classified rather than just thrown: the two callers want
 * different things from the same error. Content falls back to the local copy
 * whatever went wrong, so it only needs "it failed". An application retry has
 * to tell a connection that was never made (safe to send again) from a request
 * that timed out after the server may already have written the row (NOT safe
 * to send again, because the ERP has no idempotency key and would file a
 * second application for the same child).
 */
import { config } from '../config.js';

/** A failure with a `kind` the caller can branch on. */
export class ErpError extends Error {
  constructor(kind, message, status) {
    super(message);
    this.name = 'ErpError';
    /** 'timeout' | 'network' | 'rate-limited' | 'rejected' | 'http-4xx' | 'http-5xx' */
    this.kind = kind;
    this.status = status ?? null;
  }
}

/** The base URL for one tenant. `{code}` appears twice; both are filled. */
export function erpUrl(tenant, path = '', params = null) {
  const base = config.erp.urlTemplate.replaceAll('{code}', tenant);
  const query = params ? `?${new URLSearchParams(params)}` : '';
  return `${base}${path}${query}`;
}

/**
 * One request, with a deadline.
 *
 * `AbortController` rather than `Promise.race`, so a request we have stopped
 * waiting for is actually cancelled instead of running on in the background
 * and landing after the page has moved on.
 */
async function send(tenant, path, { method = 'GET', params, body, timeoutMs } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(erpUrl(tenant, path, params), {
      method,
      /* text/plain keeps this a CORS "simple request" — no preflight to
         answer, the same reason services/admission.js posts that way. The
         ERP reads the body as JSON regardless of what we label it. */
      headers: body ? { 'Content-Type': 'text/plain;charset=utf-8' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    /* An abort and a dead network look the same to fetch() but are not the
       same event, and the admission retry depends on telling them apart. */
    throw err?.name === 'AbortError'
      ? new ErpError('timeout', `Chalked did not answer within ${timeoutMs}ms`)
      : new ErpError('network', 'Could not reach Chalked');
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 429) {
    throw new ErpError('rate-limited', 'Chalked is rate limiting this address', 429);
  }
  if (!response.ok) {
    throw new ErpError(
      response.status >= 500 ? 'http-5xx' : 'http-4xx',
      `Chalked answered ${response.status}`, response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new ErpError('rejected', 'Chalked answered with something that is not JSON');
  }
}

export function erpGet(tenant, path, { params, timeoutMs = config.erp.contentTimeoutMs } = {}) {
  return send(tenant, path, { method: 'GET', params, timeoutMs });
}

export function erpPost(tenant, path, body, { timeoutMs = config.erp.submitTimeoutMs } = {}) {
  return send(tenant, path, { method: 'POST', body, timeoutMs });
}

/** The failure's kind, for anything that caught something that may not be ours. */
export function erpErrorKind(err) {
  return err instanceof ErpError ? err.kind : 'network';
}
