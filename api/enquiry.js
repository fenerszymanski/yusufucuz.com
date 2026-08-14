// Private-tour enquiry handler for yusufucuz.com
// Receives the homepage form and emails the enquiry to Yusuf.
// Email is sent via Resend (https://resend.com) when RESEND_API_KEY is set.
// Until it is configured, the endpoint returns a clear message and the
// front-end falls back to a mailto: link, so the site works either way.

function clean(value, max) {
  return String(value == null ? '' : value)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
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
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }

  const parsed = parse(body || {});
  if (parsed.error) return res.status(400).json({ ok: false, error: parsed.error });
  const v = parsed.value;

  const key = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO || 'info@yusufucuz.com';
  const from = process.env.ENQUIRY_FROM || 'Yusuf Ucuz <onboarding@resend.dev>';

  if (!key) {
    return res.status(503).json({ ok: false, error: 'The enquiry form is not live yet. Please email info@yusufucuz.com.' });
  }

  const text = [
    'New private-tour enquiry from yusufucuz.com',
    '',
    'Name:        ' + v.name,
    'Email:       ' + v.email,
    'Dates:       ' + v.dates,
    'Group size:  ' + v.group,
    'Interests:   ' + (v.interests || '(none)'),
  ].join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: from,
        to: [to],
        reply_to: v.email,
        subject: 'Private tour enquiry — ' + v.name + ' (' + v.group + ' pax, ' + v.dates + ')',
        text: text,
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(function () { return ''; });
      console.error('resend send failed', r.status, detail.slice(0, 300));
      return res.status(502).json({ ok: false, error: 'I could not send your enquiry just now. Please try again or email info@yusufucuz.com.' });
    }
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('enquiry handler error', err && err.message);
    return res.status(502).json({ ok: false, error: 'I could not send your enquiry just now. Please try again or email info@yusufucuz.com.' });
  }
}
