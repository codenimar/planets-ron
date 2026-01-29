import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { XPostAPI, MessageAPI, FeaturedAssetAPI, WeeklyRewardAPI } from '../utils/api';
import { MemberService } from '../utils/localStorage';
import XHandleSetup from '../components/XHandleSetup';

interface XPost {
  id: string;
  post_url: string;
  image_url: string;
  created_at: string;
  is_active: boolean;
}

interface XPostAction {
  id: string;
  post_id: string;
  action_type: 'follow' | 'like' | 'retweet';
  verified: boolean;
  points_earned: number;
}

interface FeaturedAsset {
  id: string;
  asset_type: 'nft_collection' | 'token';
  name: string;
  contract_address: string;
  required_amount: number;
  bonus_multiplier: number;
}

interface WeeklyReward {
  id: string;
  week_start: string;
  week_end: string;
  item_name: string;
  item_quantity: number;
}

const Dashboard: React.FC = () => {
  const { member, refreshMember } = useAuth();
  const [xPosts, setXPosts] = useState<XPost[]>([]);
  const [myActions, setMyActions] = useState<XPostAction[]>([]);
  const [featuredAssets, setFeaturedAssets] = useState<FeaturedAsset[]>([]);
  const [weeklyReward, setWeeklyReward] = useState<WeeklyReward | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showXHandleSetup, setShowXHandleSetup] = useState(false);
  const [assetVerifying, setAssetVerifying] = useState<string | null>(null);
  const [weeklyActiveMembers, setWeeklyActiveMembers] = useState(0);
  const [memberRanking, setMemberRanking] = useState<number | null>(null);

  // Helper function to get weekly active members
  const getWeeklyActiveMembers = (): number => {
    const allMembers = MemberService.getAll();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyActiveCount = allMembers.filter(m => {
      const lastLogin = new Date(m.last_login);
      return lastLogin >= oneWeekAgo && m.points > 0;
    }).length;
    
    return weeklyActiveCount;
  };

  // Helper function to calculate member ranking
  const getMemberRanking = (): number | null => {
    if (!member) return null;
    
    // Check if current member qualifies for ranking
    if (!member.is_active || member.points <= 0) {
      return null;
    }
    
    const allMembers = MemberService.getAll();
    // Sort members by points in descending order
    const sortedMembers = allMembers
      .filter(m => m.is_active && m.points > 0)
      .sort((a, b) => b.points - a.points);
    
    // Find the member's position (1-indexed)
    const rank = sortedMembers.findIndex(m => m.id === member.id);
    return rank >= 0 ? rank + 1 : null;
  };

  // Helper function to shorten wallet address
  const shortenAddress = (address: string): string => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  useEffect(() => {
    checkXHandle();
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Recalculate stats when member changes
    if (member) {
      calculateStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member]);

  const checkXHandle = () => {
    if (member && !member.x_handle) {
      setShowXHandleSetup(true);
    }
  };

  const calculateStats = () => {
    setWeeklyActiveMembers(getWeeklyActiveMembers());
    setMemberRanking(getMemberRanking());
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [xPostsRes, actionsRes, assetsRes, weeklyRes, unreadRes] = await Promise.all([
        XPostAPI.getAll(),
        XPostAPI.getMyActions(),
        FeaturedAssetAPI.getAll(),
        WeeklyRewardAPI.getCurrent(),
        MessageAPI.getUnreadCount(),
      ]);

      if (xPostsRes.success) {
        setXPosts(xPostsRes.posts || []);
      }
      if (actionsRes.success) {
        setMyActions(actionsRes.actions || []);
      }
      if (assetsRes.success) {
        setFeaturedAssets(assetsRes.assets || []);
      }
      if (weeklyRes.success) {
        setWeeklyReward(weeklyRes.weekly_reward);
      }
      if (unreadRes.success) {
        setUnreadCount(unreadRes.count);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAction = async (postId: string, actionType: 'follow' | 'like' | 'retweet') => {
    setActionLoading(`${postId}-${actionType}`);
    setError('');
    setSuccess('');

    try {
      const response = await XPostAPI.verifyAction(postId, actionType);

      if (response.success) {
        setSuccess(response.message || 'Action verified!');
        await refreshMember();
        await loadDashboard();
        calculateStats(); // Recalculate stats after successful verification
      } else {
        // This shouldn't happen based on API implementation, but handle it just in case
        setError(response.message || 'Verification failed');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify action');
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyAsset = async (assetId: string) => {
    setAssetVerifying(assetId);
    setError('');
    setSuccess('');

    try {
      const response = await FeaturedAssetAPI.verifyAsset(assetId);

      if (response.success) {
        setSuccess(response.message || 'Asset verified!');
        await refreshMember();
        await loadDashboard();
        calculateStats(); // Recalculate stats after successful verification
      } else {
        // Handle non-success responses
        setError(response.message || 'Asset verification failed');
      }
    } catch (err: any) {
      console.error('Asset verification error:', err);
      setError(err.message || 'Failed to verify asset');
    } finally {
      setAssetVerifying(null);
    }
  };

  const hasCompletedAction = (postId: string, actionType: 'follow' | 'like' | 'retweet'): boolean => {
    return myActions.some(a => a.post_id === postId && a.action_type === actionType);
  };

  const getPostActions = (postId: string): XPostAction[] => {
    return myActions.filter(a => a.post_id === postId);
  };

  const handleXHandleComplete = async () => {
    setShowXHandleSetup(false);
    await refreshMember();
  };

  if (showXHandleSetup) {
    return <XHandleSetup onComplete={handleXHandleComplete} />;
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">EARN REWARDS</p>
          <h1>Dashboard</h1>
          <p className="lede">Complete social tasks to earn points and win weekly rewards.</p>
        </div>
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{member?.points || 0}</span>
            <span className="stat-label">Points</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{myActions.length}</span>
            <span className="stat-label">Tasks Completed</span>
          </div>
          {member?.x_handle && (
            <div className="stat-card">
              <span className="stat-value" style={{ fontSize: '1.25rem' }}>@{member.x_handle}</span>
              <span className="stat-label">X.com Handle</span>
            </div>
          )}
          {member?.wallet_address && (
            <div className="stat-card">
              <span className="stat-value" style={{ fontSize: '1.25rem' }}>{shortenAddress(member.wallet_address)}</span>
              <span className="stat-label">Ronin Address</span>
            </div>
          )}
          {memberRanking !== null && (
            <div className="stat-card">
              <span className="stat-value">#{memberRanking}</span>
              <span className="stat-label">Your Ranking</span>
            </div>
          )}
          <div className="stat-card">
            <span className="stat-value">{weeklyActiveMembers}</span>
            <span className="stat-label">Weekly Active</span>
          </div>
          {unreadCount > 0 && (
            <div className="stat-card">
              <Link to="/mailbox" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="stat-value">{unreadCount}</span>
                <span className="stat-label">Unread Messages</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message" style={{ 
          padding: '1rem', 
          marginBottom: '1rem',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '8px',
          color: '#86efac',
        }}>
          {success}
        </div>
      )}

      {weeklyReward && (
        <div className="panel" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', border: '1px solid rgba(102, 126, 234, 0.3)' }}>
          <h2>🏆 This Week's Reward</h2>
          <p style={{ fontSize: '1.25rem', margin: '0.5rem 0' }}>
            <strong>{weeklyReward.item_name}</strong>
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {weeklyReward.item_quantity} winners will be selected at the end of the week
          </p>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            Week ends: {new Date(weeklyReward.week_end).toLocaleDateString()}
          </p>
        </div>
      )}

      {featuredAssets.length > 0 && (
        <div className="panel" style={{ marginBottom: '2rem' }}>
          <h2>⚡ Bonus Points</h2>
          <p className="lede" style={{ marginBottom: '1rem' }}>
            Hold featured NFTs or tokens to earn 2x points (1 extra point per action)
          </p>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {featuredAssets.map(asset => (
              <div key={asset.id} className="card" style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{asset.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
                  {asset.asset_type === 'nft_collection' 
                    ? `Hold ${asset.required_amount}+ NFT${asset.required_amount > 1 ? 's' : ''}`
                    : `Hold ${asset.required_amount.toLocaleString()}+ tokens`
                  }
                </p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', wordBreak: 'break-all', marginBottom: '1rem' }}>
                  {asset.contract_address}
                </p>
                <button
                  className="cta pill primary"
                  onClick={() => handleVerifyAsset(asset.id)}
                  disabled={assetVerifying === asset.id}
                >
                  {assetVerifying === asset.id ? 'Verifying...' : 'Verify Holdings'}
                </button>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.5rem' }}>
                  1 hour cooldown between verifications
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="panel">
        <h2>📋 Available Tasks</h2>
        <p className="lede" style={{ marginBottom: '1rem' }}>
          Complete actions on X.com to earn points. Each action is worth 1 point (2 points with bonus).
        </p>
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1.5rem',
          background: 'rgba(102, 126, 234, 0.1)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '8px',
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.6' }}>
            <strong>How it works:</strong><br/>
            1. Click "View Post on X.com" to open the post<br/>
            2. Follow the account, like the post, and retweet it on X.com<br/>
            3. Return here and click the verify buttons to claim your points<br/>
            <em style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Note: Our system will check X.com API to verify you actually completed each action.</em>
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : xPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            <p>No tasks available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {xPosts.map(post => {
              const postActions = getPostActions(post.id);
              const completedCount = postActions.length;
              const totalPoints = postActions.reduce((sum, a) => sum + a.points_earned, 0);

              return (
                <div key={post.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    {post.image_url && (
                      <div style={{ flex: '0 0 200px' }}>
                        <img 
                          src={post.image_url} 
                          alt="Post preview"
                          style={{ 
                            width: '100%', 
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                        />
                      </div>
                    )}
                    <div style={{ flex: '1', minWidth: '200px' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <a 
                          href={post.post_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#667eea', 
                            textDecoration: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
                        >
                          View Post on X.com →
                        </a>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <button
                          className={`cta pill ${hasCompletedAction(post.id, 'follow') ? 'ghost' : 'primary'}`}
                          onClick={() => handleVerifyAction(post.id, 'follow')}
                          disabled={hasCompletedAction(post.id, 'follow') || actionLoading === `${post.id}-follow`}
                          title="Click to verify you've followed on X.com"
                        >
                          {actionLoading === `${post.id}-follow` 
                            ? '⏳ Verifying...' 
                            : hasCompletedAction(post.id, 'follow') 
                              ? '✓ Followed' 
                              : '👤 Verify Follow'}
                        </button>
                        <button
                          className={`cta pill ${hasCompletedAction(post.id, 'like') ? 'ghost' : 'primary'}`}
                          onClick={() => handleVerifyAction(post.id, 'like')}
                          disabled={hasCompletedAction(post.id, 'like') || actionLoading === `${post.id}-like`}
                          title="Click to verify you've liked on X.com"
                        >
                          {actionLoading === `${post.id}-like` 
                            ? '⏳ Verifying...' 
                            : hasCompletedAction(post.id, 'like') 
                              ? '✓ Liked' 
                              : '❤️ Verify Like'}
                        </button>
                        <button
                          className={`cta pill ${hasCompletedAction(post.id, 'retweet') ? 'ghost' : 'primary'}`}
                          onClick={() => handleVerifyAction(post.id, 'retweet')}
                          disabled={hasCompletedAction(post.id, 'retweet') || actionLoading === `${post.id}-retweet`}
                          title="Click to verify you've retweeted on X.com"
                        >
                          {actionLoading === `${post.id}-retweet` 
                            ? '⏳ Verifying...' 
                            : hasCompletedAction(post.id, 'retweet') 
                              ? '✓ Retweeted' 
                              : '🔄 Verify Retweet'}
                        </button>
                      </div>

                      {completedCount > 0 && (
                        <p style={{ fontSize: '0.875rem', color: '#86efac' }}>
                          ✓ Completed {completedCount}/3 actions • Earned {totalPoints} points
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .stats-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 120px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
          margin-top: 0.5rem;
        }

        .card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(102, 126, 234, 0.3);
        }

        .error-message {
          padding: 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          borderRadius: 8px;
          color: #f87171;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
