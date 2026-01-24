import React from 'react';
import './App.css';
import WalletConnect from './components/WalletConnect';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🔐 Wallet Login</h1>
        <p className="subtitle">
          Connect your Ronin Wallet or Metamask
        </p>
      </header>

      <main className="App-main">
        <section className="wallet-section">
          <WalletConnect />
        </section>
      </main>

      <footer className="App-footer">
        <p>Secure wallet authentication with Tanto Connect and Web3</p>
      </footer>
    </div>
  );
}

export default App;
