# yusufucuz.com

Personal brand site for **Yusuf Ucuz** — private Berlin tour guide. Static site with one
serverless endpoint for the enquiry form. Built to deploy on **Vercel** (git-based, no Wix Studio).

## Structure

```
index.html          the whole homepage (self-contained: inline CSS + JS)
assets/             hero.jpg, guests.jpg, sunset.jpg, favicon.svg
api/enquiry.js      serverless function: receives the form, emails Yusuf via Resend
vercel.json         clean URLs + asset caching
robots.txt, sitemap.xml
.env.example        environment variables for the enquiry email
```

Design system: Newsreader + Work Sans; paper `#FBF8F1`, ink `#1C1A15`, ochre `#B0782A`;
BerlinWalk green `#1B5E20` used only as an accent (FreeTour chip, free-tour button, review link).

## Local preview

Static preview (form falls back to mailto without a backend):

```bash
python3 -m http.server 3000
```

Full preview with the serverless function:

```bash
npm i -g vercel
vercel dev
```

## Deploy

1. Install and log in once:

   ```bash
   npm i -g vercel
   vercel login
   ```

2. From this folder, deploy:

   ```bash
   vercel          # preview deployment
   vercel --prod   # production
   ```

   (Or connect this repo to a Vercel project in the dashboard for auto-deploy on push.)

## Enquiry email (Resend)

The form works immediately: without config it shows a `mailto:` fallback. To receive
enquiries by email:

1. Create a free account at https://resend.com, add an API key.
2. In Vercel → Project → Settings → Environment Variables, set:
   - `RESEND_API_KEY`
   - `ENQUIRY_TO` = `info@yusufucuz.com`
   - `ENQUIRY_FROM` = `Yusuf Ucuz <onboarding@resend.dev>` to test, then your own
     verified domain sender once you verify `yusufucuz.com` in Resend.
3. Redeploy.

## Custom domain

In Vercel → Project → Settings → Domains, add `yusufucuz.com` and `www.yusufucuz.com`,
then update DNS at your registrar (this moves the domain off Wix hosting). Vercel shows the
exact records. The old Wix site stays intact until DNS is switched.
