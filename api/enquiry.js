// Private-tour enquiry handler for yusufucuz.com.
// Submits to Wix Forms (reusing Yusuf's existing BerlinWalk private-tour form
// and its email automation), so enquiries land in the Wix dashboard and are
// emailed to him. No third-party email service. If WIX_API_KEY is missing, the
// endpoint returns a clear message and the front-end falls back to mailto:.

import { wixFetch } from './_lib/wix.js';

// BerlinWalk site + the existing five-field private-tour form (overridable via env).
const SITE_ID = process.env.WIX_SITE_ID || '12ee5ea0-70a7-492f-8020-ffb27cbb630f';
const FORM_ID = process.env.WIX_FORM_ID || '5c5da80a-d838-49f6-b725-1a15c9838bc9';

function clean(value, max) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, max);
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

  if (!process.env.WIX_API_KEY) {
    return res.status(503).json({ ok: false, error: 'The enquiry form is not live yet. Please email info@yusufucuz.com.' });
  }

  try {
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
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('wix enquiry submission failed', err && err.status);
    return res.status(502).json({ ok: false, error: 'I could not send your enquiry just now. Please try again or email info@yusufucuz.com.' });
  }
}
