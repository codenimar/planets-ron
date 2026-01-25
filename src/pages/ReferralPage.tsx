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
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
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

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">GROW</p>
          <h1>Referral Program</h1>
          <p className="lede">Share your link. Earn every time your network claims rewards.</p>
        </div>
        <div className="glow-pill">
          <span className="dot-pulse"></span>
          On-chain referrals
        </div>
      </div>

      {loading ? (
        <div className="card-panel center">
          <div className="loading-spinner"></div>
          <p>Loading referral data...</p>
        </div>
      ) : (
        <>
          {error && <div className="banner error">{error}</div>}

          {stats && (
            <div className="stat-grid">
              <div className="stat-tile">
                <div className="stat-label">Total Referrals</div>
                <div className="stat-number">{stats.total_referrals}</div>
                <div className="stat-sub">People who used your link</div>
              </div>
              <div className="stat-tile">
                <div className="stat-label">Referrals with Claims</div>
                <div className="stat-number">{stats.referrals_with_claims}</div>
                <div className="stat-sub">Earn 10 pts each claim</div>
              </div>
            </div>
          )}

          <div className="card-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">YOUR LINK</p>
                <h2>Invite & Earn</h2>
              </div>
            </div>
            <div className="link-row">
              <div className="code-chip">
                <span>Referral Code</span>
                <strong>{stats?.referral_code || member?.referral_code || 'Not ready'}</strong>
              </div>
              <div className="input-chip">
                <input
                  type="text"
                  value={referralLink}
                  placeholder={referralLink ? '' : 'Referral code not generated yet'}
                  readOnly
                />
                <button
                  onClick={copyReferralLink}
                  className="cta"
                  disabled={!referralLink}
                >
                  {!referralLink ? 'Generate link' : (copySuccess ? '✓ Copied!' : '📋 Copy Link')}
                </button>
              </div>
            </div>
            <p className="muted">
              Earn 10 points whenever a referred user claims a prize. Share with your community and track their activity below.
            </p>
          </div>

          <div className="section-head">
            <div>
              <p className="eyebrow">PERFORMANCE</p>
              <h2>Your Referrals ({referrals.length})</h2>
            </div>
          </div>

          {referrals.length === 0 ? (
            <div className="card-panel center">
              <p>No referrals yet. Share your referral link to get started!</p>
            </div>
          ) : (
            <div className="referral-cards">
              {referrals.map((referral) => (
                <div key={referral.id} className="referral-card">
                  <div>
                    <p className="eyebrow">Wallet</p>
                    <h4>{truncateWalletAddress(referral.wallet_address)}</h4>
                    <p className="muted">Joined {formatDate(referral.created_at)}</p>
                  </div>
                  <div className="referral-meta">
                    <span className="chip">Points: {referral.points}</span>
                    <span className="chip">Last login: {formatDate(referral.last_login)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReferralPage;
