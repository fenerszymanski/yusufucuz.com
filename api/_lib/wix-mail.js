// Send the owner notification through Wix's own Email Transmissions API.
//
// Why this and not the Wix Forms automation: the automation emails the CONTACT
// "Yusuf Ucuz" (yusuf.ucuz@gmail.com), and mail on that route never arrives —
// verified repeatedly. The same Wix sender delivering to info@yusufucuz.com
// lands in the inbox (Wix Bookings notifications use that route too), so we
// address info@ directly.
//
// Uses the existing WIX_API_KEY. Needs the Manage Email Marketing scope.

import crypto from 'node:crypto';

const API = 'https://www.wixapis.com/email-transmissions/v1/email-transmissions';

export function wixMailConfigured() {
  return Boolean(process.env.WIX_API_KEY);
}

export async function sendWixEmail({ siteId, to, subject, html, senderName, senderEmail, replyTo }) {
  if (!wixMailConfigured()) return { status: 'not_configured' };

  const body = {
    emailTransmission: {
      emailSubject: subject,
      emailHtmlContent: html,
      senderName: senderName || 'Yusuf from BerlinWalk',
      senderEmailAddress: senderEmail,
      toRecipients: [{ emailAddress: to }],
      type: 'TRANSACTIONAL',
    },
    idempotencyKey: crypto.randomUUID(),
  };
  if (replyTo) body.emailTransmission.replyTo = { emailAddress: replyTo };

  let r;
  try {
    r = await fetch(`${API}/send`, {
      method: 'POST',
      headers: {
        Authorization: process.env.WIX_API_KEY,
        'wix-site-id': siteId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    return { status: 'unknown', error: String(e && e.message).slice(0, 200) };
  }

  const payload = await r.json().catch(() => ({}));
  if (!r.ok) {
    return { status: 'failed', error: String(payload.message || `wix_mail_${r.status}`).slice(0, 300) };
  }
  // ACCEPTED means Wix took it; delivery state is readable via GET /{id}.
  return { status: 'sent', id: payload?.emailTransmission?.id || null };
}
