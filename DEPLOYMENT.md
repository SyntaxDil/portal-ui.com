# Deployment Guide - Portal UI

## Current Deployment Method: GitHub Pages

The Portal UI website is deployed using **GitHub Pages** with a custom domain, not GoDaddy FTP.

### ✅ Already Configured

- **Repository**: `SyntaxDil/portal-ui.com`
- **Branch**: `main` (auto-deploys)
- **Custom Domain**: `www.portal-ui.com`
- **HTTPS**: Enabled automatically
- **DNS**: Already configured in domain registrar

### 🚀 How to Deploy Changes

1. **Make your changes** to any files
2. **Commit and push** to the main branch:

```bash
git add .
git commit -m "Description of your changes"
git push origin main
```

3. **Wait 1-2 minutes** for GitHub Pages to rebuild
4. **Visit**: https://www.portal-ui.com

### 📋 Key Files for GitHub Pages

- **`CNAME`**: Points to `www.portal-ui.com`
- **`.nojekyll`**: Bypasses Jekyll processing
- **`index.html`**: Redirects root domain to `Registration.html`

### 🔧 GitHub Pages Settings

In the repository settings:
- **Source**: Deploy from a branch
- **Branch**: `main` / `/ (root)`
- **Custom domain**: `www.portal-ui.com`
- **Enforce HTTPS**: ✅ Enabled

### 🌐 Domain Configuration

The domain `portal-ui.com` should have these DNS records:

```
Type    Name    Value
CNAME   www     syntaxdil.github.io
A       @       185.199.108.153
A       @       185.199.109.153  
A       @       185.199.110.153
A       @       185.199.111.153
```

### 🚫 What NOT to Use

- ~~`npm run deploy`~~ (This is for legacy FTP deployment)
- ~~GoDaddy FTP credentials~~ (Not used)
- ~~`.env` file~~ (Not needed for GitHub Pages)

### ✅ Testing Before Deploy

Always test locally first:

```bash
npm start
```

Then visit `http://localhost:8080` to verify changes work correctly.

### 🎯 Sites Structure

The main portal hosts several sub-sites:

- **Main Portal**: `/` (redirects to Registration.html)
- **JackedDnb**: `/Sites/JackedDnb/`
- **SoundWave**: `/Sites/soundwave---a-crowd-sourced-artist-platform/`
- **TempleDjSpot**: `/Sites/TempleDjSpot/`
- **Temple DJs**: `/Spaces/TempleDjs/`

All of these deploy together when you push to main.

---

**Remember**: This is a static site deployment. Changes to Firebase configuration or database don't require redeployment - they take effect immediately.