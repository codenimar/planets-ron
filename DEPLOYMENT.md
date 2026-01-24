# Deployment Guide

This guide explains how to deploy the Planets-Ron application with PHP backend and React frontend.

## Architecture

The application follows a **client-server architecture**:
- **Frontend**: React application (runs in the browser)
- **Backend**: PHP API server (handles authentication and sessions)

```
┌─────────────────────┐
│   React Frontend    │
│   (Browser/SPA)     │
│   Port: 3000 (dev)  │
└──────────┬──────────┘
           │ HTTP/HTTPS
           │ API Calls
           ▼
┌─────────────────────┐
│   PHP Backend API   │
│   (Server-Side)     │
│   Port: 8888 (dev)  │
│   Port: 80/443 (prod)│
└─────────────────────┘
```

## Development Setup

### Prerequisites
- Node.js 16+ and npm
- PHP 7.4+ (PHP 8.x recommended)
- Web server (Apache/Nginx) or PHP built-in server

### Step 1: Install Dependencies

```bash
# Install Node.js dependencies
npm install
```

### Step 2: Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env if needed
# Default values work for local development
```

### Step 3: Start the PHP Backend

Choose one of the following options:

#### Option A: PHP Built-in Server (Recommended for Development)
```bash
cd api
php -S localhost:8888
```

#### Option B: Using XAMPP/WAMP/MAMP
1. Copy the entire project to your web server's document root
2. The API will be available at `http://localhost/planets-ron/api/`
3. Update proxy in package.json accordingly

#### Option C: Using Docker (if you have Docker)
```bash
# In the api directory
docker run -p 8888:80 -v $(pwd):/var/www/html php:8-apache
```

### Step 4: Start the React Development Server

In a new terminal:
```bash
npm start
```

The React app will open at `http://localhost:3000`

### How It Works in Development

1. React dev server runs on port 3000
2. PHP backend runs on port 8888
3. `package.json` has proxy configuration: `"proxy": "http://localhost:8888"`
4. API calls like `/api/login.php` are automatically proxied to `http://localhost:8888/api/login.php`

## Production Deployment

### Option 1: Separate Servers (Recommended)

Deploy frontend and backend on separate servers/domains.

#### Backend Deployment (PHP API)

1. **Upload API files to server**
   ```bash
   # Upload the 'api' directory to your server
   rsync -avz api/ user@yourserver.com:/var/www/api/
   ```

2. **Configure web server**
   
   **Apache example** (VirtualHost):
   ```apache
   <VirtualHost *:80>
       ServerName api.yourdomain.com
       DocumentRoot /var/www/api
       
       <Directory /var/www/api>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
       
       # Enable PHP
       <FilesMatch \.php$>
           SetHandler application/x-httpd-php
       </FilesMatch>
   </VirtualHost>
   ```

   **Nginx example**:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       root /var/www/api;
       index index.php;

       location / {
           try_files $uri $uri/ =404;
       }

       location ~ \.php$ {
           fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
           fastcgi_index index.php;
           include fastcgi_params;
           fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
       }
   }
   ```

3. **Update CORS settings**
   
   In each PHP file (`login.php`, `logout.php`, `check-session.php`), update:
   ```php
   $allowedOrigins = [
       'https://yourdomain.com',  // Your production frontend URL
   ];
   ```

4. **Enable HTTPS**
   ```bash
   # Using Let's Encrypt
   sudo certbot --apache -d api.yourdomain.com
   ```

5. **Update session settings for HTTPS**
   
   In `api/login.php` and `api/session.php`:
   ```php
   ini_set('session.cookie_secure', 1);  // Change from 0 to 1
   ```

#### Frontend Deployment (React)

1. **Build the React app**
   ```bash
   npm run build
   ```

2. **Update API endpoints**
   
   Create `.env.production`:
   ```env
   REACT_APP_LOGIN_ENDPOINT=https://api.yourdomain.com/login.php
   ```

3. **Upload build files**
   ```bash
   # Upload the 'build' directory to your server
   rsync -avz build/ user@yourserver.com:/var/www/html/
   ```

4. **Configure web server**
   
   **Apache example**:
   ```apache
   <VirtualHost *:80>
       ServerName yourdomain.com
       DocumentRoot /var/www/html
       
       <Directory /var/www/html>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
           
           # React Router support
           RewriteEngine On
           RewriteBase /
           RewriteRule ^index\.html$ - [L]
           RewriteCond %{REQUEST_FILENAME} !-f
           RewriteCond %{REQUEST_FILENAME} !-d
           RewriteRule . /index.html [L]
       </Directory>
   </VirtualHost>
   ```

   **Nginx example**:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

5. **Enable HTTPS**
   ```bash
   sudo certbot --apache -d yourdomain.com
   ```

### Option 2: Same Server Deployment

Deploy both frontend and backend on the same server.

1. **Build React app**
   ```bash
   npm run build
   ```

2. **Deploy structure**
   ```
   /var/www/html/
   ├── index.html          (from build/)
   ├── static/             (from build/)
   ├── manifest.json       (from build/)
   └── api/                (PHP backend)
       ├── login.php
       ├── logout.php
       ├── session.php
       └── ...
   ```

3. **Configure CORS**
   
   In PHP files, update:
   ```php
   $allowedOrigins = [
       'https://yourdomain.com',
       'http://yourdomain.com',
   ];
   ```

4. **Create `.env.production`**
   ```env
   REACT_APP_LOGIN_ENDPOINT=/api/login.php
   ```

## Security Checklist

Before deploying to production:

- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Update `session.cookie_secure` to 1 in PHP files
- [ ] Update CORS `$allowedOrigins` to production domains only
- [ ] Move `wallet_logins.log` outside web root
- [ ] Set proper file permissions (644 for files, 755 for directories)
- [ ] Configure security headers in `.htaccess` or server config
- [ ] Enable PHP error logging (not displaying)
- [ ] Set up firewall rules
- [ ] Regular security updates for PHP and dependencies
- [ ] Implement rate limiting on API endpoints
- [ ] Monitor logs for suspicious activity

## Testing Production Build Locally

Before deploying, test the production build locally:

```bash
# Build the React app
npm run build

# Serve the build folder using a static server
npx serve -s build -l 3000

# In another terminal, run PHP server
cd api
php -S localhost:8888

# Open http://localhost:3000 and test
```

## Environment Variables

### Development (.env)
```env
REACT_APP_LOGIN_ENDPOINT=/api/login.php
```

### Production (.env.production)
```env
REACT_APP_LOGIN_ENDPOINT=https://api.yourdomain.com/login.php
# Or if on same server:
# REACT_APP_LOGIN_ENDPOINT=/api/login.php
```

## Troubleshooting

### CORS Errors
- Verify `$allowedOrigins` includes your frontend domain
- Check that Apache/Nginx has `mod_headers` enabled
- Ensure credentials are being sent: `credentials: 'include'`

### Session Not Persisting
- Verify cookies are being set (check browser DevTools)
- Ensure `session.cookie_secure` matches your HTTPS status
- Check `session.cookie_samesite` setting

### API Calls Failing
- Check that backend server is running
- Verify proxy configuration in `package.json` (development)
- Check network tab in browser DevTools for actual URLs
- Verify CORS headers in API responses

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Clear build folder: `rm -rf build`
- Check Node.js version: `node --version` (should be 16+)

## Monitoring

### Backend Logs
```bash
# View PHP error log
tail -f /var/log/php/error.log

# View wallet login log
tail -f /var/log/app/wallet_logins.log
```

### Frontend Logs
Check browser console for any errors or warnings.

## Backup

Regular backups should include:
- Database (if you add one later)
- `wallet_logins.log`
- PHP session files
- Configuration files

## Updates

### Updating Frontend
```bash
# Pull latest changes
git pull

# Install dependencies
npm install

# Build
npm run build

# Deploy build files
```

### Updating Backend
```bash
# Pull latest changes
git pull

# Upload API files
rsync -avz api/ user@yourserver.com:/var/www/api/

# Test endpoints
curl https://api.yourdomain.com/check-session.php
```

## Support

For issues and questions:
- Check existing GitHub issues
- Review the documentation
- Open a new issue on GitHub

---

**Note**: This is a basic deployment guide. For production applications, consider additional security measures, load balancing, CDN for static assets, and database integration.
