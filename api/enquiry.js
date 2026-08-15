// Private-tour enquiry handler for yusufucuz.com.
//
// Every enquiry is delivered two ways, independently:
//   1. Wix Forms  — reuses Yusuf's existing BerlinWalk private-tour form, so
//                   enquiries stay in the Wix dashboard alongside the others.
//   2. Email      — sent from Yusuf's own Gmail (OAuth), because the Wix
//                   notification automation was observed not to fire.
// If one route fails the other still gets through; the visitor only sees an
// error when BOTH fail.

import { wixFetch } from './_lib/wix.js';
import { sendGmail, gmailConfigured } from './_lib/gmail.js';
import { sendWixEmail, wixMailConfigured } from './_lib/wix-mail.js';

const SITE_ID = process.env.WIX_SITE_ID || '12ee5ea0-70a7-492f-8020-ffb27cbb630f';
const FORM_ID = process.env.WIX_FORM_ID || '5c5da80a-d838-49f6-b725-1a15c9838bc9';
const NOTIFY_TO = process.env.ENQUIRY_TO || 'info@yusufucuz.com';
const SENDER_EMAIL = process.env.ENQUIRY_FROM || 'info@yusufucuz.com';

function clean(value, max) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, max);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function originAllowed(origin) {
  if (!origin) return true; // same-origin/server calls may omit Origin
  return /(^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$)|(\.vercel\.app$)|(yusufucuz\.com$)/.test(origin);
}

function parse(body) {
  const name = clean(body && body.name, 120);
  const email = clean(body && body.email, 254).toLowerCase();
  const dates = clean(body && body.dates, 160);
  const group = clean(body && body.group, 3);
  const interests = clean(body && body.interests, 1000);

  if (name.length < 2) return { error: 'Please enter your name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' };
  if (dates.length < 2) return { error: 'Please enter at least one preferred date.' };
  if (!/^(?:[1-9]|10)$/.test(group)) return { error: 'Please enter a group size from 1 to 10.' };

  return { value: { name, email, dates, group, interests } };
}

async function saveToWix(v) {
  if (!process.env.WIX_API_KEY) return { status: 'not_configured' };
  await wixFetch('/form-submission-service/v4/submissions', {
    method: 'POST',
    siteId: SITE_ID,
    body: {
      submission: {
        formId: FORM_ID,
        submissions: {
          private_tour_name: v.name + ' — via yusufucuz.com',
          private_tour_email: v.email,
          private_tour_dates: v.dates,
          private_tour_group_size: v.group,
          private_tour_interests: v.interests,
        },
      },
    },
  });
  return { status: 'saved' };
}

async function sendViaResend({ to, subject, text, html, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { status: 'not_configured' };
  const from = process.env.ENQUIRY_FROM_RESEND || 'yusufucuz.com <onboarding@resend.dev>';
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text, html }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      return { status: 'failed', error: `resend_${r.status}: ${detail.slice(0, 200)}` };
    }
    return { status: 'sent', provider: 'resend' };
  } catch (e) {
    return { status: 'unknown', error: String(e?.message || 'resend_unknown').slice(0, 200) };
  }
}

async function notifyByEmail(v) {
  if (!wixMailConfigured() && !gmailConfigured() && !process.env.RESEND_API_KEY) return { status: 'not_configured' };

  const text = [
    'New private-tour enquiry from yusufucuz.com',
    '',
    `Name:       ${v.name}`,
    `Email:      ${v.email}`,
    `Dates:      ${v.dates}`,
    `Group size: ${v.group}`,
    `Interests:  ${v.interests || '(none)'}`,
    '',
    'Reply straight to this email to answer them.',
  ].join('\n');

  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1C1A15;line-height:1.6">
  <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#B0782A;margin:0 0 6px">New private-tour enquiry</p>
  <h2 style="font-family:Georgia,serif;font-weight:500;margin:0 0 16px">${escapeHtml(v.name)}</h2>
  <table style="border-collapse:collapse;font-size:15px">
    <tr><td style="padding:4px 16px 4px 0;color:#6B6357">Email</td><td style="padding:4px 0"><a href="mailto:${escapeHtml(v.email)}" style="color:#1B5E20">${escapeHtml(v.email)}</a></td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6B6357">Dates</td><td style="padding:4px 0"><strong>${escapeHtml(v.dates)}</strong></td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6B6357">Group size</td><td style="padding:4px 0"><strong>${escapeHtml(v.group)}</strong></td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6B6357;vertical-align:top">Interests</td><td style="padding:4px 0">${escapeHtml(v.interests || '(none)')}</td></tr>
  </table>
  <p style="margin:20px 0 0;font-size:13px;color:#6B6357">Reply straight to this email to answer them. Also saved in Wix Forms.</p>
</div>`;

  const subject = `Private tour enquiry — ${v.name} (${v.group} pax, ${v.dates})`;

  // 1st choice: Wix's own Email Transmissions API, addressed to info@ — the one
  // route proven to reach the inbox (the Forms automation mails the gmail
  // contact instead, and that never arrives).
  if (wixMailConfigured()) {
    const viaWix = await sendWixEmail({
      siteId: SITE_ID,
      to: NOTIFY_TO,
      subject,
      html,
      senderName: 'Yusuf from BerlinWalk',
      senderEmail: SENDER_EMAIL,
      replyTo: v.email,
    });
    if (viaWix.status === 'sent') return viaWix;
  }

  // Fallbacks, only if a credential for them exists.
  if (gmailConfigured()) {
    const sent = await sendGmail({ to: NOTIFY_TO, subject, text, html, headers: { 'Reply-To': v.email } });
    if (sent.status === 'sent') return sent;
    const viaResend = await sendViaResend({ to: NOTIFY_TO, subject, text, html, replyTo: v.email });
    return viaResend.status === 'not_configured' ? sent : viaResend;
  }
  return sendViaResend({ to: NOTIFY_TO, subject, text, html, replyTo: v.email });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const origin = String(req.headers.origin || '');
  if (origin && originAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  if (!originAllowed(origin)) {
    return res.status(403).json({ ok: false, error: 'This form can only be submitted from yusufucuz.com.' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }

  const parsed = parse(body || {});
  if (parsed.error) return res.status(400).json({ ok: false, error: parsed.error });
  const v = parsed.value;

  const [wixResult, mailResult] = await Promise.allSettled([saveToWix(v), notifyByEmail(v)]);

  const wixOk = wixResult.status === 'fulfilled' && wixResult.value.status === 'saved';
  const mailOk = mailResult.status === 'fulfilled' && mailResult.value.status === 'sent';

  if (!wixOk) {
    console.error('enquiry: wix save failed', wixResult.status === 'rejected'
      ? String(wixResult.reason?.status || wixResult.reason?.message)
      : wixResult.value.status);
  }
  if (!mailOk) {
    console.error('enquiry: email failed', mailResult.status === 'rejected'
      ? String(mailResult.reason?.message)
      : JSON.stringify(mailResult.value));
  }

  if (!wixOk && !mailOk) {
    return res.status(502).json({ ok: false, error: 'I could not send your enquiry just now. Please try again or email info@yusufucuz.com.' });
  }
  return res.status(201).json({ ok: true, saved: wixOk, notified: mailOk });
}
