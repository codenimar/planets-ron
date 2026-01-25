# RoninAds.com - Setup & Installation Guide

This guide will walk you through setting up the complete RoninAds.com platform from scratch.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **PHP** 7.4 or higher
- **MySQL** 5.7 or higher
- **Web Server** (Apache, Nginx, or PHP built-in server for development)
- **Git** (for cloning the repository)

## 🚀 Step-by-Step Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/codenimar/planets-ron.git
cd planets-ron
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

This will install all React and TypeScript dependencies.

### Step 3: Set Up MySQL Database

#### 3.1 Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE roninads CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit MySQL
exit;
```

#### 3.2 Import Database Schema

```bash
# Import the schema
mysql -u root -p roninads < database/schema.sql
```

This creates all necessary tables:
- `members` - User accounts
- `click_passes` - Click Pass NFTs
- `publisher_passes` - Publisher Pass NFTs
- `nft_collections` - Tracked NFT collections
- `member_nfts` - Member NFT holdings
- `posts` - Ads/Posts/Announcements
- `post_views` - View tracking for points
- `rewards` - Available rewards
- `reward_claims` - Reward claim history
- `points_history` - Points transaction log
- `sessions` - Authentication sessions
- `admins` - Admin users

### Step 4: Configure Environment

#### 4.1 Create Environment File

```bash
cp .env.example .env
```

#### 4.2 Edit Database Configuration

Edit `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_NAME=roninads
DB_USER=root
DB_PASS=your_mysql_password

# API Configuration (for React frontend)
REACT_APP_API_URL=/api
```

#### 4.3 Verify API Configuration

Edit `public/api/config.php` and ensure the database constants match your `.env`:

```php
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'roninads');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
```

### Step 5: Configure CORS (Development)

Edit `public/api/config.php` and add your development URLs:

```php
$allowedOrigins = [
    'http://localhost:3000',        // React dev server
    'http://localhost:8000',        // PHP built-in server
    'http://127.0.0.1:3000',
    // Add production domain here when deploying
    // 'https://roninads.com',
];
```

### Step 6: Start Development Servers

#### Option A: Using React Dev Server + PHP Built-in Server

Terminal 1 - Start React:
```bash
npm start
```

Terminal 2 - Start PHP API:
```bash
php -S localhost:8000 -t public
```

Access the application at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000/api

#### Option B: Using Apache/Nginx

Configure your web server to serve the `public/` directory and proxy API requests to PHP.

### Step 7: Test the Installation

#### 7.1 Open the Application

Navigate to http://localhost:3000 in your browser.

#### 7.2 Connect a Wallet

1. Click "Connect Ronin Wallet" or "Connect Metamask"
2. Approve the connection in your wallet
3. You should be redirected to the dashboard

#### 7.3 Verify Database Connection

Check that your member was created in the database:

```bash
mysql -u root -p roninads -e "SELECT * FROM members;"
```

### Step 8: Create Sample Data (Optional)

#### 8.1 Create an Admin User

```sql
-- Login to MySQL
mysql -u root -p roninads

-- Find your member ID (replace with your wallet address)
SELECT id FROM members WHERE wallet_address = '0xYourWalletAddress';

-- Create admin (replace 1 with your member ID)
INSERT INTO admins (member_id, role) VALUES (1, 'admin');
```

#### 8.2 Add Sample NFT Collections

```sql
INSERT INTO nft_collections (collection_name, collection_address, points_per_nft, max_nfts_counted) VALUES
('Axie Infinity', '0x32950db2a7164ae833121501c797d79e7b79d74c', 1, 3),
('RON Staking', '0x0123456789abcdef0123456789abcdef01234567', 1, 3);
```

#### 8.3 Add Sample Rewards

```sql
INSERT INTO rewards (reward_name, reward_type, points_required, reward_description, quantity_available) VALUES
('Bronze NFT', 'nft', 100, 'Exclusive Bronze tier NFT reward', 100),
('Silver NFT', 'nft', 500, 'Exclusive Silver tier NFT reward', 50),
('Gold NFT', 'nft', 1000, 'Exclusive Gold tier NFT reward', 25),
('10 RON Tokens', 'token', 250, 'Claim 10 RON tokens', 200);
```

#### 8.4 Give Yourself a Publisher Pass

```sql
-- Replace 1 with your member ID
INSERT INTO publisher_passes (member_id, pass_type, duration_days, expires_at) VALUES
(1, 'Gold', 30, DATE_ADD(NOW(), INTERVAL 30 DAY));
```

## 🏗️ Production Deployment

### Step 1: Build React Application

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Step 2: Deploy to Web Server

#### Apache Setup

```apache
<VirtualHost *:80>
    ServerName roninads.com
    DocumentRoot /var/www/roninads/public
    
    <Directory /var/www/roninads/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Enable mod_rewrite for React Router
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </IfModule>
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

#### Nginx Setup

```nginx
server {
    listen 80;
    server_name roninads.com;
    root /var/www/roninads/public;
    index index.html;
    
    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # PHP API
    location /api {
        try_files $uri $uri/ =404;
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Step 3: Copy Build Files

```bash
# Copy React build to public directory
cp -r build/* public/

# Ensure API directory is accessible
chmod -R 755 public/api
```

### Step 4: Secure Configuration

```bash
# Move .env outside public directory
mv .env ../

# Update config.php to read from parent directory
# Or set environment variables in PHP-FPM/Apache config
```

### Step 5: Enable HTTPS (Recommended)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-apache

# Get SSL certificate
sudo certbot --apache -d roninads.com
```

## ✅ Verification Checklist

After installation, verify:

- [ ] Frontend loads at http://localhost:3000 (dev) or your domain (prod)
- [ ] API responds at /api/auth.php?action=check_session
- [ ] Wallet connection works (Ronin or Metamask)
- [ ] Member is created in database after login
- [ ] Dashboard displays correctly
- [ ] Can view posts (if any exist)
- [ ] Points system works (10-second timer)
- [ ] Can access rewards page
- [ ] Terms and Privacy pages load
- [ ] Navigation works correctly
- [ ] Logout works

## 🐛 Common Issues & Solutions

### Issue: "Database connection failed"

**Solution:**
- Check database credentials in `.env` or `config.php`
- Verify MySQL is running: `sudo systemctl status mysql`
- Test connection: `mysql -u root -p roninads`

### Issue: "CORS policy error"

**Solution:**
- Add your domain to `$allowedOrigins` in `public/api/config.php`
- Ensure `Access-Control-Allow-Credentials` is set to `true`

### Issue: "Wallet not connecting"

**Solution:**
- Ensure wallet extension is installed
- Check browser console for errors
- Try a different browser
- Clear browser cache and cookies

### Issue: "API returns 404"

**Solution:**
- Check that PHP is installed: `php -v`
- Verify mod_rewrite is enabled (Apache): `sudo a2enmod rewrite`
- Check .htaccess file exists in public directory
- Verify API files are in `public/api/` directory

### Issue: "Points not being earned"

**Solution:**
- Check that posts exist and are active
- Verify 24-hour cooldown hasn't been hit
- Check console for API errors
- Verify member has valid session

## 📚 Next Steps

1. **Customize Branding**: Update colors, logo, and content in `src/App.css`
2. **Add Collections**: Insert your NFT collections into `nft_collections` table
3. **Create Rewards**: Add rewards to `rewards` table
4. **Set Admin Users**: Add admin users to `admins` table
5. **Test Thoroughly**: Test all features with real wallets
6. **Monitor**: Set up logging and monitoring for production
7. **Backup**: Set up automated database backups

## 🔒 Security Recommendations

1. **Use HTTPS**: Always use SSL/TLS in production
2. **Strong Passwords**: Use strong database passwords
3. **Regular Updates**: Keep PHP, MySQL, and dependencies updated
4. **File Permissions**: Restrict file permissions (755 for directories, 644 for files)
5. **Environment Variables**: Never commit `.env` to version control
6. **Rate Limiting**: Implement rate limiting on API endpoints
7. **Input Validation**: All input is validated, but review for your use case
8. **SQL Injection**: All queries use prepared statements
9. **XSS Protection**: All output is escaped in PHP and React
10. **Session Security**: Sessions expire after 30 minutes of inactivity

## 📞 Support

If you encounter issues:

1. Check the logs: `tail -f /var/log/apache2/error.log` (Apache)
2. Review browser console for JavaScript errors
3. Check PHP error logs: `tail -f /var/log/php/error.log`
4. Read API documentation: `public/api/README.md`
5. Open an issue on GitHub
6. Contact: https://x.com/planetronin

---

**Happy building! 🚀**
