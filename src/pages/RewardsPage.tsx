import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiCall, API_ENDPOINTS } from '../utils/api';

interface Reward {
  id: number;
  name: string;
  description: string;
  points_cost: number;
  reward_type: string;
  image_url?: string;
  quantity_available: number;
  quantity_total: number;
}

interface Claim {
  id: number;
  reward_id: number;
  reward_name: string;
  points_spent: number;
  status: string;
  claimed_at: string;
  fulfilled_at?: string;
}

const RewardsPage: React.FC = () => {
  const { member, refreshMember } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<number | null>(null);
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
        apiCall(API_ENDPOINTS.REWARDS_LIST),
        apiCall(API_ENDPOINTS.MY_CLAIMS),
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

  const handleClaimReward = async (rewardId: number, pointsCost: number) => {
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
        const response = await apiCall(API_ENDPOINTS.REWARD_CLAIM, {
          method: 'POST',
          body: JSON.stringify({ reward_id: rewardId }),
        });

        if (response.success) {
          setSuccess('Reward claimed successfully! Status: Pending fulfillment.');
          await refreshMember();
          await loadRewards();
          setActiveTab('history');
        } else {
          setError(response.error || 'Failed to claim reward');
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
      fulfilled: { color: '#27ae60', text: '✅ Fulfilled' },
      cancelled: { color: '#e74c3c', text: '❌ Cancelled' },
    };
    const badge = badges[status] || badges.pending;
    return <span className="status-badge" style={{ color: badge.color }}>{badge.text}</span>;
  };

  if (loading) {
    return (
      <div className="rewards-page">
        <div className="loading">Loading rewards...</div>
      </div>
    );
  }

  return (
    <div className="rewards-page">
      <div className="rewards-header">
        <h1>🎁 Rewards</h1>
        <div className="points-display">
          <span className="points-label">Your Points:</span>
          <span className="points-value">💎 {member?.points || 0}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          🛍️ Available Rewards
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 Claim History
        </button>
      </div>

      {activeTab === 'available' && (
        <div className="rewards-grid">
          {rewards.length === 0 ? (
            <div className="empty-state">
              <p>No rewards available at the moment. Check back soon!</p>
            </div>
          ) : (
            rewards.map((reward) => (
              <div key={reward.id} className="reward-card">
                {reward.image_url ? (
                  <div className="reward-image">
                    <img src={reward.image_url} alt={reward.name} />
                  </div>
                ) : (
                  <div className="reward-icon">
                    {getRewardTypeIcon(reward.reward_type)}
                  </div>
                )}
                <div className="reward-content">
                  <h3>{reward.name}</h3>
                  <p>{reward.description}</p>
                  
                  <div className="reward-info">
                    <div className="reward-cost">
                      💎 {reward.points_cost} points
                    </div>
                    <div className="reward-availability">
                      📦 {reward.quantity_available} / {reward.quantity_total} available
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaimReward(reward.id, reward.points_cost)}
                    className="claim-button"
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
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="claims-list">
          {claims.length === 0 ? (
            <div className="empty-state">
              <p>You haven't claimed any rewards yet. Check out the available rewards!</p>
            </div>
          ) : (
            <div className="claims-grid">
              {claims.map((claim) => (
                <div key={claim.id} className="claim-card">
                  <div className="claim-header">
                    <h3>{claim.reward_name}</h3>
                    {getStatusBadge(claim.status)}
                  </div>
                  <div className="claim-details">
                    <p><strong>Points Spent:</strong> 💎 {claim.points_spent}</p>
                    <p><strong>Claimed:</strong> {new Date(claim.claimed_at).toLocaleString()}</p>
                    {claim.fulfilled_at && (
                      <p><strong>Fulfilled:</strong> {new Date(claim.fulfilled_at).toLocaleString()}</p>
                    )}
                  </div>
                  {claim.status === 'pending' && (
                    <div className="claim-note">
                      <p>ℹ️ Your reward claim is being processed. You'll be notified once it's fulfilled.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RewardsPage;
