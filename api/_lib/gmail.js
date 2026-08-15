// Send mail from Yusuf's own Gmail via OAuth (same approach BerlinWalk uses,
// see New project/berlinwalk-content-app/api/_lib/gmail-oauth.js).
// Needs GMAIL_OAUTH_CLIENT_ID, GMAIL_OAUTH_CLIENT_SECRET, GMAIL_REFRESH_TOKEN.

import crypto from 'node:crypto';

function cleanHeader(value, max = 300) {
  return String(value || '')
    .replace(/[\r\n\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .replace(/["\\]/g, '');
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim().toLowerCase());
}

function normalizeBody(value) {
  return String(value || '').replace(/\r?\n/g, '\r\n');
}

function encodeNonAsciiHeaderWords(value) {
  return value.replace(/[^\x20-\x7e]+/gu, (part) => (
    `=?UTF-8?B?${Buffer.from(part, 'utf8').toString('base64')}?=`
  ));
}

function fromAddress() {
  return process.env.ENQUIRY_FROM || process.env.HISTORY_LEAD_EMAIL_FROM || '';
}

export function gmailConfigured() {
  return Boolean(
    process.env.GMAIL_OAUTH_CLIENT_ID &&
    process.env.GMAIL_OAUTH_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN &&
    fromAddress()
  );
}

async function accessToken() {
  const params = new URLSearchParams({
    client_id: process.env.GMAIL_OAUTH_CLIENT_ID || '',
    client_secret: process.env.GMAIL_OAUTH_CLIENT_SECRET || '',
    refresh_token: process.env.GMAIL_REFRESH_TOKEN || '',
    grant_type: 'refresh_token',
  });
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });
  const payload = await r.json().catch(() => ({}));
  if (!r.ok || !payload.access_token) {
    const err = new Error(`gmail_token_failed_${r.status}`);
    err.code = 'gmail_token_failed';
    throw err;
  }
  return payload.access_token;
}

function buildMime(message) {
  const from = cleanHeader(fromAddress(), 180);
  const fromName = cleanHeader(process.env.ENQUIRY_FROM_NAME || 'yusufucuz.com', 100);
  const to = cleanHeader(message.to, 180);
  const subject = cleanHeader(message.subject, 240);
  if (!validEmail(from) || !validEmail(to)) throw new Error('invalid_email_header');
  if (!subject) throw new Error('missing_email_subject');

  const boundary = `yu_${crypto.randomBytes(12).toString('hex')}`;
  const extra = Object.entries(message.headers || {})
    .filter(([n, v]) => /^[A-Za-z0-9-]{1,80}$/.test(n) && String(v || '').trim())
    .map(([n, v]) => `${n}: ${cleanHeader(v, 900)}`);

  return [
    `From: "${fromName}" <${from}>`,
    `To: ${to}`,
    `Subject: ${encodeNonAsciiHeaderWords(subject)}`,
    'MIME-Version: 1.0',
    ...extra,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    normalizeBody(message.text),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    normalizeBody(message.html),
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n');
}

export async function sendGmail(message) {
  if (!gmailConfigured()) return { status: 'not_configured' };

  let token;
  try {
    token = await accessToken();
  } catch (e) {
    return { status: 'failed', error: String(e?.code || e?.message || 'token_failed').slice(0, 300) };
  }

  let r;
  try {
    r = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw: Buffer.from(buildMime(message), 'utf8').toString('base64url') }),
    });
  } catch (e) {
    return { status: 'unknown', error: String(e?.message || 'delivery_unknown').slice(0, 300) };
  }

  const payload = await r.json().catch(() => ({}));
  if (!r.ok) {
    return { status: 'failed', error: String(payload.error?.message || `send_failed_${r.status}`).slice(0, 300) };
  }
  return { status: 'sent', messageId: String(payload.id || '') };
}
