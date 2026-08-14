// Minimal Wix REST helper. Auth is a Wix API key (account-level) passed as the
// Authorization header, with the target site selected via the wix-site-id header.

export const WIX_API_ROOT = 'https://www.wixapis.com';

export function requireWixKey() {
  const key = process.env.WIX_API_KEY;
  if (!key) {
    const err = new Error('WIX_API_KEY is not set.');
    err.status = 503;
    throw err;
  }
  return key;
}

export async function wixFetch(pathname, { method = 'GET', body, siteId, signal } = {}) {
  const apiKey = requireWixKey();
  const headers = {
    Authorization: apiKey,
    'Content-Type': 'application/json',
  };
  if (siteId) headers['wix-site-id'] = siteId;

  const r = await fetch(`${WIX_API_ROOT}${pathname}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  const text = await r.text();
  let parsed;
  try { parsed = text ? JSON.parse(text) : null; } catch (e) { parsed = { raw: text }; }
  if (!r.ok) {
    const err = new Error(`Wix ${method} ${pathname} failed (${r.status})`);
    err.status = r.status;
    err.body = parsed;
    throw err;
  }
  return parsed;
}
