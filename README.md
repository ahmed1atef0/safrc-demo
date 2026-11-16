# safrc-demo-githubpages

**St. Albert Family Resource Centre — redesign demo** (static multi-page site, built for GitHub Pages).

A full demo of the SAFRC website rebuilt in the new "Growing Strong Together" design system, based on the reference home page. 32 pages, every original image asset included.

## Features

- **32 pages** — home, About (7), Programs (8), Family Support Services (7), Events & Fundraisers (4), Get Involved (4), Information (3)
- **Dark / light mode that sticks on every page** — the choice is written to layered storage (localStorage + a real cookie + sessionStorage + `window.name`) and re-applied on *every* page before first paint, so it survives on GitHub Pages, localhost, and even pages opened straight from disk (`file://`) or in browsers with storage blocked. Open tabs sync with each other too.
- **Cookie consent, once per browser** — accepted on one page, gone from every page (same layered storage)
- **Land Acknowledgment remembers its state** — expanded on one page, expanded everywhere on the next visit
- **Refreshing keeps your place on the page** — natural scroll restoration (no more jump back to the top)
- **Header tells you where you are** — on a sub-page, both its nav link and its parent tab light up (with `aria-current`), the breadcrumb shows the path, and the mobile drawer opens pre-scrolled to the current section
- **Announcement bar with a real campaign window** — "Winter Registration opens December 2nd at 7am" shows on every page **while its window is open** (see the `safrc-ann` meta tag), runs a live countdown, flips to "registration open" on Dec 2, and disappears after the window ends. Closing it hides it **everywhere**; 30 minutes later it quietly comes back
- **"Ready to join us?" and "Join Our Newsletter!" are boxed cards** — rounded, bordered boxes that gently follow the cursor (with a CSS lift fallback when motion is reduced)
- **Contact page rebuilt** — four info cards (visit / call / email / hours), a full message form with validation + success state, and an embedded Google Map with Get directions / Open in Google Maps buttons
- **All original PNG assets** from the original site export are included in `assets/img/` (nothing dropped), plus all needed photos downloaded locally — no dependency on the old CDN
- Announcement bar, dropdown navigation, mobile drawer, Instagram marquee + lightbox (home), scroll reveals (GSAP), animated counters, accessible skip link / focus states / reduced-motion support
- The updated footer (with funders, contact info and the collapsible Land Acknowledgment) is identical on every page

## Round-3 review fixes (this release)

- **"Home / …" breadcrumbs removed** from every page hero; the repeated boilerplate sub-text rewritten clean and page-specific
- **Reflection sweeps + idle floating** added across the site: info cards, VMV cards, CTA boxes, mini stats, contact cards, form, map card, badges, logo tiles — the light glides under your cursor, elements gently float
- **Program stream one** (Who We Are) — the four categories are now colored link-boxes (mint / sun / orange / red), each tuned for light *and* dark mode; **stream two** uses the age/free badge chips and links to each service
- **Our History** — "through the years" now a two-photo band (1982 roots + today's families) with floating caption chips and stat counters
- **Resources page** — items sit side by side in a wrapping card grid (no more single stacked list)
- **Subsidy note** on program registration got breathing room (all alert boxes did)
- **"And so much more"** (Early Childhood) is a big floating badge you can click; **"Ready to join in?"** guide CTA box on the Youth page follows the same box pattern as "Ready to join us?"
- **Calendar / Play Day / Hearts & Hashbrowns / Employment / Skip the Depot** — photos beside text, partners & sponsor logos side by side, job posting beside an "How to apply" panel, and a full new Skip-the-Depot section (3 easy steps)
- **Testimonials** — the photo cards float, lift with the cursor, and clicking one opens it full-size in a lightbox (arrows / Esc supported)
- **Contact** — a "Find us" address badge (pin + address + Open in Maps pill) above the map; cards, form and map all float and reflect
- FRN page chips centered; "View details / View programs" links drift with an underline grow; chips got hover lift + cursor-follow everywhere

## Structure

```
index.html               Home page (from the reference design)
*.html                   All other pages (flat, relative links)
assets/css/style.css     Shared design system (reference styles + page components)
assets/js/main.js        Shared behaviour (theme, cookies, nav, animations)
assets/img/              All images (original PNGs + local copies of CDN photos)
assets/favicon.ico
.nojekyll                Tells GitHub Pages to serve files as-is
```

## Run locally

Any static server works, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Deploy to GitHub Pages

In this folder:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Ahmed1Atef010/safrc-demo-githubpages.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → main / (root)** — the site goes live at `https://ahmed1atef010.github.io/safrc-demo-githubpages/`.

Notes:

- Fonts and the GSAP animation library load from CDNs (Google Fonts, jsDelivr), so the animated version needs internet; without them the site still renders and works (built-in fallbacks).
- Storage keys used (all namespaced `safrc-` and mirrored across localStorage + cookie + sessionStorage + `window.name`): `safrc-theme`, `safrc-cookie-consent`, `safrc-land`, `safrc-topbar` (announcement dismissal timestamp).
- **Announcement window** is configured in the `<meta name="safrc-ann" content="start=…; opens=…; until=…">` tag in every page head. Current window: visible from Nov 1 2026, registration opens Dec 2 2026 07:00 (MST), window ends Dec 16 2026. Edit that one meta (all pages) to change the campaign.
- **Favicon unified with the header logo** — `assets/favicon.ico` and `assets/img/safrc-emblem.png` are generated from the same emblem the header brand uses (the old green-heart favicon is gone). Every page links both.
- **Header height is measured, not guessed** — `main.js` publishes the real `.site-top` height as `--site-top-h` (ResizeObserver), and hero / page-hero padding derives from it, so the "since 1982" badge and hero copy always sit below the fixed header on every phone.
- **Assets note:** every one of the 42 PNG files from the original site export is included (verified file-by-file by content). 34 of them actually contained WebP data under a `.png` name (a Squarespace export quirk) — they are stored with corrected `.webp` extensions so all browsers render them properly; the 8 true PNGs keep `.png`. See `assets/img/manifest.json` for the full inventory.
- Demo purpose only — registration links point to the real Wild Apricot member site; nothing is invented. The contact form and newsletter form are front-end demos (no backend), and the map is the standard keyless Google Maps embed.
