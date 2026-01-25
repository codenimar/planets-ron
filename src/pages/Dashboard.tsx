import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiCall, API_ENDPOINTS } from '../utils/api';

interface Post {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  link_url?: string;
  publisher_id: number;
  publisher_wallet: string;
  status: string;
  created_at: string;
  expires_at: string;
  views_count: number;
  can_view: boolean;
  next_view_time?: string;
}

interface Stats {
  total_points: number;
  total_views: number;
  click_pass_bonus: number;
  nft_bonuses: any[];
}

const Dashboard: React.FC = () => {
  const { member, refreshMember } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [postsRes, statsRes] = await Promise.all([
        apiCall(API_ENDPOINTS.POSTS_LIST),
        apiCall(API_ENDPOINTS.MEMBER_STATS),
      ]);

      if (postsRes.success) {
        setPosts(postsRes.posts || []);
      }
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPost = async (postId: number) => {
    setViewing(postId);
    setTimer(10);
    setError('');
    setSuccess('');

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          completeView(postId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeView = async (postId: number) => {
    try {
      const response = await apiCall(API_ENDPOINTS.POST_VIEW, {
        method: 'POST',
        body: JSON.stringify({ post_id: postId }),
      });

      if (response.success) {
        const pointsEarned = response.points_earned || 1;
        setSuccess(`You earned ${pointsEarned} points! 🎉`);
        await refreshMember();
        await loadDashboard();
      } else {
        setError(response.error || 'Failed to complete view');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete view');
    } finally {
      setViewing(null);
      setTimer(0);
    }
  };

  const formatTimeRemaining = (timestamp: string) => {
    const now = new Date().getTime();
    const target = new Date(timestamp).getTime();
    const diff = target - now;

    if (diff <= 0) return 'Available now';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">💎</div>
            <div className="stat-content">
              <div className="stat-value">{member?.points || 0}</div>
              <div className="stat-label">Total Points</div>
            </div>
          </div>
          {stats && (
            <>
              <div className="stat-card">
                <div className="stat-icon">👁️</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.total_views}</div>
                  <div className="stat-label">Total Views</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🚀</div>
                <div className="stat-content">
                  <div className="stat-value">+{stats.click_pass_bonus}%</div>
                  <div className="stat-label">Click Pass Bonus</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="posts-feed">
        <h2>📢 Posts Feed</h2>
        
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>No posts available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post.id} className="post-card">
                {post.image_url && (
                  <div className="post-image">
                    <img src={post.image_url} alt={post.title} />
                  </div>
                )}
                <div className="post-content">
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  
                  <div className="post-meta">
                    <span className="post-views">👁️ {post.views_count} views</span>
                    <span className="post-publisher">
                      By {post.publisher_wallet.slice(0, 6)}...{post.publisher_wallet.slice(-4)}
                    </span>
                  </div>

                  {viewing === post.id ? (
                    <div className="viewing-timer">
                      <div className="timer-circle">{timer}</div>
                      <p>Keep watching to earn points...</p>
                    </div>
                  ) : post.can_view ? (
                    <button 
                      onClick={() => handleViewPost(post.id)} 
                      className="view-button"
                      disabled={viewing !== null}
                    >
                      👀 View & Earn Points
                    </button>
                  ) : (
                    <div className="post-locked">
                      <p>⏰ Available in {post.next_view_time ? formatTimeRemaining(post.next_view_time) : '24 hours'}</p>
                    </div>
                  )}

                  {post.link_url && viewing === post.id && timer <= 5 && (
                    <a 
                      href={post.link_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="post-link"
                    >
                      🔗 Visit Link
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
