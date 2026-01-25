# 🎮 RoninAds.com - Advertising Service Platform

A complete React-based advertising service platform with wallet authentication, points system, and publisher features. Built for the Ronin ecosystem with support for multiple wallet types.

**✨ NEW: Fully runs in the browser - No backend server required! All data is stored locally.**

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
- **Admin Configuration**: Configure NFT collections, rewards, and app settings through a web interface
- **Data Management**: Export/import data as JSON for backup and migration

### Technical Features
- **React 19 + TypeScript**: Modern React with full type safety
- **React Router**: Client-side routing with protected routes
- **Local Storage**: All data persists in the browser using localStorage
- **No Backend Required**: Fully runs in the browser - no PHP, no MySQL, no server needed
- **Session Management**: Secure authentication with session tokens
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Purple/blue gradient theme with glassmorphism effects

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or yarn
- **Wallet Extension**: Ronin Wallet or Metamask browser extension

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/codenimar/planets-ron.git
cd planets-ron
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm start
```

4. **Open the application:**
   - Application: [http://localhost:3000](http://localhost:3000)
   - Login with your wallet
   - First wallet to login will be automatically set as admin

## 📁 Project Structure

```
planets-ron/
├── public/
│   ├── index.html                # React app entry point
│   └── ...                       # Static assets
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
│   │   ├── AdminPage.tsx         # Admin configuration panel
│   │   ├── TermsPage.tsx         # Terms of Service
│   │   └── PrivacyPage.tsx       # Privacy Policy
│   ├── utils/
│   │   ├── api.ts                # API layer (uses localStorage)
│   │   ├── localStorage.ts       # Local storage service
│   │   └── wallet.ts             # Wallet utilities
│   ├── App.tsx                   # Main App component
│   ├── App.css                   # Global styles
│   └── index.tsx                 # React entry point
├── package.json                  # Dependencies
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

1. **Get Publisher Pass**: Have an admin assign you a Publisher Pass (Basic, Silver, or Gold)
2. **Create Posts**: Create up to 3 active posts at a time
3. **Post Duration**:
   - Basic Pass: Posts active for 3 days
   - Silver Pass: Posts active for 10 days
   - Gold Pass: Posts active for 30 days
4. **Admin Approval**: New posts and edits require admin approval
5. **Manage Posts**: Edit or deactivate posts (cannot delete before expiration)

### For Admins

1. **Access Admin Panel**: Navigate to `/admin` after logging in with an admin wallet
2. **Configure Application**:
   - Adjust base points per view
   - Set view duration requirements
   - Configure cooldown hours
   - Set max posts per publisher
3. **Manage NFT Collections**: Add/remove NFT collections that give bonus points
4. **Manage Rewards**: Add NFT or token rewards that members can claim
5. **Approve Posts**: Review and approve/reject new posts and edits
6. **Process Claims**: Mark reward claims as sent or cancelled
7. **Give Passes**: Assign Click Passes and Publisher Passes to members
8. **Data Management**: Export/import all data or clear storage

## 🔧 Configuration

### Admin Setup

The first wallet to log in will automatically become an admin. Additional admins can be added through the Admin Panel:

1. Log in with your wallet
2. Navigate to Admin Panel (Admin link appears in navigation)
3. Go to Configuration tab
4. Add admin wallet addresses as needed

### Application Settings

Configure these settings through the Admin Panel → Configuration tab:

- **Base Points Per View**: Points earned for viewing a post (default: 1)
- **View Duration Required**: Minimum seconds to view for earning points (default: 10)
- **Cooldown Hours**: Hours before viewing the same post again (default: 24)
- **Max Posts Per Publisher**: Maximum active posts per publisher (default: 3)

### NFT Collections

Add NFT collections that give bonus points to holders:

1. Go to Admin Panel → Configuration tab
2. Scroll to NFT Collections section
3. Add collection name and contract address
4. Members holding NFTs from these collections get +1 point per NFT (max 3)

### Rewards

Create rewards that members can claim with their points:

1. Go to Admin Panel → Configuration tab
2. Scroll to Rewards section
3. Add reward details (name, description, type, cost, quantity)
4. Members can claim these rewards from the Rewards page

## 🛠️ Available Scripts

### Frontend Scripts

```bash
npm start          # Start development server (http://localhost:3000)
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App (one-way operation)
```

## 🔒 Security Features

- **Wallet Authentication**: Users authenticate with their Web3 wallets
- **Session Management**: Secure session tokens with expiration
- **Local Storage**: All data stored locally in the browser
- **Input Validation**: Comprehensive validation on all inputs
- **Authentication Required**: Protected routes require valid session
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

# Deploy build folder to any static hosting service:
# - Netlify
# - Vercel
# - GitHub Pages
# - AWS S3 + CloudFront
# - Any web server (Apache, Nginx, etc.)
```

### Static Hosting Configuration

For React Router to work properly, configure your hosting to redirect all routes to `index.html`:

**Netlify**: Create `public/_redirects` file:
```
/*    /index.html   200
```

**Vercel**: Create `vercel.json` file:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

**Apache**: Create/update `.htaccess` file:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx**:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## 💾 Data Management

### Export Data

Use the Admin Panel → Data Management tab to export all data as a JSON file. This includes:
- Members
- Posts
- Post views
- Reward claims
- Click passes
- Publisher passes
- Points history
- Configuration

### Import Data

Import previously exported data through the Admin Panel. This will overwrite existing data.

### Clear All Data

⚠️ **Warning**: This permanently deletes all data. Use the Admin Panel → Data Management tab with caution.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🐛 Troubleshooting

### Wallet Connection Issues
- Ensure wallet extension is installed and unlocked
- Check that you're on the correct network
- Try refreshing the page and reconnecting

### Data Not Persisting
- Check if cookies/local storage are enabled in your browser
- Some privacy extensions may block local storage
- Try a different browser or disable privacy extensions for this site

### Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js version is 16 or higher
- Clear React cache: `rm -rf node_modules/.cache`

### "Ronin connection failed" Error
- **This error should no longer occur** as the application no longer requires a backend server
- All data is now stored locally in your browser
- No PHP or MySQL setup is needed

## 📞 Support

- **Contact**: [https://x.com/planetronin](https://x.com/planetronin)
- **Issues**: Open an issue on GitHub

## 🎉 Acknowledgments

Built with:
- React 19
- TypeScript
- @sky-mavis/tanto-connect
- ethers.js
- React Router
- Browser LocalStorage API

---

**Built with ❤️ for the Ronin ecosystem**
