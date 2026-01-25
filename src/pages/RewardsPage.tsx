import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RewardAPI } from '../utils/api';
import { Reward, RewardClaim } from '../utils/localStorage';

interface ClaimWithReward extends RewardClaim {
  reward: Reward | null;
}

const RewardsPage: React.FC = () => {
  const { member, refreshMember } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<ClaimWithReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        RewardAPI.list(),
        RewardAPI.myClaims(),
      ]);

      if (results[0].status === 'fulfilled' && results[0].value.success) {
        setRewards(results[0].value.rewards || []);
      }
      if (results[1].status === 'fulfilled' && results[1].value.success) {
        setClaims(results[1].value.claims || []);
      }
      
      // If both failed, show error
      if (results.every(r => r.status === 'rejected')) {
        throw new Error('Failed to load rewards data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (rewardId: string, pointsCost: number) => {
    if (!member) return;

    if (member.points < pointsCost) {
      setError(`You don't have enough points. Need ${pointsCost}, have ${member.points}`);
      return;
    }

    if (window.confirm(`Claim this reward for ${pointsCost} points?`)) {
      setClaiming(rewardId);
      setError('');
      setSuccess('');

      try {
        const response = await RewardAPI.claim(rewardId);

        if (response.success) {
          setSuccess('Reward claimed successfully! Status: Pending fulfillment.');
          await refreshMember();
          await loadRewards();
          setActiveTab('history');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to claim reward');
      } finally {
        setClaiming(null);
      }
    }
  };

  const getRewardTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      nft: '🎨',
      token: '🪙',
      pass: '🎫',
      other: '🎁',
    };
    return icons[type] || '🎁';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      pending: { color: '#f39c12', text: '⏳ Pending' },
      sent: { color: '#27ae60', text: '✅ Sent' },
      cancelled: { color: '#e74c3c', text: '❌ Cancelled' },
    };
    const badge = badges[status] || badges.pending;
    return <span className="status-badge" style={{ color: badge.color }}>{badge.text}</span>;
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">REDEEM</p>
          <h1>Rewards</h1>
          <p className="lede">Exchange points for NFTs, tokens, and passes—inventory aware and instant.</p>
        </div>
        <div className="glow-pill">
          <span className="dot-pulse"></span>
          Balance: {member?.points || 0} pts
        </div>
      </div>

      {loading ? (
        <div className="card-panel center">
          <div className="loading-spinner"></div>
          <p>Loading rewards...</p>
        </div>
      ) : (
        <>
          {error && <div className="banner error">{error}</div>}
          {success && <div className="banner success">{success}</div>}

          <div className="tab-strip">
            <button
              className={activeTab === 'available' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('available')}
            >
              🛍️ Available Rewards
            </button>
            <button
              className={activeTab === 'history' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('history')}
            >
              📜 Claim History
            </button>
          </div>

          {activeTab === 'available' && (
            <div className="rewards-grid modern">
              {rewards.length === 0 ? (
                <div className="card-panel center">
                  <p>No rewards available at the moment. Check back soon!</p>
                </div>
              ) : (
                rewards.map((reward) => (
                  <div key={reward.id} className="reward-card neo">
                    <div className="reward-top">
                      <div className="reward-icon">
                        {reward.image_url ? (
                          <img src={reward.image_url} alt={reward.name} />
                        ) : (
                          getRewardTypeIcon(reward.reward_type)
                        )}
                      </div>
                      <div>
                        <p className="eyebrow">{reward.reward_type}</p>
                        <h3>{reward.name}</h3>
                        <p className="muted">{reward.description}</p>
                      </div>
                    </div>
                    <div className="reward-meta">
                      <span className="chip">Cost: {reward.points_cost} pts</span>
                      <span className="chip">Available: {reward.quantity_available}</span>
                    </div>
                    <button
                      onClick={() => handleClaimReward(reward.id, reward.points_cost)}
                      className="cta full"
                      disabled={
                        claiming === reward.id ||
                        (member?.points || 0) < reward.points_cost ||
                        reward.quantity_available <= 0
                      }
                    >
                      {claiming === reward.id
                        ? '⏳ Claiming...'
                        : reward.quantity_available <= 0
                        ? '❌ Out of Stock'
                        : (member?.points || 0) < reward.points_cost
                        ? '🔒 Not Enough Points'
                        : '🎁 Claim Reward'}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="claims-grid modern">
              {claims.length === 0 ? (
                <div className="card-panel center">
                  <p>You haven't claimed any rewards yet. Check out the available rewards!</p>
                </div>
              ) : (
                claims.map((claim) => (
                  <div key={claim.id} className="claim-card neo">
                    <div className="claim-header">
                      <div>
                        <p className="eyebrow">{claim.reward?.reward_type || 'N/A'}</p>
                        <h3>{claim.reward?.name || 'Unknown Reward'}</h3>
                      </div>
                      {getStatusBadge(claim.status)}
                    </div>
                    <p className="muted">{claim.reward?.description}</p>
                    <div className="claim-meta">
                      <span className="chip">Spent: {claim.points_spent} pts</span>
                      <span className="chip">
                        Claimed: {new Date(claim.claimed_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="claim-note">
                      Status updates are handled by admins. You'll be notified when your reward is sent.
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RewardsPage;
