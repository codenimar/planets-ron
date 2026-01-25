import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PostAPI, MemberAPI } from '../utils/api';
import { Post, ClickPass, PublisherPass } from '../utils/localStorage';
import Mailbox from '../components/Mailbox';

interface Stats {
  total_points: number;
  total_views: number;
  total_claims: number;
  click_pass: ClickPass | null;
  publisher_pass: PublisherPass | null;
}

const Dashboard: React.FC = () => {
  const { member, refreshMember } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<string | null>(null);
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
        PostAPI.list(),
        MemberAPI.getStats(),
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

  const handleViewPost = async (postId: string) => {
    setViewing(postId);
    setTimer(10);
    setError('');
    setSuccess('');

    const countdown = setInterval(() => {
      setTimer((prev: number) => {
        if (prev <= 1) {
          clearInterval(countdown);
          completeView(postId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeView = async (postId: string) => {
    try {
      const response = await PostAPI.view(postId, 10);

      if (response.success) {
        const pointsEarned = response.points_earned || 1;
        setSuccess(`You earned ${pointsEarned} points! 🎉`);
        await refreshMember();
        await loadDashboard();
      } else {
        setError('Failed to complete view');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete view');
    } finally {
      setViewing(null);
      setTimer(0);
    }
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
                <div className="stat-icon">🎁</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.total_claims}</div>
                  <div className="stat-label">Rewards Claimed</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <Mailbox />

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
                <div className="post-content">
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                  
                  <div className="post-meta">
                    <span className="post-type">{post.post_type}</span>
                    <span className="post-status">{post.status}</span>
                  </div>

                  {viewing === post.id ? (
                    <div className="viewing-timer">
                      <div className="timer-circle">{timer}</div>
                      <p>Keep watching to earn points...</p>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleViewPost(post.id)} 
                      className="view-button"
                      disabled={viewing !== null}
                    >
                      👀 View & Earn Points
                    </button>
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
