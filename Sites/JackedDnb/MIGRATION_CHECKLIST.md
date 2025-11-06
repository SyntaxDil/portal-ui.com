# JackedDnb Migration Checklist

Use this as a working document during the transition.

## Prep
- [ ] Confirm final URL path for Jacked site (e.g., /Sites/JackedDnb/ or vanity path)
- [ ] Inventory current content, assets, and embeds
- [ ] Define redirects mapping from old URLs to new
- [ ] Placeholder page ready (see index.html)

## Infra
- [ ] Confirm hosting platform and document root for this subpath
- [ ] Apply appropriate server config (Apache .htaccess / IIS web.config / Nginx)
- [ ] Ensure MIME types for fonts, webmanifest

## Deploy
- [ ] Upload placeholder site to correct path
- [ ] Apply redirects according to routing notes
- [ ] Smoke-test on production: 200/404, assets, cache headers

## Verify
- [ ] Test critical pages and forms end-to-end
- [ ] Confirm redirects (301/302) behave as expected
- [ ] Check mobile responsiveness and basic performance

## Rollback plan
- [ ] Have a previous version / redirect-only plan available
- [ ] Document steps to revert if needed
