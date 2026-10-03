# yusufucuz.com

Personal brand site for **Yusuf Ucuz**, a Berlin walking-tour guide and the person behind
**Walk of Berlin**. The public website is hosted on **Wix Studio**. This repository supplies
its homepage and shared blog navigation/footer as custom elements, with scripts and assets
served from **GitHub Pages**. The private-tour enquiry endpoint runs separately on **Vercel**.

## Structure

```text
index.html                   homepage source, including shared navigation and footer
assets/                      photographs, personal favicon, Walk of Berlin wordmark
scripts/build-widget.py      builds the homepage custom element
scripts/build-parts.py       builds the shared blog header and footer
scripts/build-nav.py         builds the legacy navigation-only custom element
widget/                      generated Wix custom-element scripts and local test page
api/enquiry.js               Vercel private-tour enquiry endpoint
api/_lib/                    Wix and email delivery helpers
content/drafts/               local blog source; published articles live in Wix Blog
content/HANDOFF.md            historical implementation and publication notes
```

Design: Newsreader + Work Sans; paper `#FBF8F1`, ink `#1C1A15`, ochre `#B0782A`,
and green `#1B5E20`. Public offer: **Berlin Then and Now** at
`https://walkofberlin.com/book-berlin-walking-tour/berlin-then-and-now`.
The FreeTour ratings shown on the homepage are an **August 2026 snapshot** of guest reviews.

## Local preview and rebuild

```bash
python3 scripts/build-widget.py
python3 scripts/build-parts.py
python3 scripts/build-nav.py
python3 -m http.server 3000
```

Open `/index.html` for the standalone homepage or `/widget/test.html` for the custom element.
A static preview has no local enquiry endpoint; its form provides an email link if delivery fails.
Use `vercel dev` when testing the serverless endpoint locally with existing credentials.

## Production delivery

1. Edit `index.html`, then run all three builders. Do not hand-edit generated widget scripts.
2. Publish the intended scripts and assets through this repository's existing GitHub Pages
   delivery at `https://fenerszymanski.github.io/yusufucuz.com/`.
3. Check the custom-element source URLs in the **Yusuf Ucuz** Wix Studio site
   (`916bf0bd-d8d5-4282-a34a-8aa80bfd8afc`). If they pin an older file or revision, update
   them before publishing the Wix site. Reopen the live homepage, blog and a post to verify
   the rendered result; editor preview may cache scripts.
4. API changes require deployment to the existing Vercel project, whose production endpoint
   is `https://yusufucuz-com.vercel.app/api/enquiry`.

The main `yusufucuz.com` domain remains on Wix. A Vercel deployment alone does not update
its homepage or Wix Blog articles. Published blog copy must be updated separately in Wix Blog.

## Enquiry delivery

The widget sends enquiries to the Vercel endpoint. It independently saves the submission in
Wix Forms and sends an owner notification. Wix Email Transmissions is the preferred email
route, with Gmail OAuth and Resend as configured fallbacks. Delivery is reported successful
when at least one route succeeds.

Existing environment settings choose the API credentials, Wix site/form, and email recipients.
`WIX_SITE_ID` and `WIX_FORM_ID` default to the existing Walk of Berlin private-tour form;
`ENQUIRY_TO` and `ENQUIRY_FROM` default to `info@yusufucuz.com`. Sender display name:
**Yusuf at Walk of Berlin**. Preserve the existing credentials and delivery configuration when
deploying branding changes. Never put credentials in this repository.
