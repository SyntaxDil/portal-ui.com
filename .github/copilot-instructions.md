# Website Project - Copilot Instructions

## Project Overview
This is a professional website project configured for deployment to GoDaddy hosting.
- Main landing page: Registration.html
- Static website with HTML/CSS/JavaScript
- FTP deployment to GoDaddy

## Project Structure
- `/` - Root directory (maps to public_html on GoDaddy)
- `/css/` - Stylesheets
- `/js/` - JavaScript files
- `/images/` - Image assets
- `Registration.html` - Main landing page
- `.htaccess` - Server configuration for routing

## Development Guidelines
- Keep code clean and well-commented
- Use responsive design principles
- Optimize images before deployment
- Test locally before deploying to production
- Follow modern web standards

## Deployment
- Use `npm run deploy` to upload via FTP to GoDaddy
- Ensure .env file has correct FTP credentials
- Test at yourdomain.com/Registration.html after deployment
