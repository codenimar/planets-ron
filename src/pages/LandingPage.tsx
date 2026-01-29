import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WalletConnect from '../components/WalletConnect';

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
          <p className="eyebrow">EARN REWARDS ON X.COM</p>
          <h1>Get rewarded for engaging with X posts</h1>
          <p className="lede">
            Complete social tasks, earn points, and win weekly prizes. Connect your Ronin wallet and X.com handle to start earning today.
          </p>
          <div className="hero-actions">
            <button className="cta primary" onClick={() => document.getElementById('wallet-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Get Started
            </button>
            <a href="#how-it-works" className="cta ghost">Learn More</a>
          </div>
          <div className="hero-metrics">
            <div>
              <span className="metric-value">1-2</span>
              <span className="metric-label">Points per action</span>
            </div>
            <div>
              <span className="metric-value">3</span>
              <span className="metric-label">Actions per post</span>
            </div>
            <div>
              <span className="metric-value">Weekly</span>
              <span className="metric-label">Prize draws</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card">
            <div className="card-top">
              <span className="badge">Live Task</span>
              <span className="dot-pulse"></span>
            </div>
            <div className="card-body">
              <h3>Follow, Like, Retweet</h3>
              <p>Complete all three actions on our X posts to maximize your points and increase your chances of winning weekly rewards.</p>
              <div className="progress">
                <div className="progress-bar" style={{ width: '66%' }} />
              </div>
              <div className="card-metrics">
                <div>
                  <span className="metric-value">3</span>
                  <span className="metric-label">Actions per post</span>
                </div>
                <div>
                  <span className="metric-value">+1</span>
                  <span className="metric-label">Pts per action</span>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <button className="cta pill" onClick={() => document.getElementById('wallet-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Start Earning
              </button>
            </div>
          </div>
          <div className="glow orb-a"></div>
          <div className="glow orb-b"></div>
        </div>
      </div>

      <section className="panel-grid" id="how-it-works">
        <div className="panel">
          <div className="panel-icon">🎯</div>
          <h3>Complete Tasks</h3>
          <p>Follow, like, and retweet X posts to earn points. Each action earns you 1 point (2 with bonus).</p>
          <div className="chip-row">
            <span className="chip">Follow</span>
            <span className="chip">Like</span>
            <span className="chip">Retweet</span>
          </div>
        </div>
        <div className="panel">
          <div className="panel-icon">⚡</div>
          <h3>Earn Bonus Points</h3>
          <p>Hold featured NFTs or tokens to earn 2x points on all actions.</p>
          <div className="chip-row">
            <span className="chip">NFT Collections</span>
            <span className="chip">Featured Tokens</span>
            <span className="chip">1 hour cooldown</span>
          </div>
        </div>
        <div className="panel">
          <div className="panel-icon">🏆</div>
          <h3>Win Weekly Prizes</h3>
          <p>Top point earners each week win exclusive rewards and prizes.</p>
          <div className="chip-row">
            <span className="chip">Weekly draws</span>
            <span className="chip">Top earners</span>
            <span className="chip">Auto-selected</span>
          </div>
        </div>
        <div className="panel">
          <div className="panel-icon">👥</div>
          <h3>Refer & Earn</h3>
          <p>Earn 1 point for every retweet your referrals complete. Build your network, increase your earnings.</p>
          <div className="chip-row">
            <span className="chip">Referral links</span>
            <span className="chip">Bonus points</span>
            <span className="chip">Grow together</span>
          </div>
        </div>
      </section>

      <section className="cta-section" id="wallet-section">
        <div className="cta-content">
          <h2>Ready to start earning?</h2>
          <p>Connect your Ronin wallet and X.com handle to begin completing tasks and earning rewards.</p>
          <WalletConnect />
        </div>
      </section>

      <section className="features-section">
        <h2>Why Choose Our Platform?</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>🔒 Secure & Trustless</h3>
            <p>Connect with your Ronin wallet. No passwords, no email required. Your assets remain in your control.</p>
          </div>
          <div className="feature">
            <h3>💰 Fair Rewards</h3>
            <p>Transparent point system. Top earners automatically selected as winners each week.</p>
          </div>
          <div className="feature">
            <h3>📱 Easy to Use</h3>
            <p>Simple interface, clear tasks, instant verification. Start earning in minutes.</p>
          </div>
          <div className="feature">
            <h3>🎮 Community Driven</h3>
            <p>Built for the Ronin ecosystem. Support the community while earning rewards.</p>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>How do I earn points?</h4>
            <p>Connect your wallet and X.com handle, then complete social tasks (follow, like, retweet) on featured X posts. Each action earns you 1 point, or 2 points if you hold featured assets.</p>
          </div>
          <div className="faq-item">
            <h4>What are featured assets?</h4>
            <p>Featured assets are specific NFT collections or tokens that give you bonus points. Hold the required amount and verify your holdings to earn 2x points on all actions.</p>
          </div>
          <div className="faq-item">
            <h4>How are weekly winners selected?</h4>
            <p>At the end of each week, the top point earners are automatically selected as winners. The number of winners depends on the weekly prize pool.</p>
          </div>
          <div className="faq-item">
            <h4>What is the referral program?</h4>
            <p>Share your referral link with friends. When they sign up and complete retweet tasks, you earn 1 point for each retweet they verify.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Platform</h4>
            <a href="/terms">Terms of Service</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="https://x.com/planetronin" target="_blank" rel="noopener noreferrer">Contact</a>
          </div>
          <div className="footer-section">
            <h4>Community</h4>
            <a href="https://x.com/planetronin" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
            <a href="/referral">Referral Program</a>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <a href="#how-it-works">How It Works</a>
            <a href="https://explorer.roninchain.com" target="_blank" rel="noopener noreferrer">Ronin Explorer</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 RoninAds. Built for the Ronin ecosystem.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
