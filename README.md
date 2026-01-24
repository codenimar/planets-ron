# 🔐 Wallet Login

A React-based wallet authentication application with **@sky-mavis/tanto-connect** and Web3 functionalities, enabling secure Ronin Wallet and Metamask login.

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
- Metamask browser extension (for Metamask login)
- Ronin Wallet (for Ronin login)
- PHP server (for login.php backend)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/codenimar/planets-ron.git
cd planets-ron
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The app will automatically reload when you make changes.

## 🏗️ Building for Production

To create a production build:

```bash
npm run build
```

This builds the app for production to the `build` folder. The build is minified and optimized for best performance.

## 📁 Project Structure

```
planets-ron/
├── public/
│   ├── login.php             # PHP backend for authentication
│   └── ...                   # Other static files
├── src/
│   ├── components/           # React components
│   │   └── WalletConnect.tsx # Wallet connection UI
│   ├── utils/                # Utility functions
│   │   └── wallet.ts         # Wallet connection utilities
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx               # Main App component
│   ├── App.css               # Global styles
│   └── index.tsx             # Entry point
├── package.json              # Dependencies and scripts
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

After successful wallet connection, the wallet address is securely sent to `/login.php` via POST request with the following data:

```json
{
  "address": "0x...",
  "walletType": "ronin" | "metamask",
  "timestamp": "2026-01-24T21:00:00.000Z"
}
```

The PHP script handles:
- Address validation
- Session creation
- Token generation
- Login logging

## 🔧 Technologies Used

- **React 19**: UI framework
- **TypeScript**: Type-safe development
- **@sky-mavis/tanto-connect**: Ronin Wallet integration
- **ethers.js**: Ethereum Web3 library
- **PHP**: Backend authentication handler
- **Create React App**: Project scaffolding

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

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
**Note: this is a one-way operation!** Ejects from Create React App for full configuration control.

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

### Wallet Connection Issues
- Ensure your wallet extension is installed and unlocked
- Check that you're on the correct network
- Try refreshing the page and reconnecting

### PHP Backend Issues
- Ensure PHP is installed and running on your server
- Check that login.php has proper file permissions
- Verify CORS settings match your domain

### Build Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js version is 16 or higher

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation

---

Built with ❤️ using React, Tanto Connect, and Web3