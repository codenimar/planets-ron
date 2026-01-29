# 🎮 RoninAds.com - Social Engagement and Rewards Platform

A complete React-based social engagement and rewards platform with wallet authentication, X.com task completion, and weekly prize draws. Built for the Ronin ecosystem with support for multiple wallet types.

**✨ NEW: X.com API Integration - Actions are now verified using the X.com API!**

## 🌟 Features

### Core Platform Features
- **Multi-Wallet Authentication**: Ronin Wallet, Ronin Mobile, Waypoint, and Metamask support
- **X.com Social Tasks**: Complete follow, like, and retweet tasks to earn points
- **X.com API Verification**: Actions are verified using X.com API v2 endpoints to ensure users actually complete tasks
- **Points Earning System**: 1 point per task, 2 points with featured NFT/token bonus
- **Featured Asset Verification**: Hold featured NFTs or tokens for 2x point multiplier
- **1-Hour Cooldown**: Verification cooldown to prevent gaming the system
- **Referral System**: Earn 1 point per referral retweet
- **Weekly Prize Draws**: Top point earners win weekly rewards
- **Mailbox System**: Send and receive messages between members
- **Admin Configuration**: Manage X posts, featured assets, and weekly rewards through web interface
- **Data Management**: Export/import data as JSON for backup and migration

### Technical Features
- **React 19 + TypeScript**: Modern React with full type safety
- **React Router**: Client-side routing with protected routes
- **Vercel Serverless Functions**: Backend API for X.com verification
- **X.com API v2 Integration**: Verifies follow, like, and retweet actions
- **Local Storage**: User data persists in the browser using localStorage
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

4. **(Optional) Set up X.com API for verification:**
   - See [X_API_SETUP.md](./X_API_SETUP.md) for detailed instructions
   - Create a `.env` file with your X API Bearer Token
   - This enables real-time verification of follow/like/retweet actions

5. **Open the application:**
   - Application: [http://localhost:3000](http://localhost:3000)
   - Login with your wallet
   - First wallet to login will be automatically set as admin

## 📁 Project Structure

```
planets-ron/
├── api/                          # Vercel serverless functions
│   ├── x-api-helper.ts           # X.com API utilities
│   ├── verify-follow.ts          # Follow verification endpoint
│   ├── verify-like.ts            # Like verification endpoint
│   └── verify-retweet.ts         # Retweet verification endpoint
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
│   │   ├── api.ts                # API layer (uses localStorage + X API)
│   │   ├── localStorage.ts       # Local storage service
│   │   └── wallet.ts             # Wallet utilities
│   ├── App.tsx                   # Main App component
│   ├── App.css                   # Global styles
│   └── index.tsx                 # React entry point
├── X_API_SETUP.md                # X.com API setup guide
├── package.json                  # Dependencies
└── README.md                     # This file
```

## 🎯 How It Works

### For Members

1. **Connect Wallet**: Log in using Ronin Wallet, Ronin Mobile, Waypoint, or Metamask
2. **Add X.com Handle**: Link your X.com account to your profile (required for verification)
3. **Complete Social Tasks**: Browse X posts and complete tasks:
   - Visit X.com post link
   - Follow the account on X.com
   - Like the post on X.com
   - Retweet the post on X.com
4. **Verify Actions**: Click verify buttons to confirm completion via X.com API
5. **Earn Points**: Receive 1 point per verified task (2 points with featured asset bonus)
6. **Verify Featured Assets**: Hold featured NFTs or tokens for 2x point multiplier
7. **Refer Friends**: Earn 1 point when referrals retweet your referral post
8. **Win Weekly Prizes**: Top point earners win weekly prize draws
9. **Use Mailbox**: Send and receive messages with other members

### For Admins

1. **Access Admin Panel**: Navigate to `/admin` after logging in with an admin wallet
2. **Manage X Posts**:
   - Add X.com posts with follow, like, and retweet tasks
   - Set point values and featured asset bonuses
   - Activate/deactivate posts
3. **Manage Featured Assets**:
   - Add NFT collections or ERC20 tokens as featured assets
   - Configure 2x point multiplier for holders
   - Set 1-hour verification cooldown
4. **Configure Weekly Rewards**:
   - Set number of winners per week
   - Configure prize details
   - Generate and export winner lists as CSV
5. **Manage Members**:
   - View all registered members
   - Check points balances and referral stats
   - Send mailbox messages
6. **Data Management**: Export/import all data or clear storage

## 🔧 Configuration

### Admin Setup

The first wallet to log in will automatically become an admin. Additional admins can be added through the Admin Panel:

1. Log in with your wallet
2. Navigate to Admin Panel (Admin link appears in navigation)
3. Go to Configuration tab
4. Add admin wallet addresses as needed

### X Posts Management

Add X.com posts for members to complete:

1. Go to Admin Panel → X Posts tab
2. Add post details:
   - X.com post URL
   - Task types (follow, like, retweet)
   - Point value per task (default: 1)
   - Optional featured asset bonus (2x multiplier)
3. Activate/deactivate posts as needed

### Featured Assets (NFT/Token Verification)

Add NFT collections or ERC20 tokens that provide bonus points:

1. Go to Admin Panel → Featured Assets tab
2. Add asset details:
   - Asset type (NFT Collection or ERC20 Token)
   - Contract address on Ronin network
   - Asset name and description
3. Members holding these assets get 2x points on tasks
4. 1-hour cooldown between verifications to prevent abuse

### Weekly Rewards

Configure weekly prize draws:

1. Go to Admin Panel → Weekly Rewards tab
2. Set number of winners per week
3. Configure prize details (description, value)
4. View current week's leaderboard
5. Generate winner list at end of week
6. Export winners as CSV for distribution

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

## 🎁 NFT/Token Verification

### How Featured Assets Work

Featured assets are NFTs or tokens that provide a 2x point multiplier for social tasks:

1. **Verification**: Members can verify ownership of featured NFTs/tokens through their connected wallet
2. **Bonus Points**: After successful verification, members earn 2 points per task instead of 1
3. **Cooldown Period**: 1-hour cooldown between verifications prevents gaming the system
4. **Multiple Assets**: Members can hold multiple featured assets, but only need one for the 2x multiplier

### Supported Asset Types

- **NFT Collections (ERC721)**: Verify ownership of any NFT in the collection
- **ERC20 Tokens**: Verify holding of specified token amount

## 🏆 Weekly Rewards

### How Prize Draws Work

1. **Earning Points**: Members earn points by completing X.com social tasks throughout the week
2. **Leaderboard**: Rankings are based on total points earned during the current week
3. **Winner Selection**: Top point earners are selected as winners at the end of each week
4. **Prize Distribution**: Admins export winner list as CSV for prize distribution
5. **New Week**: Points reset and a new competition begins

### For Members

- Check your ranking on the leaderboard
- Complete more tasks to increase your chances of winning
- Featured asset bonuses count toward your weekly total

### For Admins

- Configure number of winners and prize details
- Monitor leaderboard throughout the week
- Generate winner list at week's end
- Export winners as CSV with wallet addresses

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
- X Posts
- Social task completions
- Featured assets
- Weekly rewards
- Mailbox messages
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
