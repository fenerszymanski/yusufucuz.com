# Where we stopped — 5 posts live, header and footer standardised, footer fixed on mobile

## Done

- **Typography and colour finished and published** — Newsreader headings, Work Sans body, all
  8 Ink & Ochre colours, italic Newsreader wordmark with no underline. Verified live.
- **5 posts published via the Wix Blog API**: 03, 04, 06, 07, 09 — the ones Codex found a
  cover image for. Covers were Codex's candidates (5/10), resized to 1000px/q62 and pushed to
  this repo (`assets/blog-covers/upload-optimized/`) so the Wix API could import them by URL —
  see "How the posts were actually published" below for the full method, it's not obvious.
  Categories created (Guest asked me, Opinion, Field notes, Craft) and assigned per post.
  Every `(#book)` link in the drafts was rewritten to `(/#book)` before publishing — a bare
  `#book` only works on the homepage itself; from a `/post/...` page it does nothing.
  Live and verified, content and formatting checked directly on the published pages:
  - yusufucuz.com/post/what-is-left-of-the-wall (03)
  - yusufucuz.com/post/skip-the-tower (04)
  - yusufucuz.com/post/the-twenty-minutes-before-a-tour (06)
  - yusufucuz.com/post/berlin-is-ugly (07)
  - yusufucuz.com/post/finding-the-photograph (09)
  - `/blog` list view: took a few reloads to populate (pro-gallery client-side layout, not a
    data problem — the posts were correct in the API and on their own pages the whole time).
    If it ever looks empty again after a publish, it's almost certainly this, not broken data.

## Header and footer, now standardised (both live)

**Footer** was still the old CV site's: Home · CV · Portfolio · My LinkedIn · Email Me ·
Contact. Rebuilt in place — same six buttons, new labels and links:
**Home · Blog · Private tours | Free tour · Email · Instagram**. Two things surfaced doing it:
the *Home* button had no page set at all (an empty "Page" selection, so it only worked via the
redirect), and *Email Me* pointed at the old personal gmail. Both corrected.

**Header** only had the wordmark, so a reader on a post had no route to the tour. Rather than
rebuild the homepage's header by hand in Wix — a second copy to keep in sync — the homepage's
own `<nav>` is now emitted as a second custom element, `<yu-nav>` (`scripts/build-nav.py` →
`widget/yu-nav-element.js`), and dropped into the Wix header section. One source of truth:
edit the nav in `index.html`, rerun both build scripts, and homepage + blog change together.

Three things about that are worth knowing before touching it again:

- **Wix mounts the tag `<wix-default-custom-element>`** and gives no way to rename it, so the
  script registers under that name as well. This also means **only one script can own the
  tag per page** — two custom-element files would race and the loser would render the
  winner's markup. Hence one file, `widget/yu-parts-element.js`, shipping both the nav and
  the footer and choosing between them by `data-part` or by whether it sits inside the site
  footer (`scripts/build-parts.py`).
- **Scope the CSS on a class, not the tag.** Keyed to `yu-nav` it matched nothing and the nav
  rendered as unstyled blue links. It now wraps the markup in `.yu-part` and scopes to that.
- **The editor canvas and Preview both lie here** — the canvas does not run the element, and
  Preview serves a cached copy of the script. The published page was the only honest check.

The old wordmark (`text49`) is hidden, not deleted, in case the element ever needs backing out.

**Anchor landing fixed too.** `/#book` from a post used to dump you at the top of the homepage:
the browser makes its jump before the custom element has rendered, so there is nothing to jump
to. Both builds now watch for the target and hold the position while images above it load,
releasing as soon as the visitor scrolls. This is what makes the header's four nav links, the
footer's *Private tours*, and every post's closing CTA actually land. Note that
`build-widget.py` does **not** copy `index.html`'s `<script>` — it carries its own copy of the
nav behaviour, so a fix in one is not a fix in the other.

## The footer at mobile — fixed

The old footer was Wix's six absolutely positioned pills, which shrink instead of reflowing:
at 390px, **"Private tours" rendered as "Private t…" and "Instagram" as "Instagr…"**, across
two ragged rows. `<yu-part>` (the same nav+footer element already live in the header) is now
wired into the Footer section too, so the blog footer is the homepage's real footer — three
clean lines, no truncation, verified with a 390px `<iframe>` on the live published page:

> **Yusuf Ucuz** · Private tour guide, Berlin
> info@yusufucuz.com · @berlinwalkingtour
> berlinwalk.com

Two traps, both worth knowing before touching this again:

- **Wix drops a newly added element into whatever content section it feels like** (here,
  the blog-listing section) regardless of which section is selected — layer-panel drag and
  cut/paste both failed to move it afterward. The fix: right-click *inside* the target
  section on the canvas → **Quick Add → Container**. That command is scoped to the section
  you clicked, unlike the left-panel "+", so the container lands where you clicked. Then,
  with that container selected, the left-panel "+" → Custom Element nests correctly inside
  it — the Add panel evidently uses "currently selected container" as the drop target, but
  only takes a section as a hint, not an instruction.
- **"Scale proportionally" (the default responsive mode for a hand-placed container) does
  not preserve the X you type.** It looked right in the editor (X 0, W 1280) and still broke
  on the live site — the container rendered ~1000px off-screen to the left, because that
  mode recomputes position from an internal anchor tied to where the element was *first*
  dropped, not the literal field value. Fixed by switching the container's Responsive
  behavior to **Stretch** (docks both edges, no stored X to drift) and the custom element
  inside it to **Relative width**, matching what the header's element already used. If a
  custom element or container ever renders correctly in the editor but shifted or missing
  on the live site, check this setting before anything else — the editor canvas will not
  show you the bug.

The structure is now `Footer #section2 > box4 (Container, Stretch) > customElement3`,
same `yu-parts-element.js` source as the header. The old six-pill container (`box3`) is
hidden, not deleted.

## Next, in order

1. Posts 01, 02, 05, 08, 10 still need cover images — Codex only found 5/10. `content/drafts/
   README.md` has the current status per post. Once images exist, the publishing method below
   is already proven and fast (no more editor UI needed).
2. Post 10 is still blocked on Yusuf's voice note.

## How the posts were actually published

Not the Studio editor UI — the Wix Blog REST API, end to end. Worth recording because two
parts of it were not obvious:

- **Images**: `UploadImageToWixSite` takes a local file as base64, but base64-encoding these
  images blew past hundreds of thousands of tokens for a single ~150KB file — unusable. The
  browser-upload path (`file_upload` on Wix's Media Manager) turned out to target the wrong
  input; the real one lives inside the `mediaGalleryFrame` iframe, not reachable through
  `read_page`/`find`. What worked: push the (resized, optimized) images to this GitHub repo,
  then pass the raw.githubusercontent.com URLs to `UploadImageToWixSite`'s `imageUrls` param.
  Only did this with Yusuf's explicit go-ahead, scoped to just the 5 image files.
- **Body content**: the Ricos Converter Service (`POST /ricos/v1/ricos-document/convert/
  to-ricos`) turns Markdown straight into valid Ricos JSON — headings, bold, italic, links,
  nested bold+italic (book titles) all came out right. Far less error-prone than hand-authoring
  the Ricos node tree.
- **Everything else**: `POST /blog/v3/bulk/draft-posts/create` with `publish:false` first, so
  the drafts could be opened and visually checked in the dashboard before going live, then
  `POST /blog/v3/draft-posts/{id}/publish` per post once confirmed.

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
