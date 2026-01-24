import React from 'react';
import './App.css';
import PhaserGame from './components/PhaserGame';
import WalletConnect from './components/WalletConnect';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🪐 Planets Ron</h1>
        <p className="subtitle">
          A React + Phaser 3 game with Ronin Wallet & Metamask integration
        </p>
      </header>

      <main className="App-main">
        <section className="game-section">
          <PhaserGame />
        </section>

        <section className="wallet-section">
          <WalletConnect />
        </section>
      </main>

      <footer className="App-footer">
        <p>Built with React, Phaser 3, Tanto Connect, and Web3</p>
      </footer>
    </div>
  );
}

export default App;
