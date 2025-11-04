# GoDaddy Deployment Setup for Customer #683530082

**Account Holder:** Beable  
**Customer Number:** 683530082

## 🎯 Quick Setup Guide

### Step 1: Get Your FTP Credentials from GoDaddy

1. **Log in to GoDaddy**
   - Go to: https://account.godaddy.com/
   - Sign in with your account (Customer #683530082)

2. **Access Your Hosting**
   - Click **"My Products"** at the top
   - Find **"Web Hosting"** section
   - Click **"Manage"** next to your hosting plan

3. **Get FTP Access Details**
   
   **Option A: From cPanel**
   - In your hosting dashboard, click **"cPanel Admin"**
   - Go to **"Files"** section → **"FTP Accounts"**
   - Note your FTP hostname (usually `ftp.yourdomain.com`)
   - Create a new FTP account or use existing credentials
   
   **Option B: From Hosting Dashboard**
   - Look for **"FTP"** or **"File Manager"** section
   - Click **"Manage FTP Accounts"**
   - Your FTP host will be shown (format: `ftp.yourdomain.com` or `yourdomain.com`)

4. **Information You Need:**
   ```
   FTP Host: ___________________ (e.g., ftp.yourdomain.com)
   Username: ___________________ (your FTP username)
   Password: ___________________ (your FTP password)
   Port: 21 (standard FTP port)
   Remote Directory: /public_html
   ```

### Step 2: Configure Your .env File

1. **Copy the template:**
   ```bash
   copy .env.example .env
   ```

2. **Edit .env with your details:**
   ```env
   # Replace these with YOUR actual GoDaddy credentials
   FTP_HOST=ftp.yourdomain.com
   FTP_USER=your-ftp-username
   FTP_PASSWORD=your-ftp-password
   FTP_PORT=21
   FTP_REMOTE_DIR=/public_html
   FTP_LOCAL_DIR=./
   ```

   **Example (fill in your actual values):**
   ```env
   FTP_HOST=ftp.beable.com
   FTP_USER=beable@beable.com
   FTP_PASSWORD=YourSecurePassword123!
   FTP_PORT=21
   FTP_REMOTE_DIR=/public_html
   FTP_LOCAL_DIR=./
   ```

### Step 3: Deploy Your Website

Once your `.env` is configured:

```bash
npm run deploy
```

Your Registration.html will be live at:
- **https://yourdomain.com/Registration.html**
- **https://yourdomain.com** (auto-redirects to Registration page)

---

## 🔍 Finding Your Domain Name

If you don't know your domain name:

1. Go to https://account.godaddy.com/
2. Click **"My Products"**
3. Look under **"Domains"** section
4. Your domain will be listed there (e.g., `yourdomain.com`)

---

## 📋 Two Deployment Methods

### Method 1: Automated FTP (Recommended)

✅ **Pros:** Fast, automated, repeatable  
✅ **Use:** `npm run deploy` after configuring `.env`

This is what we set up for you!

### Method 2: Manual File Manager

If you prefer manual upload or FTP isn't working:

1. Log in to GoDaddy → My Products → Web Hosting → Manage
2. Click **"File Manager"** in cPanel
3. Navigate to **`public_html`** folder
4. Click **"Upload"** button
5. Upload these files:
   - ✅ `Registration.html`
   - ✅ `.htaccess`
   - ✅ `css/` folder (entire folder)
   - ✅ `js/` folder (entire folder)
   - ✅ `images/` folder (entire folder)
6. Set permissions:
   - Files: 644
   - Folders: 755

---

## 🔐 Security Checklist

- [ ] Never commit `.env` to Git (already in `.gitignore`)
- [ ] Use a strong FTP password
- [ ] Enable SSL certificate in GoDaddy (free with most plans)
- [ ] After SSL is enabled, uncomment HTTPS redirect in `.htaccess`

---

## 🆘 Troubleshooting

### Can't Find FTP Settings?

**Solution 1:** Contact GoDaddy Support
- Phone: Check your GoDaddy dashboard for support number
- Live Chat: Available in your account dashboard
- Tell them: "I need FTP credentials for my hosting account #683530082"

**Solution 2:** Check Welcome Email
- GoDaddy sends FTP credentials when hosting is first set up
- Search your email for "GoDaddy" + "FTP" or "hosting setup"

### FTP Connection Failed?

1. Verify credentials are correct in `.env`
2. Make sure you're using the correct FTP host (check GoDaddy dashboard)
3. Try port 21 (standard) or 22 (SFTP)
4. Check if GoDaddy hosting is active (might need activation)

### Website Not Showing?

1. Check if files uploaded to `/public_html` (not a subfolder)
2. Verify `.htaccess` file uploaded successfully
3. Clear your browser cache
4. Wait 5-10 minutes for DNS propagation

---

## 📞 GoDaddy Support

- **Help Center:** https://www.godaddy.com/en/help
- **Account:** https://account.godaddy.com/
- **Customer #:** 683530082
- **Support:** Available in your account dashboard (click "Help" or "Contact Us")

---

## ✅ Deployment Checklist

- [ ] Log in to GoDaddy account
- [ ] Find your hosting plan and domain name
- [ ] Get FTP credentials from cPanel or hosting dashboard
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in FTP credentials in `.env`
- [ ] Test locally: `npm start` (currently running!)
- [ ] Deploy: `npm run deploy`
- [ ] Visit your domain to verify
- [ ] Enable SSL in GoDaddy cPanel
- [ ] Celebrate! 🎉

---

## 🌐 Your Site is Currently Running Locally

**URL:** http://127.0.0.1:51216/Registration.html

You can see and test your site right now in your browser!

Once you deploy to GoDaddy, it will be at:
**https://yourdomain.com/Registration.html**

---

**Ready to deploy?**

1. Get your FTP credentials from GoDaddy
2. Configure `.env` file
3. Run: `npm run deploy`

Good luck! 🚀
