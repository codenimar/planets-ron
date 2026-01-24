# 🪐 Planets Ron

A React-based application integrated with **Phaser 3**, **@sky-mavis/tanto-connect**, and Web3 functionalities, enabling Ronin Wallet and Metamask login with an interactive solar system visualization.

## 🌟 Features

- **React + TypeScript**: Modern React 19 application with full TypeScript support
- **Phaser 3 Game Engine**: Interactive solar system simulation with orbiting planets
- **Ronin Wallet Integration**: Connect using @sky-mavis/tanto-connect
- **Metamask Support**: Web3 authentication with Metamask wallet
- **Responsive Design**: Mobile-friendly UI that works on all devices
- **Beautiful UI**: Gradient backgrounds with glassmorphism effects

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Metamask browser extension (for Metamask login)
- Ronin Wallet (for Ronin login)

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
├── public/                 # Static files
├── src/
│   ├── components/        # React components
│   │   ├── PhaserGame.tsx    # Phaser game wrapper
│   │   └── WalletConnect.tsx # Wallet connection UI
│   ├── game/              # Phaser game logic
│   │   ├── GameScene.ts      # Main game scene
│   │   └── config.ts         # Phaser configuration
│   ├── utils/             # Utility functions
│   │   └── wallet.ts         # Wallet connection utilities
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main App component
│   ├── App.css            # Global styles
│   └── index.tsx          # Entry point
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🎮 How to Use

### Connecting Wallets

1. **Ronin Wallet**:
   - Click the "Connect Ronin Wallet" button
   - Approve the connection in your Ronin Wallet extension
   - Your wallet address will be displayed

2. **Metamask**:
   - Click the "Connect Metamask" button
   - Approve the connection in your Metamask extension
   - Your wallet address and balance will be displayed

### The Phaser Game

The application features an interactive solar system visualization:
- Central sun with orbiting planets
- Each planet has a unique color and orbit radius
- Planets orbit at different speeds
- Starfield background
- Responsive canvas that scales to fit the screen

## 🔧 Technologies Used

- **React 19**: UI framework
- **TypeScript**: Type-safe development
- **Phaser 3**: 2D game engine
- **@sky-mavis/tanto-connect**: Ronin Wallet integration
- **ethers.js**: Ethereum Web3 library
- **Create React App**: Project scaffolding

## 📦 Key Dependencies

```json
{
  "phaser": "^3.90.0",
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

## 🔒 Security Notes

- Never commit private keys or sensitive data
- Always verify wallet addresses before transactions
- Test on testnets before using mainnet
- Keep your wallet extensions up to date

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

### Game Not Loading
- Clear browser cache
- Check browser console for errors
- Ensure all dependencies are installed (`npm install`)

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

Built with ❤️ using React, Phaser 3, Tanto Connect, and Web3