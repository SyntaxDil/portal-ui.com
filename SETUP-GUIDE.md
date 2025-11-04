# Quick Setup Guide - Portal UI Website

## ✅ Workspace Created Successfully!

Your website is ready to build, test, and deploy to GoDaddy.

## 📂 What Was Created

```
✅ Registration.html        - Your landing page with responsive form
✅ css/styles.css          - Professional styling with CSS variables
✅ js/main.js              - Form validation and interactivity
✅ .htaccess               - GoDaddy server configuration
✅ deploy.js               - Automated FTP deployment script
✅ package.json            - Development tools and scripts
✅ .env.example            - FTP credentials template
✅ README.md               - Complete documentation
✅ .gitignore              - Version control exclusions
```

## 🚀 Next Steps

### 1. Test Locally (RIGHT NOW)

```bash
npm start
```

This opens your Registration page at http://localhost:8080

### 2. Configure GoDaddy FTP

**Get Your Credentials:**
1. Log in to [GoDaddy Account](https://www.godaddy.com)
2. Go to **My Products** → **Web Hosting** → **Manage**
3. Find **FTP** settings in cPanel

**Set Up Deployment:**
```bash
copy .env.example .env
```

Edit `.env` with your GoDaddy FTP details:
```env
FTP_HOST=ftp.yourdomain.com
FTP_USER=your-username
FTP_PASSWORD=your-password
FTP_REMOTE_DIR=/public_html
```

### 3. Deploy to GoDaddy

```bash
npm run deploy
```

Your site goes live at: **https://yourdomain.com/Registration.html**

## 🎨 Customize Your Site

### Change Colors
Edit `css/styles.css` (lines 6-15):
```css
:root {
    --primary-color: #007bff;  /* Change this */
    --secondary-color: #6c757d;
    /* ... more colors */
}
```

### Update Content
Edit `Registration.html`:
- Line 30: Change "Portal UI" logo text
- Lines 47-49: Update hero section
- Lines 54-145: Customize registration form

### Add Your Logo
1. Add logo image to `images/` folder
2. Update line 30 in `Registration.html`

## 📋 GoDaddy Migration Checklist

- [ ] Install dependencies: `npm install` ✅ DONE
- [ ] Test locally: `npm start`
- [ ] Get GoDaddy FTP credentials
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in FTP credentials in `.env`
- [ ] Customize branding and content
- [ ] Deploy: `npm run deploy`
- [ ] Visit your domain to verify
- [ ] Enable SSL in GoDaddy cPanel (optional)

## 🔐 Important Security Notes

⚠️ **NEVER commit `.env` to version control** - it contains passwords!
⚠️ **Enable HTTPS** - Uncomment lines in `.htaccess` after SSL setup
⚠️ **Back up regularly** - Download backups from GoDaddy

## 📖 Full Documentation

See **README.md** for:
- Complete migration instructions
- Troubleshooting guide
- Manual upload method
- Form handling options
- Security best practices

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Test locally at localhost:8080 |
| `npm run deploy` | Upload to GoDaddy via FTP |

## ❓ Need Help?

1. **Check README.md** - Comprehensive guide with troubleshooting
2. **GoDaddy Support** - [support.godaddy.com](https://support.godaddy.com)
3. **Test Locally First** - Run `npm start` before deploying

---

## 🎯 Right Now: Test Your Site

```bash
npm start
```

This will open your browser with the Registration page!

**Your landing page will be at:** `/Registration.html`

Enjoy building your website! 🚀
