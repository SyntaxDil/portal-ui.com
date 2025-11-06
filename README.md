![alt text](image.png)# Portal UI Website - GoDaddy Hosting Guide

> Important deployment note (Agent Handover): This project’s live apps are deployed via GitHub Pages (static) and use Firebase for Auth/Firestore. Do NOT use GoDaddy FTP for Temple DJ Spot or Hub. The Ops Agent writes this profile under `apps/{appId}/ops/meta/deployment` and a handover note under `apps/{appId}/ops/meta/handover` so future teammates/agents always see it in the dashboard.

Professional website with Registration landing page, configured for deployment to GoDaddy hosting.

## 🌐 Project Overview

- **Landing Page**: `Registration.html`
- **Technology Stack**: HTML5, CSS3, JavaScript
- **Hosting**: GoDaddy (via FTP deployment)
- **Development Server**: live-server for local testing

## 📁 Project Structure

```
Portal-ui.com/
├── .github/
│   └── copilot-instructions.md    # Copilot configuration
├── css/
│   └── styles.css                 # Main stylesheet
├── js/
│   └── main.js                    # JavaScript functionality
├── images/                        # Image assets
├── .htaccess                      # Apache server configuration
├── .env.example                   # FTP credentials template
├── Registration.html              # Main landing page
├── deploy.js                      # Deployment script
├── package.json                   # Project dependencies
└── README.md                      # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Local Development

Start a local development server:

```bash
npm start
```

This will open your browser at `http://localhost:8080` with the Registration page.

## 🔐 Make Registration Real (Firebase Auth + Firestore)

Turn the static form into a working registration that creates an account and stores a user profile.

### 0) What we added
- `js/auth.js` – handles sign-up with Firebase Authentication and saves profiles to Firestore
- `js/firebase-config.example.js` – copy to `js/firebase-config.js` and fill your Firebase project keys
- `Registration.html` – loads the config and the auth handler scripts

### 1) Create a Firebase project
1. Go to https://console.firebase.google.com → Add project
2. Build → Authentication → Get started → Enable Email/Password
3. Build → Firestore Database → Create database (Start in production mode)
4. Project settings → General → Your apps → Web app → Register app → Copy the config object

### 2) Add your config to the site
Copy the example file and paste your values:

```powershell
copy js\firebase-config.example.js js\firebase-config.js
```

Edit `js/firebase-config.js` and replace placeholders with your Firebase config values.

> Note: These keys are safe to expose on the client. Security is enforced by your Firestore rules and Firebase Auth.

### 3) Secure Firestore
In Firebase console → Firestore → Rules, set:

```
rules_version = '2';
service cloud.firestore {
   match /databases/{database}/documents {
      match /users/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
      }
   }
}
```

Publish rules.

### 4) Test locally
```powershell
npm start
```
Fill the form on `http://localhost:8080/Registration.html` and submit. You should see a new user under Authentication → Users, and a profile document under Firestore → `users/{uid}`.

### 5) Deploy
If you’re using GitHub Pages, push changes to `main`. If hosting on GoDaddy, run:

```powershell
npm run deploy
```

### 6) Optional
- Enable Email Templates → customize verification email
- Add reCAPTCHA (v3) if you observe abuse
- Add a `login.html` later to sign in and render account info

## 🔑 Login, Sign‑out, and Password Reset

We added a full login flow using Firebase Authentication.

What’s included
- `login.html` – login form and an account section shown when signed in
- `js/login.js` – handles sign‑in, sign‑out, password reset, and live auth state

How to use
1. Ensure `js/firebase-config.js` exists (see steps above).
2. Open `/login.html` locally (`npm start`) or on your live site.
3. Enter the email/password you registered with and submit.
4. When signed in, you’ll see your email, verification status, and a sign‑out button.
5. Forgot password? Enter your email in the field and click “Forgot your password?”.

Next steps
- Create a dedicated `account.html` with profile editing and protected content.
- Gate certain sections by auth state via `onAuthStateChanged` (we already use this in `login.js`).

## 👤 Account Page (Profile View/Edit)

We added a basic account page protected by auth.

Included
- `account.html` – requires login; shows email + verification status; profile form for name/phone/service; resend verification; sign out
- `js/account.js` – loads/saves profile in Firestore (`users/{uid}`), protects access, and wires actions

How to use
1. Ensure you’re registered and logged in.
2. Visit `/account.html` directly. If you’re not logged in, you’ll be redirected to `/login.html?redirect=/account.html`.
3. Update your profile fields and click Save Changes.
4. If your email isn’t verified, click Resend verification email.

Registration UX
- After a successful registration, users are redirected to `/account.html` automatically.

### 2.5 Deploy to GitHub Pages (free) with your domain

We’ve added an `index.html` redirect, a `CNAME` file (set to `www.portal-ui.com`) and `.nojekyll` so the site works perfectly on GitHub Pages with a custom domain.

1) Create a GitHub repository and push this project

```bash
# Optional: initialize if not already a git repo
git init
git add .
git commit -m "Initial site"

# Create a new repo on GitHub named portal-ui.com (or any name)
# Then add your remote (replace YOUR-USER and REPO)
git remote add origin https://github.com/YOUR-USER/REPO.git
git branch -M main
git push -u origin main
```

2) Enable Pages
- GitHub → Your Repo → Settings → Pages
- Build and deployment → Source: "Deploy from a branch"
- Branch: `main` and folder `/ (root)`
- Save

3) Set custom domain to `www.portal-ui.com`
- In the same Pages screen, set Custom domain = `www.portal-ui.com`
- Ensure “Enforce HTTPS” is ticked once certificate is issued

4) Set DNS in GoDaddy (portal-ui.com)
- Domains → portal-ui.com → DNS → Manage DNS
- Create/Update:
   - CNAME record `www` → `YOUR-USER.github.io`
   - A records `@` → GitHub Pages IPs (check latest in GitHub docs). Common IPv4:
      - 185.199.108.153
      - 185.199.109.153
      - 185.199.110.153
      - 185.199.111.153
   - (Optional) AAAA records for IPv6 – use the current values from GitHub docs.

Notes
- Your Microsoft 365 email (ed@portal-ui.com) stays intact; don’t modify MX/TXT records.
- Zero-downtime approach: point `www` first, verify the site, then add/update the root `@` A records.

### 3. Configure FTP Credentials

Copy the environment template:

```bash
copy .env.example .env
```

Edit `.env` with your GoDaddy FTP credentials:

```env
FTP_HOST=ftp.yourdomain.com
FTP_USER=your-ftp-username
FTP_PASSWORD=your-ftp-password
FTP_PORT=21
FTP_REMOTE_DIR=/public_html
FTP_LOCAL_DIR=./
```

**⚠️ IMPORTANT**: Never commit `.env` to version control!

### 4. Deploy to GoDaddy

```bash
npm run deploy
```

## 📋 Migration Instructions for GoDaddy

### Step 1: Prepare Your GoDaddy Hosting

1. **Log in to GoDaddy Account**
   - Visit [GoDaddy.com](https://www.godaddy.com)
   - Go to **My Products** → **Web Hosting**

2. **Access cPanel or File Manager**
   - Click **Manage** on your hosting plan
   - Open **cPanel** or **File Manager**

3. **Note Your FTP Credentials**
   - Go to **Files** → **FTP Accounts**
   - Create a new FTP account or use existing credentials
   - Note down:
     - FTP Host (usually `ftp.yourdomain.com`)
     - Username
     - Password
     - Port (usually `21`)

### Step 2: Configure Your Project

1. **Clone or Download This Project**
   ```bash
   git clone <your-repo-url>
   cd Portal-ui.com
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up FTP Credentials**
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` with your GoDaddy FTP details.

### Step 3: Test Locally

```bash
npm start
```

Visit `http://localhost:8080/Registration.html` to verify everything works.

### Step 4: Deploy to GoDaddy

```bash
npm run deploy
```

The deployment script will:
- ✅ Connect to your GoDaddy FTP server
- ✅ Upload all website files to `public_html`
- ✅ Exclude development files (node_modules, .env, etc.)
- ✅ Show progress for each file uploaded

### Step 5: Configure Domain Settings

1. **Set Landing Page**
   - The `.htaccess` file automatically sets `Registration.html` as the default page
   - Your site will load at: `https://yourdomain.com/Registration.html`

2. **Optional: Root Redirect**
   - If you want `https://yourdomain.com` to redirect to the registration page
   - The `.htaccess` file is already configured with `DirectoryIndex Registration.html`

3. **Enable HTTPS (Recommended)**
   - In GoDaddy cPanel, go to **Security** → **SSL/TLS**
   - Install a free SSL certificate (Let's Encrypt)
   - Uncomment HTTPS redirect lines in `.htaccess`:
     ```apache
     RewriteCond %{HTTPS} off
     RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
     ```

### Step 6: Verify Deployment

1. **Check Your Website**
   - Visit `https://yourdomain.com/Registration.html`
   - Or just `https://yourdomain.com` (should auto-load Registration page)

2. **Test All Features**
   - ✅ Form validation
   - ✅ Responsive design on mobile
   - ✅ Navigation links
   - ✅ CSS and JavaScript loading

## 🛠️ Manual Upload (Alternative Method)

If you prefer manual upload instead of automated deployment:

1. **Access File Manager in cPanel**
   - Log in to GoDaddy → My Products → Web Hosting → Manage
   - Click **File Manager**

2. **Navigate to public_html**
   - This is your website's root directory

3. **Upload Files**
   - Click **Upload**
   - Upload all files EXCEPT:
     - `node_modules/`
     - `.env`
     - `deploy.js`
     - `package.json`
     - `package-lock.json`
     - `.git/`

4. **Upload These Files**:
   - ✅ `Registration.html`
   - ✅ `.htaccess`
   - ✅ `css/` folder
   - ✅ `js/` folder
   - ✅ `images/` folder

5. **Set Permissions**
   - Files: `644`
   - Folders: `755`

## 🔧 Configuration Options

### .htaccess Settings

The `.htaccess` file includes:

- ✅ Sets `Registration.html` as default landing page
- ✅ Security headers (XSS protection, clickjacking prevention)
- ✅ Gzip compression for faster loading
- ✅ Browser caching rules
- ✅ Directory browsing disabled
- ✅ Optional HTTPS redirect (commented out)
- ✅ Optional clean URLs (commented out)

### Customization

**Change Landing Page:**
Edit line 5 in `.htaccess`:
```apache
DirectoryIndex YourNewPage.html index.html
```

**Enable Clean URLs:**
Uncomment lines 13-16 in `.htaccess` to remove `.html` extensions from URLs.

## 📦 Development Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start local development server |
| `npm run serve` | Same as npm start |
| `npm run deploy` | Deploy to GoDaddy via FTP |
| `npm run build` | No build needed (static site) |

## 🎨 Customization Guide

### Update Branding

1. **Logo**: Replace "Portal UI" in `Registration.html`
2. **Colors**: Edit CSS variables in `css/styles.css`:
   ```css
   :root {
       --primary-color: #007bff;
       --secondary-color: #6c757d;
       /* ... more colors */
   }
   ```

3. **Favicon**: Add your favicon to `images/favicon.ico`

### Add More Pages

1. Create new HTML file (e.g., `about.html`)
2. Copy structure from `Registration.html`
3. Update navigation links
4. Deploy with `npm run deploy`

## 🔐 Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use HTTPS** - Enable SSL in GoDaddy cPanel
3. **Keep dependencies updated** - Run `npm audit` regularly
4. **Secure form submissions** - Add CSRF protection for production
5. **Back up regularly** - Download backups from GoDaddy regularly

## 📝 Form Handling

The registration form currently submits to `/submit-registration`. You'll need to:

1. **Option A: Server-side Processing**
   - Create a PHP script to handle form submissions
   - Store data in MySQL database
   - Send confirmation emails

2. **Option B: Third-party Service**
   - Use Formspree, Netlify Forms, or similar
   - Update form action in `Registration.html`

3. **Option C: JavaScript POST**
   - Send data to an API endpoint
   - Update `js/main.js` to handle form submission

## 🐛 Troubleshooting

### Files Not Uploading
- ✅ Check FTP credentials in `.env`
- ✅ Verify FTP port (usually 21 for GoDaddy)
- ✅ Ensure `public_html` path is correct
- ✅ Check GoDaddy firewall settings

### Landing Page Not Loading
- ✅ Verify `.htaccess` uploaded to `public_html`
- ✅ Check file permissions (644 for files, 755 for folders)
- ✅ Clear browser cache
- ✅ Check GoDaddy error logs in cPanel

### CSS/JS Not Loading
- ✅ Check file paths in HTML (should be relative)
- ✅ Verify `css/` and `js/` folders uploaded
- ✅ Check browser console for 404 errors
- ✅ Test locally first with `npm start`

### FTP Connection Issues
- ✅ Verify FTP is enabled in GoDaddy hosting plan
- ✅ Try FileZilla for manual testing
- ✅ Check if IP is blocked by firewall
- ✅ Use passive mode (already set in `deploy.js`)

## 📞 Support Resources

- **GoDaddy Help**: [support.godaddy.com](https://support.godaddy.com)
- **cPanel Guide**: [docs.cpanel.net](https://docs.cpanel.net)
- **FTP Help**: [GoDaddy FTP Documentation](https://www.godaddy.com/help/what-is-ftp-319)

## 📄 License

MIT License - Feel free to use and modify for your projects.

## 🎯 Next Steps

1. ✅ Customize content in `Registration.html`
2. ✅ Add your logo and images to `images/` folder
3. ✅ Update colors in `css/styles.css`
4. ✅ Configure form submission handler
5. ✅ Set up SSL certificate in GoDaddy
6. ✅ Deploy with `npm run deploy`
7. ✅ Test at your domain

---

**Need Help?** Check the troubleshooting section or contact GoDaddy support.

**Ready to Deploy?** Run `npm run deploy` and go live! 🚀
