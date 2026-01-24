# 🔐 Wallet Login

A React-based wallet authentication application with **@sky-mavis/tanto-connect** and Web3 functionalities, enabling secure Ronin Wallet and Metamask login.

## 🏗️ Architecture

This application follows a **client-server architecture** with clear separation of concerns:

- **Frontend (React)**: Pure client-side application running in the browser
  - Handles UI/UX
  - Wallet connections (Ronin, Metamask)
  - Makes API calls to PHP backend
  - Built with TypeScript for type safety

- **Backend (PHP)**: Server-side API handling business logic
  - Wallet authentication
  - Session management
  - Security and validation
  - Located in `api/` directory

```
Frontend (React)  ←→  Backend (PHP API)
   localhost:3000  ←→  localhost:8888 (dev)
   Browser/SPA     ←→  Server-side
```

## 🌟 Features

- **React + TypeScript**: Modern React 19 application with full TypeScript support
- **Ronin Wallet Integration**: Connect using @sky-mavis/tanto-connect
- **Metamask Support**: Web3 authentication with Metamask wallet
- **Secure PHP Backend**: PHP script to handle wallet authentication
- **Responsive Design**: Mobile-friendly UI that works on all devices
- **Beautiful UI**: Gradient backgrounds with glassmorphism effects

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PHP 7.4+ (8.x recommended)
- Metamask browser extension (for Metamask login)
- Ronin Wallet (for Ronin login)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/codenimar/planets-ron.git
cd planets-ron
```

2. Install frontend dependencies:
```bash
npm install
```

3. Configure environment (optional):
```bash
cp .env.example .env
# Edit .env if needed (default values work for local development)
```

### Quick Start (Recommended)

Use the provided script to start both servers automatically:

```bash
./dev-start.sh
```

This will:
- Start the PHP backend server on http://localhost:8888
- Start the React development server on http://localhost:3000
- Open the app in your browser

To stop both servers, press `Ctrl+C` or run:
```bash
./dev-stop.sh
```

### Manual Start

If you prefer to start servers manually:

4. Start the PHP backend server:
```bash
cd api
php -S localhost:8888
```

5. In a new terminal, start the React development server:
```bash
npm start
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

The app will automatically reload when you make changes. API calls are proxied to the PHP backend automatically during development.

## 🏗️ Building for Production

To create a production build:

```bash
npm run build
```

This builds the app for production to the `build` folder. The build is minified and optimized for best performance.

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📁 Project Structure

```
planets-ron/
├── api/                      # PHP Backend (Server-side)
│   ├── login.php             # Wallet authentication endpoint
│   ├── logout.php            # Logout endpoint
│   ├── session.php           # Session management utilities
│   ├── check-session.php     # Session status check endpoint
│   ├── dashboard.php         # Protected page example
│   ├── .htaccess             # Apache security configuration
│   └── README.md             # Backend API documentation
├── public/                   # Static files for React
│   ├── index.html            # HTML template
│   └── ...                   # Other static assets
├── src/                      # React Frontend (Client-side)
│   ├── components/           # React components
│   │   └── WalletConnect.tsx # Wallet connection UI
│   ├── utils/                # Utility functions
│   │   └── wallet.ts         # Wallet connection utilities
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx               # Main App component
│   ├── App.css               # Global styles
│   └── index.tsx             # Entry point
├── package.json              # Frontend dependencies and scripts
├── DEPLOYMENT.md             # Deployment guide
└── README.md                 # This file
```

## 🎮 How to Use

### Connecting Wallets

1. **Ronin Wallet**:
   - Click the "Connect Ronin Wallet" button
   - Approve the connection in your Ronin Wallet extension
   - Your wallet address will be sent to login.php

2. **Metamask**:
   - Click the "Connect Metamask" button
   - Approve the connection in your Metamask extension
   - Your wallet address and balance will be displayed and sent to login.php

### Backend Integration

The React frontend communicates with the PHP backend through RESTful API calls:

**Login Flow:**
1. User connects wallet (Ronin or Metamask) in the browser
2. React app gets wallet address from browser wallet extension
3. React sends POST request to `/api/login.php` with wallet data:
```json
{
  "address": "0x...",
  "walletType": "ronin" | "metamask",
  "timestamp": "2026-01-24T21:00:00.000Z"
}
```
4. PHP backend validates, creates session, and returns success response
5. React updates UI to show connected state

**API Endpoints:**
- `POST /api/login.php` - Authenticate wallet
- `GET /api/check-session.php` - Check session status
- `POST /api/logout.php` - Destroy session
- `GET /api/dashboard.php` - Example protected page

For complete API documentation, see [api/README.md](./api/README.md).

## 🔧 Technologies Used

### Frontend
- **React 19**: UI framework
- **TypeScript**: Type-safe development
- **@sky-mavis/tanto-connect**: Ronin Wallet integration
- **ethers.js**: Ethereum Web3 library
- **Create React App**: Project scaffolding

### Backend
- **PHP 8.x**: Server-side scripting
- **Session Management**: Secure PHP sessions with HTTP-only cookies
- **Apache/Nginx**: Web server (or PHP built-in server for development)

## 📦 Key Dependencies

```json
{
  "@sky-mavis/tanto-connect": "^0.0.21",
  "ethers": "^5.7.2",
  "react": "^19.2.3",
  "typescript": "^4.9.5"
}
```

## 🛠️ Available Scripts

### Frontend (React)

#### `npm start`
Runs the React app in development mode at [http://localhost:3000](http://localhost:3000)

API calls are automatically proxied to `http://localhost:8888` (PHP backend)

#### `npm test`
Launches the test runner in interactive watch mode

#### `npm run build`
Builds the app for production to the `build` folder

#### `npm run eject`
**Note: this is a one-way operation!** Ejects from Create React App for full configuration control.

### Backend (PHP)

#### Development Server
```bash
cd api
php -S localhost:8888
```

#### Testing API Endpoints
See [api/README.md](./api/README.md) for curl examples and testing instructions.

## 🌐 Wallet Configuration

### Ronin Wallet
- Chain ID: 2020 (Ronin mainnet)
- RPC URL: https://api.roninchain.com/rpc
- Block Explorer: https://explorer.roninchain.com

### Metamask
- Supports Ethereum mainnet and testnets
- Can be configured for custom networks including Ronin

## 🔒 Security Features

- **Address Validation**: Validates wallet address format (0x followed by 40 hex characters)
- **POST Only**: login.php only accepts POST requests
- **Session Management**: Creates secure sessions with tokens
- **CORS Headers**: Proper CORS configuration
- **Input Sanitization**: Validates all input data
- **Logging**: Tracks all login attempts with IP and user agent

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1400px+)
- Tablet (768px - 1399px)
- Mobile (< 768px)
- Small mobile devices (< 480px)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🐛 Troubleshooting

### Frontend Issues

#### Wallet Connection Issues
- Ensure your wallet extension is installed and unlocked
- Check that you're on the correct network
- Try refreshing the page and reconnecting

#### API Call Failures
- Verify PHP backend is running on port 8888
- Check browser console for CORS errors
- Ensure proxy is configured in package.json

### Backend Issues

#### PHP Server Not Starting
- Check if port 8888 is already in use
- Verify PHP is installed: `php --version`
- Try a different port: `php -S localhost:9000`

#### Session Issues
- Check PHP session directory is writable
- Verify session cookies are being set (browser DevTools)
- Clear browser cookies and try again

#### CORS Errors
- Ensure frontend URL is in `$allowedOrigins` in PHP files
- Check Apache/Nginx has `mod_headers` enabled
- Verify credentials are being sent: `credentials: 'include'`

### Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js version is 16 or higher

For more detailed troubleshooting, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📄 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [api/README.md](./api/README.md) - Backend API documentation
- [SECURITY.md](./SECURITY.md) - Security considerations

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation

---

Built with ❤️ using React, Tanto Connect, and Web3