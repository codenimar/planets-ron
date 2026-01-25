# 🎮 RoninAds.com - Advertising Service Platform

A complete React-based advertising service platform with wallet authentication, points system, and publisher features. Built for the Ronin ecosystem with support for multiple wallet types.

## 🌟 Features

### Core Platform Features
- **Multi-Wallet Authentication**: Ronin Wallet, Ronin Mobile, Waypoint, and Metamask support
- **Points Earning System**: Members earn points by viewing ads/posts for at least 10 seconds
- **Click Pass Tiers**: Basic (+10 pts), Silver (+20 pts), Golden (+30 pts) additional points per view
- **Publisher System**: Create and manage ads/posts with Publisher Pass NFTs
- **Rewards Marketplace**: Claim NFTs and tokens using earned points
- **NFT Collection Bonuses**: Additional points for holding specific NFT collections (up to 3 per collection)
- **24-Hour Cooldown**: Each post can be viewed once per 24 hours per member
- **Admin Moderation**: New posts require admin approval before going live

### Technical Features
- **React 19 + TypeScript**: Modern React with full type safety
- **React Router**: Client-side routing with protected routes
- **PHP Backend API**: RESTful API with MySQL database
- **Session Management**: Secure authentication with session tokens
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Purple/blue gradient theme with glassmorphism effects

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or yarn
- **PHP** (7.4 or higher)
- **MySQL** (5.7 or higher)
- **Web server** (Apache/Nginx with PHP support)
- **Wallet Extension**: Ronin Wallet or Metamask browser extension

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/codenimar/planets-ron.git
cd planets-ron
```

2. **Install frontend dependencies:**
```bash
npm install
```

3. **Set up the database:**
```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE roninads CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
mysql -u root -p roninads < database/schema.sql
```

4. **Configure environment:**
```bash
# Copy environment example
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_NAME=roninads
# DB_USER=root
# DB_PASS=your_password
```

5. **Start development server:**
```bash
# Frontend (React)
npm start

# Backend (PHP) - if using PHP built-in server for testing
# php -S localhost:8000 -t public
```

6. **Open the application:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000/api](http://localhost:8000/api)

## 📁 Project Structure

```
roninads/
├── database/
│   └── schema.sql                 # MySQL database schema
├── public/
│   ├── api/                       # PHP Backend API
│   │   ├── config.php            # Database configuration
│   │   ├── auth.php              # Authentication endpoints
│   │   ├── members.php           # Member management
│   │   ├── posts.php             # Posts/Ads management
│   │   ├── rewards.php           # Rewards system
│   │   ├── nfts.php              # NFT collection tracking
│   │   ├── admin.php             # Admin functions
│   │   ├── README.md             # API documentation
│   │   └── QUICK_REFERENCE.md    # API quick reference
│   └── index.html                # React app entry point
├── src/
│   ├── components/               # React components
│   │   ├── Navigation.tsx        # Main navigation
│   │   └── WalletConnect.tsx     # Wallet connection UI
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication context
│   ├── pages/                    # Application pages
│   │   ├── LandingPage.tsx       # Home/landing page
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── PostsPage.tsx         # Publisher post management
│   │   ├── RewardsPage.tsx       # Rewards marketplace
│   │   ├── TermsPage.tsx         # Terms of Service
│   │   └── PrivacyPage.tsx       # Privacy Policy
│   ├── utils/
│   │   ├── api.ts                # API helper functions
│   │   └── wallet.ts             # Wallet utilities
│   ├── App.tsx                   # Main App component
│   ├── App.css                   # Global styles
│   └── index.tsx                 # React entry point
├── .env.example                  # Environment variables template
├── package.json                  # Frontend dependencies
└── README.md                     # This file
```

## 🎯 How It Works

### For Members (Viewers)

1. **Connect Wallet**: Log in using Ronin Wallet, Ronin Mobile, Waypoint, or Metamask
2. **View Posts**: Browse ads/posts/announcements from publishers
3. **Earn Points**: Stay on a post for 10+ seconds to earn points:
   - Base: 1 point per view
   - With Basic Click Pass: +10 points (11 total)
   - With Silver Click Pass: +20 points (21 total)
   - With Golden Click Pass: +30 points (31 total)
   - NFT Collection Bonus: +1 point per NFT (up to 3)
4. **Claim Rewards**: Use earned points to claim NFTs or tokens
5. **24-Hour Cooldown**: Each post can only be viewed once per 24 hours

### For Publishers

1. **Get Publisher Pass**: Obtain a Publisher Pass NFT (Basic, Silver, or Gold)
2. **Create Posts**: Create up to 3 active posts at a time
3. **Post Duration**:
   - Basic Pass: Posts active for 3 days
   - Silver Pass: Posts active for 10 days
   - Gold Pass: Posts active for 30 days
4. **Admin Approval**: New posts and edits require admin approval
5. **Manage Posts**: Edit or deactivate posts (cannot delete before expiration)

### For Admins

1. **Approve Posts**: Review and approve/reject new posts and edits
2. **Manage Rewards**: Process reward claims (mark as sent or cancelled)
3. **Monitor Platform**: View stats and manage members

## 🔧 Configuration

### Database Configuration

Edit `public/api/config.php` or set environment variables:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'roninads');
define('DB_USER', 'root');
define('DB_PASS', 'your_password');
```

### Frontend Configuration

Edit `.env`:

```env
# API endpoint (default: /api)
REACT_APP_API_URL=/api
```

### CORS Configuration

Update allowed origins in `public/api/config.php`:

```php
$allowedOrigins = [
    'http://localhost:3000',
    'https://yourdomain.com',
];
```

## 🛠️ Available Scripts

### Frontend Scripts

```bash
npm start          # Start development server (http://localhost:3000)
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App (one-way operation)
```

### Backend Testing

```bash
# Test API endpoints
cd public/api
chmod +x test-api.sh
./test-api.sh
```

## 📚 API Documentation

Full API documentation is available in `public/api/README.md`.

### Quick API Reference

**Authentication:**
- `POST /api/auth.php?action=login` - Login with wallet
- `POST /api/auth.php?action=logout` - Logout
- `GET /api/auth.php?action=check_session` - Check authentication

**Members:**
- `GET /api/members.php?action=profile` - Get member profile
- `GET /api/members.php?action=stats` - Get member statistics

**Posts:**
- `GET /api/posts.php?action=list` - List all active posts
- `POST /api/posts.php?action=create` - Create new post
- `POST /api/posts.php?action=view` - Record post view and earn points

**Rewards:**
- `GET /api/rewards.php?action=list` - List available rewards
- `POST /api/rewards.php?action=claim` - Claim a reward
- `GET /api/rewards.php?action=my_claims` - Get claim history

## 🔒 Security Features

- **SQL Injection Protection**: All queries use prepared statements
- **Session Management**: Secure session tokens with expiration
- **CSRF Protection**: CSRF tokens for all mutations
- **Input Validation**: Comprehensive validation on all inputs
- **Authentication Required**: Protected endpoints require valid session
- **Admin Authorization**: Admin functions require admin role
- **Rate Limiting**: Cooldown periods prevent abuse

## 🎨 Styling & Theme

The application uses a modern purple/blue gradient theme:

- **Primary Gradient**: `#667eea → #764ba2`
- **Design Style**: Glassmorphism with backdrop blur
- **Responsive**: Mobile-first responsive design
- **Animations**: Smooth transitions and hover effects

## 📱 Responsive Design

Optimized for:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1400px

## 🌐 Wallet Support

### Ronin Wallet
- Chain ID: 2020 (Ronin mainnet)
- RPC URL: https://api.roninchain.com/rpc
- Block Explorer: https://explorer.roninchain.com

### Metamask
- Supports Ethereum mainnet and testnets
- Can be configured for custom networks including Ronin

## 🚢 Deployment

### Production Build

```bash
# Build React app
npm run build

# Deploy build folder to web server
# Ensure PHP and MySQL are configured
# Point web server to public/ directory
```

### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName roninads.com
    DocumentRoot /var/www/roninads/public
    
    <Directory /var/www/roninads/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # React Router support
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </IfModule>
</VirtualHost>
```

### Nginx Configuration

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
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🐛 Troubleshooting

### Wallet Connection Issues
- Ensure wallet extension is installed and unlocked
- Check that you're on the correct network
- Try refreshing the page and reconnecting

### API Errors
- Verify database credentials in `.env` or `config.php`
- Check that MySQL database is created and schema is imported
- Ensure PHP has PDO MySQL extension enabled
- Check CORS settings in `config.php`

### Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js version is 16 or higher
- Clear React cache: `rm -rf node_modules/.cache`

## 📞 Support

- **Contact**: [https://x.com/planetronin](https://x.com/planetronin)
- **Issues**: Open an issue on GitHub
- **Documentation**: Check `public/api/README.md` for API docs

## 🎉 Acknowledgments

Built with:
- React 19
- TypeScript
- @sky-mavis/tanto-connect
- ethers.js
- React Router
- PHP & MySQL

---

**Built with ❤️ for the Ronin ecosystem**
