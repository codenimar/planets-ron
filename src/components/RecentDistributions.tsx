import React, { useState, useEffect } from 'react';
import { AdminAPI } from '../utils/api';

interface RewardDistribution {
  id: string;
  reward_id: string;
  member_id: string;
  distributed_at: string;
  notes: string;
  reward?: {
    name: string;
    reward_type: string;
  } | null;
  member?: {
    wallet_address: string;
  } | null;
}

const RecentDistributions: React.FC = () => {
  const [distributions, setDistributions] = useState<RewardDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDistributions();
  }, []);

  const loadDistributions = async () => {
    try {
      const response = await AdminAPI.getRecentDistributions(5);
      if (response.success) {
        setDistributions(response.distributions);
      }
    } catch (err) {
      console.error('Failed to load distributions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      const h = Math.floor(hours);
      return `${h} hour${h !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const shortenAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (distributions.length === 0) {
    return null; // Don't show section if no distributions
  }

  return (
    <section className="recent-distributions">
      <h2>🎁 Recent Reward Distributions</h2>
      <div className="distribution-list">
        {distributions.map((dist) => (
          <div key={dist.id} className="distribution-item">
            <div className="distribution-info">
              <div className="distribution-reward">
                {dist.reward?.name || 'Unknown Reward'} ({dist.reward?.reward_type})
              </div>
              <div style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                Sent to {shortenAddress(dist.member?.wallet_address || '')}
              </div>
            </div>
            <div className="distribution-time">
              {formatTime(dist.distributed_at)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentDistributions;
