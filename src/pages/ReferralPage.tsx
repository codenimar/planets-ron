import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ReferralAPI } from '../utils/api';
import { truncateWalletAddress } from '../utils/wallet';
import { Member } from '../utils/localStorage';

interface ReferralStats {
  total_referrals: number;
  referrals_with_claims: number;
  referral_code?: string;
}

const ReferralPage: React.FC = () => {
  const { member } = useAuth();
  const [referrals, setReferrals] = useState<Member[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [referralsRes, statsRes] = await Promise.all([
        ReferralAPI.getReferrals(),
        ReferralAPI.getReferralStats(),
      ]);

      if (referralsRes.success) {
        setReferrals(referralsRes.referrals);
      }
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const referralLink = useMemo(() => {
    const baseUrl = window.location.origin;
    const code = stats?.referral_code || member?.referral_code;
    return code ? `${baseUrl}/?ref=${code}` : '';
  }, [stats?.referral_code, member?.referral_code]);

  const copyReferralLink = () => {
    if (!referralLink) {
      return;
    }
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy to clipboard:', err);
      setError('Failed to copy link. Please try selecting and copying manually.');
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="referral-page">
        <div className="loading">Loading referral data...</div>
      </div>
    );
  }

  return (
    <div className="referral-page">
      <div className="page-header">
        <h1>🤝 Referral Program</h1>
        <p className="page-subtitle">
          Share your referral link and earn 10 points every time your referrals claim a prize!
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {stats && (
        <div className="referral-stats-section">
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{stats.total_referrals}</div>
                <div className="stat-label">Total Referrals</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎁</div>
              <div className="stat-content">
                <div className="stat-value">{stats.referrals_with_claims}</div>
                <div className="stat-label">Referrals with Claims</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="referral-link-section">
        <h2>Your Referral Link</h2>
        <div className="referral-link-container">
          <div className="referral-code-display">
            <span className="code-label">Referral Code:</span>
            <span className="code-value">
              {stats?.referral_code || member?.referral_code || 'Loading...'}
            </span>
          </div>
          <div className="referral-link-display">
            <input
              type="text"
              value={referralLink}
              placeholder={referralLink ? '' : 'Loading your referral code...'}
              readOnly
              className="referral-link-input"
            />
            <button 
              onClick={copyReferralLink} 
              className="btn btn-primary"
              disabled={!referralLink}
            >
              {!referralLink ? 'Loading...' : (copySuccess ? '✓ Copied!' : '📋 Copy Link')}
            </button>
          </div>
        </div>
        <div className="referral-info">
          <p>
            💡 <strong>How it works:</strong> When someone signs up using your referral link,
            you'll earn 10 points every time they claim a prize!
          </p>
        </div>
      </div>

      <div className="referrals-list-section">
        <h2>Your Referrals ({referrals.length})</h2>
        
        {referrals.length === 0 ? (
          <div className="empty-state">
            <p>No referrals yet. Share your referral link to get started!</p>
          </div>
        ) : (
          <div className="referrals-table">
            <table>
              <thead>
                <tr>
                  <th>Wallet Address</th>
                  <th>Points</th>
                  <th>Joined Date</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral.id}>
                    <td className="wallet-address">
                      {truncateWalletAddress(referral.wallet_address)}
                    </td>
                    <td>
                      <span className="points-badge">{referral.points} pts</span>
                    </td>
                    <td>{formatDate(referral.created_at)}</td>
                    <td>{formatDate(referral.last_login)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralPage;
