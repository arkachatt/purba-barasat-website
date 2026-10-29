/**
 * auth.js — the seam between this website and the school's management
 * software.
 *
 * The public site deliberately holds no credentials and no session. This
 * module is a stub: it validates what the visitor typed and then reports that
 * no backend is wired. Point `setAuthAdapter()` at the real endpoint (or an
 * SSO redirect) and every log-in form starts working without touching a
 * component.
 */

export class AuthError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'AuthError';
    this.field = field;          // which input to flag, when the cause is one field
  }
}

/** Where the management software lives. Empty until the office supplies it. */
export const authConfig = {
  managementUrl: '',
  productName: 'PBAB Management Software',
};

/**
 * The default adapter. Replace it with one that talks to the real system:
 *   setAuthAdapter(async ({ role, id, password }) => { … return { redirectTo } })
 */
let adapter = async () => {
  throw new AuthError(
    `Sign-in is not connected yet. ${authConfig.productName} will open here once the ` +
    'office supplies the address — please use the existing link or call the school office.'
  );
};

export function setAuthAdapter(nextAdapter) { adapter = nextAdapter; }

/** Field-level checks, shared by every role form. */
export function validateCredentials({ id, password }, labels = {}) {
  if (!id || !id.trim()) throw new AuthError(`Enter your ${labels.id || 'ID'}.`, 'id');
  if (!password) throw new AuthError('Enter your password.', 'password');
  if (password.length < 6) throw new AuthError('Password must be at least 6 characters.', 'password');
}

/**
 * Attempt a sign-in.
 * @returns {Promise<{redirectTo?: string}>}
 * @throws  {AuthError}
 */
export async function login({ role, id, password }, labels = {}) {
  validateCredentials({ id, password }, labels);
  const result = await adapter({ role, id, password });
  if (result && result.redirectTo) window.location.assign(result.redirectTo);
  return result || {};
}
