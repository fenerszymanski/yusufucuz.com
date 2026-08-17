# Where we stopped — 2026-08-17 (second session)

## Done since the first handoff

- **The blog header is fixed and live.** The old CV-site header is gone from `/blog`:
  the wordmark now reads **Yusuf Ucuz** and links to the homepage, and both old menus
  (Portfolio/CV/Contact had already been auto-removed with their pages; I deleted the
  remaining *My LinkedIn*, *Download CV (PDF)* and *Email Me*). Published and verified live.
  Note: the strings still appear in the page source as leftover menu *data*; nothing renders.
- **Redirects: not done, and the panel is the reason.** See below.

## Still open

1. **The five 301 redirects could not be created.** Wix's URL Redirect Manager will not
   persist anything from this browser: the Add-redirect dialog opens, accepts both fields,
   and `Save` / `Save & Add Another` silently do nothing — the list stays at four. I tried
   keyboard-only entry, autocomplete selection, and the CSV import path (its dialog would
   not open at all). This is the same class of failure as the Wix automation panel earlier
   in the project. **It is a two-minute job by hand:** Marketing → SEO & GEO → URL Redirect
   Manager → New Redirect, five times:
   `/portfolio`, `/cv`, `/contact`, `/cv-cm`, `/cv-gm` → `/`
   While there, repoint the four stale ones, which still target the deleted pages:
   `/blank`, `/blank-1`, `/cv-1`, `/cv-cm-1` → `/`
2. Alternative if the redirects stay undone: the soft-404 can be turned into a real 404 via
   the SEO User Config API (`shouldUsePartialRouteMatch: false`). Redirects are better for
   the three URLs that were in the sitemap; the 404 switch is the fallback.
3. **Blog styling** is still stock Wix, not Ink & Ochre. The wordmark also renders underlined,
   which is just default link styling and should be turned off.
4. **First post** not published yet — draft 03 is the one to run.
5. Draft 10 still needs Yusuf's voice note.

---

# First handoff — 2026-08-17

Site: Wix **Studio** site "Yusuf Ucuz", metaSiteId `916bf0bd-d8d5-4282-a34a-8aa80bfd8afc`.
Editor opens via `https://manage.wix.com/editor/916bf0bd-d8d5-4282-a34a-8aa80bfd8afc`
(the dashboard "Edit Site" button does nothing in the MCP browser — popup is blocked).

## Done and live

- **Homepage copy rewritten** around the two findings from the FreeTour reviews, committed as
  `2a3122a`, pushed, widget rebuilt and served from GitHub Pages. Verified live in the browser.
  - hero: "The Berlin that was here *before the Wall*", opens on "most tours start in 1961"
  - chips: 9.8/10 across **26** reviews · Not the Cold War tour · Small groups by design · In English
  - private-tour intro now says the smallest public groups get the warmest reviews
  - reviews band carries three short anonymised guest quotes
  - bio corrected: ten years in marketing, moved 2023, **first tour start of 2026, three people**
  - free-walk schedule claim removed (days were unverified; booking page is the source of truth)
- **Wix Blog installed.** `/blog` is live and returns 200. No posts yet.
  (The installer modal hangs at 9/10 — it is a UI bug, the install completes. Reload the editor.)
- **Five old CV-site pages deleted**: Portfolio, Contact, CV, CV - CM, CV - GM.
  Wix also auto-removed the **Wix Pro Gallery** app, which only those pages used.
  Site is now: `Yusuf Ucuz` (home) + `Blog` + `Post`.
- Site published after the deletions.

## Open, in priority order

1. **The blog header is broken and this is the urgent one.** `/blog` inherits the site's master
   header, which is still the old CV site: "Joseph Ucuz", with Portfolio / CV / My LinkedIn /
   Download CV (PDF) / Contact / Email Me. Those pages no longer exist, so that menu now points
   at deleted URLs. The homepage is unaffected (Yusuf deleted its header long ago).
   Fix: give the blog pages a header matching the homepage — `Yusuf Ucuz` wordmark → `/`,
   Private tours, Reviews, Free tour, and a `Book a private tour` button → `/#book`.
2. **301 redirects.** Deleted URLs currently return a **soft 404**: HTTP 200 with a 404 page and
   the old `<title>`. `/portfolio`, `/cv` and `/contact` were in the sitemap, so they may be
   indexed. Add redirects to `/` for all five: `/portfolio`, `/cv`, `/contact`, `/cv-cm`, `/cv-gm`.
   Panel: Marketing → SEO & GEO → URL Redirect Manager (`/dashboard/<msid>/seo-home/redirects`).
   I had just opened "New Redirect" when we stopped; nothing was saved.
3. **Four pre-existing redirects are now stale** — they point at the pages we deleted:
   `/blank → /portfolio`, `/blank-1 → /contact`, `/cv-1 → /cv-cm`, `/cv-cm-1 → /cv-gm`.
   Repoint all four to `/`.
4. **Style the blog** to Ink & Ochre: Newsreader (display) + Work Sans (body), paper `#FBF8F1`,
   sand `#F0E7D6`, ink `#1C1A15`, ochre `#B0782A`. BerlinWalk green `#1B5E20` as accent only.
5. **Publish the first post**: draft 03, *What is left of the Wall, and why my tour does not go
   there* — it is the most ready of the ten.
6. **Draft 10 is still blocked** on Yusuf's voice note: which stop he was standing at, who asked,
   the question he could not answer, what he said, and what the group did in the silence.

## Where the writing lives

`content/drafts/` — ten drafts, `README.md` (status table, publication order, pipeline rules)
and `ANSWERS.md` (everything Yusuf confirmed in the interview; the source of truth for facts).
Nine drafts are ready; only 10 is blocked.
