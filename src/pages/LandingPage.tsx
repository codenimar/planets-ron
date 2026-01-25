import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WalletConnect from '../components/WalletConnect';
import RecentDistributions from '../components/RecentDistributions';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>🪙 Welcome to RoninAds</h1>
        <p className="landing-subtitle">
          Earn rewards by viewing ads. Publish your content to reach engaged users.
        </p>
      </header>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">👀</div>
          <h3>View & Earn</h3>
          <p>Watch ads for 10 seconds and earn points. Boost earnings with Click Pass NFTs!</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📢</div>
          <h3>Publish Ads</h3>
          <p>Have a Publisher Pass? Create up to 3 ads and reach thousands of users.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎁</div>
          <h3>Claim Rewards</h3>
          <p>Exchange your earned points for NFTs, tokens, and other exciting rewards.</p>
        </div>
      </section>

      <section className="wallet-section">
        <WalletConnect />
      </section>

      <section className="info-section">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Connect Wallet</h4>
            <p>Connect your Ronin Wallet or Metamask to get started</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>View Posts</h4>
            <p>Browse the feed and watch ads for 10 seconds each</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Earn Points</h4>
            <p>Earn 1 point per view + bonus from Click Pass NFTs</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h4>Claim Rewards</h4>
            <p>Exchange points for NFTs, tokens, and more</p>
          </div>
        </div>
      </section>

      <RecentDistributions />

      <footer className="landing-footer">
        <p>Secure wallet authentication on the Ronin Network</p>
        <p>
          <a href="https://x.com/planetronin" target="_blank" rel="noopener noreferrer">
            Follow us on X
          </a>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
