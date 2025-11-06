# Hosting Model: GoDaddy Domain + GitHub Pages Hosting

This project is designed to use GoDaddy for the domain and DNS, while hosting the website content on GitHub Pages. This keeps hosting simple, fast, and free, while letting you manage DNS at GoDaddy.

## TL;DR
- DNS (domain registrar): GoDaddy
- Site hosting: GitHub Pages (repo main branch)
- Custom domain: www.portal-ui.com (CNAME file already present)
- Optional: apex portal-ui.com via A records to GitHub Pages IPs

GitHub Pages serves the entire domain. You generally cannot split hosting by subpath (e.g., serve `/Sites/JackedDnb` from GoDaddy while the root is on GitHub Pages) without a reverse proxy. Use subdomains if you must mix providers.

## Why this model
- Zero server maintenance; CDN-backed static hosting
- Simple deploys by pushing to `main`
- Custom domain + HTTPS managed by GitHub Pages

## DNS on GoDaddy
1. In GoDaddy DNS, set:
   - CNAME `www` → `<your-github-username>.github.io`
   - A records `@` → GitHub Pages IPv4 addresses:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - (Optional) AAAA records for IPv6 (see GitHub docs for current values)
2. In the repo root, keep:
   - `CNAME` file with `www.portal-ui.com`
   - `.nojekyll` to disable Jekyll processing

## Deploying site content
- Primary site files live at the repo root (e.g., `Registration.html`, `css/`, `js/`).
- Deployment is done by pushing to `main`. GitHub Pages builds and serves automatically.

### Subsite: Jacked at /Sites/JackedDnb
- Recommended: Store Jacked content directly in this repository under `Sites/JackedDnb/` (flattened).
- It will be available at:
  - `https://www.portal-ui.com/Sites/JackedDnb/`
- No FTP needed in this model.

## Alternatives if you need GoDaddy hosting too
- By subdomain: Host `jacked.portal-ui.com` on GoDaddy, keep `www.portal-ui.com` on GitHub Pages.
  - DNS: create A/CNAME for `jacked` to your GoDaddy host.
  - Easy, clean separation. Recommended if Jacked requires server-side features.
- By subpath (not recommended): Serve the whole domain from GoDaddy, and proxy most traffic to GitHub Pages except `/Sites/JackedDnb`. Requires reverse proxy/support you may not have on shared hosting.

## Choosing a path
- Pure GitHub Pages (recommended): simplest; Jacked content lives in this repo → push to publish.
- Mixed hosting: use a subdomain for GoDaddy.

## Current repo signals that support this model
- `CNAME` and `.nojekyll` already present at the root
- README includes GitHub Pages instructions

## Action items
- Confirm the desired hosting mode for Jacked:
  - A) Host under the same GitHub Pages site at `/Sites/JackedDnb/`
  - B) Use a subdomain `jacked.portal-ui.com` on GoDaddy
- If A), remove/ignore FTP deploy for Jacked and just commit content to `Sites/JackedDnb`.
- If B), keep the FTP deploy scripts and point DNS for the subdomain to GoDaddy.
