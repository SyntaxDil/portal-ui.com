# portal-ui.com
portal-ui.com Website

## GitHub Pages Setup

This repository is configured to be hosted on GitHub Pages with a custom domain (www.portal-ui.com).

### Deployment

The site is deployed from the `main` branch root directory and served over HTTPS.

### DNS Configuration

To point your custom domain to GitHub Pages, configure the following DNS records with your domain registrar:

1. **CNAME Record:**
   - Type: `CNAME`
   - Name: `www`
   - Value: `SyntaxDil.github.io`

2. **A Records (for apex domain):**
   - Type: `A`
   - Name: `@`
   - Values (add all four):
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`

### GitHub Pages Settings

1. Go to the repository Settings → Pages
2. Set Source to "Deploy from a branch"
3. Select branch: `main`
4. Select folder: `/ (root)`
5. Custom domain: `www.portal-ui.com`
6. Enable "Enforce HTTPS"

DNS propagation may take up to 24-48 hours. GitHub will automatically provision an SSL certificate for HTTPS once DNS is properly configured.
