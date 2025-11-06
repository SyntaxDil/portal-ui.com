# Deployment Notes

This subfolder is part of the main site hosted on GoDaddy. Options to deploy:

1) Upload `site/` content via FTP into the corresponding folder under `public_html/Sites/JackedDnb/` (or equivalent on your host).
2) If using the root-level automation (`deploy.js`), extend it to include this subpath.

Checklist:
- Ensure `.htaccess`/`web.config` are placed where the server reads them
- Verify correct base URLs for assets
- Test 200/404 responses and redirects
