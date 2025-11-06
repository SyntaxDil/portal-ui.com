# JackedDnb Transition Workspace

This workspace helps manage the transition to hosting the Jacked website under this subfolder of the main site.

## Goals
- Track migration tasks and redirects
- Provide a simple placeholder site for the transition window
- Offer local preview and basic infra samples (IIS/Apache/Nginx)

## Quick start
- Install deps (once): `npm install`
- Start local preview: `npm run dev` then open http://localhost:5173

## Structure
- Root (this folder) – static placeholder pages (index.html, 404.html, assets/)
- `docs/` – migration plan, routing notes, checklists
- `infra/` – sample server configs (IIS web.config, nginx, Apache)
- `scripts/` – PowerShell scripts for local workflows
- `.vscode/` – recommended settings and tasks

## Hosting model (recommended)
We use GoDaddy for the domain and DNS, and host content on GitHub Pages. No FTP needed. Pushing to `main` publishes.

- Public path: `/Sites/JackedDnb/`
- This folder is directly served (no extra `site/` segment).

More details in `../../HOSTING-MODEL.md`. For alternative FTP-based hosting, see `infra/DEPLOYMENT_NOTES.md`.