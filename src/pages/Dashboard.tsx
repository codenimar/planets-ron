import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PostAPI, MemberAPI, MessageAPI } from '../utils/api';
import { Post, ClickPass, PublisherPass } from '../utils/localStorage';

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
  const [unreadCount, setUnreadCount] = useState(0);
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
      const [postsRes, statsRes, unreadRes] = await Promise.all([
        PostAPI.list(),
        MemberAPI.getStats(),
        MessageAPI.getUnreadCount(),
      ]);

      if (postsRes.success) {
        setPosts(postsRes.posts || []);
      }
      if (statsRes.success) {
        setStats(statsRes.stats);
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

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">CONTROL CENTER</p>
          <h1>Dashboard</h1>
          <p className="lede">Track your earnings, check messages, and keep campaigns active.</p>
        </div>
        <div className="glow-pill">
          <span className="dot-pulse"></span>
          Live session
        </div>
      </div>

      {loading ? (
        <div className="card-panel center">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-tile">
              <div className="stat-label">Total Points</div>
              <div className="stat-number">{member?.points || 0}</div>
              <div className="stat-sub">Earn more by stacking passes & NFTs</div>
            </div>
            <div className="stat-tile">
              <div className="stat-label">Total Views</div>
              <div className="stat-number">{stats?.total_views ?? 0}</div>
              <div className="stat-sub">Cooldown enforced per 24h</div>
            </div>
            <div className="stat-tile">
              <div className="stat-label">Rewards Claimed</div>
              <div className="stat-number">{stats?.total_claims ?? 0}</div>
              <div className="stat-sub">Instant redemption history</div>
            </div>
            <div className="stat-tile">
              <div className="stat-label">Mailbox</div>
              <div className="stat-number">{unreadCount}</div>
              <Link to="/mailbox" className="pill-link">View messages →</Link>
            </div>
          </div>

          {error && <div className="banner error">{error}</div>}
          {success && <div className="banner success">{success}</div>}

          <div className="section-head">
            <div>
              <p className="eyebrow">EARN FLOW</p>
              <h2>Active Posts</h2>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="card-panel center">
              <p>No posts available right now. Check back soon!</p>
            </div>
          ) : (
            <div className="post-tiles">
              {posts.map((post) => (
                <div key={post.id} className="post-tile">
                  <div className="tile-top">
                    <div>
                      <p className="eyebrow">{post.post_type}</p>
                      <h3>{post.title}</h3>
                      <p className="muted">{post.content}</p>
                    </div>
                    <span className={`status-dot ${post.status}`}>{post.status}</span>
                  </div>
                  {viewing === post.id ? (
                    <div className="timer-strip">
                      <div className="timer-count">{timer}s</div>
                      <p>Keep watching to finish and earn points.</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleViewPost(post.id)}
                      className="cta full"
                      disabled={viewing !== null}
                    >
                      👀 View & Earn
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
