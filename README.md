# SAFRC — Demo Site

A demo rebuild of the St. Albert Family Resource Centre website: a full 32-page static site with a modern, warm design system. **Demo only.**

## Open the site

**Live:** https://ahmed1atef0.github.io/safrc-demo/

Locally, open `index.html` in a browser — or serve the folder:

```bash
python -m http.server 8000
# http://localhost:8000/
```

## What it is

- **32 pages** — home, about, programs, family support, events, get involved, information
- **One modern theme everywhere** — the "Growing Strong Together" design system (mint / sun / orange palette, rounded cards, soft shadows)
- **Dark / light mode** that persists across every page
- **Real interactions** — sticky header with dropdowns and mobile drawer, scroll reveals, counters, lightboxes, form validation
- **No build step, no dependencies** — plain HTML, CSS and JavaScript, ready for GitHub Pages

## Performance

- Static files only — no framework, no bundler, no server code
- All images are local, so pages don't wait on an external CDN
- Animations respect `prefers-reduced-motion`
- `.nojekyll` lets GitHub Pages serve the files exactly as-is
