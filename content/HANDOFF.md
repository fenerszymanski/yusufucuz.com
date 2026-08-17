# Where we stopped — blog typography, mid-job

**Nothing here is live.** The editor autosaves, but the site has not been published since the
redirect work, so yusufucuz.com is unchanged. Publishing is what makes any of the below real.

## Done

- **Newsreader is uploaded to Wix.** Not in Wix's library, so I instanced the official
  variable fonts at `opsz=16` into five static cuts (400/500/600 + italic 400/500) and fixed
  their name tables. Files, licence and the how/why are in `assets/fonts/` — keep them, the
  scratchpad copies are gone.
- **Site theme font is now Work Sans**, which is the brand body face. This only affects the
  blog: the homepage is a custom element carrying its own CSS.

## Next, in order

1. **Finish the font cleanup.** The *first* upload round produced five badly-named files
   (all showing "Newsreader 16 Pt Regular"). I deleted one; **four remain**. Delete them in
   Site Styles → Typography → font dropdown → Upload fonts → trash icon, then upload the five
   correct files from `assets/fonts/`. They should then appear as one Newsreader family with
   Regular / Medium / SemiBold / Italic / Medium Italic.
2. **Set Heading 1–6 to Newsreader.** Site Styles → Typography → pencil icon on each heading →
   Font. Paragraph 1–3 stay Work Sans. I had the Heading 1 panel open when we stopped.
3. **Colours.** Site Styles → Colors, to the Ink & Ochre palette:
   paper `#FBF8F1`, sand `#F0E7D6`, line `#E4DBC9`, muted `#6B6357`, ink `#1C1A15`,
   ochre `#B0782A`. BerlinWalk green `#1B5E20` as an accent only, never the main colour.
4. **Turn off the underline on the blog wordmark** — it is default link styling.
5. **Publish**, then check `/blog` live.
6. Then posts: Codex is finding images; publication order is in `content/drafts/README.md`
   (01 first). The Wix Blog API is confirmed working as a route — see the section below.

---

# Earlier — 2026-08-17 (second session)

## Done since the first handoff

- **The blog header is fixed and live.** The old CV-site header is gone from `/blog`:
  the wordmark now reads **Yusuf Ucuz** and links to the homepage, and both old menus
  (Portfolio/CV/Contact had already been auto-removed with their pages; I deleted the
  remaining *My LinkedIn*, *Download CV (PDF)* and *Email Me*). Published and verified live.
  Note: the strings still appear in the page source as leftover menu *data*; nothing renders.
- **All nine redirects fixed and verified live.** The panel *does* work through the browser —
  the fix was clicking the Save button by element reference rather than by screen coordinate;
  coordinate clicks were silently landing on nothing (no network request fired at all).
  Once clicked correctly, each save is a real `POST …/redirector-server/v1/redirect` → 200.
  Live-checked with `curl -L` on all nine: `/portfolio`, `/cv`, `/contact`, `/cv-cm`, `/cv-gm`,
  `/blank`, `/blank-1`, `/cv-1`, `/cv-cm-1` — every one now resolves to `https://www.yusufucuz.com/`.
  One near-miss worth knowing about: the New URL field is an autocomplete combobox, and if you
  set it then click Save while its suggestion dropdown is still open, the click can land on a
  suggestion instead — silently swapping your typed value for an unrelated page. Always click
  elsewhere to close the dropdown and re-read the field before saving.
- Wix Blog REST API confirmed working for this site (`www.wixapis.com/blog/v3/...` with the
  existing `berlinwalk-wix-api-key` + `wix-site-id: 916bf0bd-…`) — `GET /blog/v3/posts` returns
  200. Draft-post creation not yet attempted; see Open item 3.

## Still open

1. **Blog styling** is still stock Wix, not Ink & Ochre. The wordmark also renders underlined,
   which is just default link styling and should be turned off.
2. **First post** not published yet. Publication order per `content/drafts/README.md` (now
   updated by Yusuf's own pass): **01, 03, 02, 05, 07, 06, 04, 09, 08, 10.**
3. **Publishing route undecided: Wix Blog API vs. the Studio editor's blog UI.** The API works
   (see above) and would let posts be created straight from the markdown drafts — worth trying
   for post 01 next: `POST /blog/v3/draft-posts` (needs a `memberId` — check Yusuf's site
   collaborator/member ID first), then `POST /blog/v3/draft-posts/{id}/publish`. Fall back to
   the editor's blog UI if the API path has a snag (e.g. rich-content format for the post body).
4. Draft 10 still needs Yusuf's voice note.

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
5. **Publish the first post**: draft 01, *Why I left marketing to walk people around Berlin*.
   Follow it with draft 03, which establishes the tour's clearest difference.
6. **Draft 10 is still blocked** on Yusuf's voice note: which stop he was standing at, who asked,
   the question he could not answer, what he said, and what the group did in the silence.

## Where the writing lives

`content/drafts/` — ten drafts, `README.md` (status table, publication order, pipeline rules)
and `ANSWERS.md` (everything Yusuf confirmed in the interview; the source of truth for facts).
Nine drafts are ready; only 10 is blocked.
