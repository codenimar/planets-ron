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
  }

  return (
    <div className="landing-page">
      <div className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow">RONIN ADS PLATFORM</p>
          <h1>Monetize attention with interactive, reward-first ads.</h1>
          <p className="lede">
            Viewers earn instantly. Publishers launch in minutes. Admins moderate with trustless controls.
          </p>
          <div className="hero-actions">
            <button className="cta primary" onClick={() => navigate('/dashboard')}>Launch App</button>
            <button className="cta ghost" onClick={() => document.getElementById('wallet-section')?.scrollIntoView({ behavior: 'smooth' })}>Connect Wallet</button>
          </div>
          <div className="hero-metrics">
            <div>
              <span className="metric-value">10s</span>
              <span className="metric-label">To earn per view</span>
            </div>
            <div>
              <span className="metric-value">3</span>
              <span className="metric-label">Pass tiers</span>
            </div>
            <div>
              <span className="metric-value">24h</span>
              <span className="metric-label">Fair cooldown</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card">
            <div className="card-top">
              <span className="badge">Live Campaign</span>
              <span className="dot-pulse"></span>
            </div>
            <div className="card-body">
              <h3>Axie Origins Launch</h3>
              <p>Boost your reach to high-intent Ronin players with on-chain proof of view.</p>
              <div className="progress">
                <div className="progress-bar" style={{ width: '68%' }} />
              </div>
              <div className="card-metrics">
                <div>
                  <span className="metric-value">12.4k</span>
                  <span className="metric-label">Verified views</span>
                </div>
                <div>
                  <span className="metric-value">+31</span>
                  <span className="metric-label">Pts with Golden Pass</span>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button className="cta pill">View demo</button>
              <button className="cta pill ghost">Create ad</button>
            </div>
          </div>
          <div className="glow orb-a"></div>
          <div className="glow orb-b"></div>
        </div>
      </div>

      <section className="panel-grid">
        <div className="panel">
          <div className="panel-icon">👀</div>
          <h3>Watch & Earn</h3>
          <p>Every qualified 10s view pays out instantly, stacked with NFT & pass bonuses.</p>
          <div className="chip-row">
            <span className="chip">1 base pt</span>
            <span className="chip">+10/20/30 pass bonus</span>
            <span className="chip">NFT collection boosts</span>
          </div>
        </div>
        <div className="panel">
          <div className="panel-icon">🚀</div>
          <h3>Launch Faster</h3>
          <p>Create, review, and activate campaigns in minutes with admin safeguards.</p>
          <div className="chip-row">
            <span className="chip">Publisher Pass gated</span>
            <span className="chip">Auto-approve for admins</span>
            <span className="chip">Expiry controls</span>
          </div>
        </div>
        <div className="panel">
          <div className="panel-icon">🎁</div>
          <h3>Rewards That Stick</h3>
          <p>Claim NFTs, tokens, and passes directly inside the experience—no extra steps.</p>
          <div className="chip-row">
            <span className="chip">Instant claim flow</span>
            <span className="chip">Inventory aware</span>
            <span className="chip">History tracking</span>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div>
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>Engage. Verify. Reward.</h2>
          <p className="lede">Transparent view verification with cooldowns, pass multipliers, and NFT boosts—optimized for Ronin.</p>
        </div>
        <div className="stepper">
          {['Connect wallet', 'View for 10s', 'Earn & boost', 'Claim rewards'].map((step, idx) => (
            <div key={step} className="step-card">
              <div className="step-index">{idx + 1}</div>
              <div>
                <h4>{step}</h4>
                <p>{['Ronin, Waypoint, or Metamask in seconds.','Fair, anti-spam timers to keep views real.','Pass tiers + NFT sets compound your earnings.','Redeem tokens, NFTs, or passes without leaving.'][idx]}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="wallet-section" className="wallet-shell">
        <div className="card-split">
          <div className="card-copy">
            <p className="eyebrow">WALLET LOGIN</p>
            <h3>Secure by design. No backend needed.</h3>
            <p className="lede">Everything runs locally with session tokens. First wallet becomes admin—perfect for demos.</p>
            <ul className="bullet-grid">
              <li>Supports Ronin, Waypoint, and Metamask</li>
              <li>Session-aware navigation & protected routes</li>
              <li>Instant logout with token cleanup</li>
            </ul>
          </div>
          <div className="card-ui">
            <WalletConnect />
          </div>
        </div>
      </section>

      <section className="data-shell">
        <div className="data-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">LIVE DISTRIBUTIONS</p>
              <h3>Proof your campaign is paying out.</h3>
            </div>
            <button className="cta ghost" onClick={() => navigate('/rewards')}>View rewards</button>
          </div>
          <RecentDistributions />
        </div>
      </section>

      <footer className="landing-footer">
        <div>
          <p>Secure wallet authentication on the Ronin Network</p>
          <p className="muted">Built for community growth with instant rewards.</p>
        </div>
        <div className="footer-actions">
          <a href="https://x.com/planetronin" target="_blank" rel="noopener noreferrer" className="cta pill">Follow on X</a>
          <button className="cta pill ghost" onClick={() => navigate('/dashboard')}>Go to dashboard</button>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
