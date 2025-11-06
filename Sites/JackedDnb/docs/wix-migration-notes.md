# Wix → Static Migration Notes

Wix does not provide a full site export of templates/apps. Options to migrate:

1) Rebuild static pages
- Best for performance and control.
- Extract text/media, recreate layout with HTML/CSS, and replace dynamic Wix apps with static or self‑hosted alternatives.

2) Static snapshot (crawler)
- Use a website copier (e.g., `wget`, `HTTrack`) to snapshot public pages.
- Pros: fast initial copy. Cons: dynamic widgets/forms won’t work, code may be heavy/minified, and ToS may apply.

3) Proxy/redirect
- Keep Wix live and redirect or proxy the path. On shared hosting, full reverse proxy may be limited; simple redirects are easy.

Recommended path: 1) Rebuild static pages, using the placeholder site here as the base. Use `docs/content-inventory.md` and `docs/url-mapping.csv` to plan.

## What we need
- Public (published) Wix URL (not the editor link)
- List of key pages (Home, About, Events, Media, Contact, etc.)
- Brand assets (logo SVG/PNG, color palette, fonts)

## Implementation notes
- Keep URLs lowercase and hyphenated, no spaces.
- Place assets under `site/assets/` and reference with relative paths.
- Test on mobile for responsive layout.
- Add SEO meta tags and open graph as needed.
