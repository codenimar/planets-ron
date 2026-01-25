import React, { useState, useEffect } from 'react';
import { PostAPI, MemberAPI, ConfigService } from '../utils/api';
import { Post, ClickPass, PublisherPass } from '../utils/localStorage';

interface PassInfo {
  click_pass: ClickPass | null;
  publisher_pass: PublisherPass | null;
}

const PostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [passInfo, setPassInfo] = useState<PassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    postType: 'post' as 'ad' | 'post' | 'announcement',
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const [postsRes, passesRes] = await Promise.all([
        PostAPI.myPosts(),
        MemberAPI.getPasses(),
      ]);

      if (postsRes.success) {
        setPosts(postsRes.posts || []);
      }

      if (passesRes.success) {
        setPassInfo({
          click_pass: passesRes.click_pass,
          publisher_pass: passesRes.publisher_pass,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.content) {
      setError('Title and content are required');
      return;
    }

    const activePosts = posts.filter((p) => p.status === 'active' || p.status === 'pending').length;
    const config = ConfigService.get();
    const maxPosts = config.app_settings.max_posts_per_publisher;
    if (activePosts >= maxPosts) {
      setError(`You can only have ${maxPosts} active posts at a time`);
      return;
    }

    try {
      const response = await PostAPI.create(formData.title, formData.content, formData.postType);

      if (response.success) {
        setSuccess('Post created successfully! It will be reviewed shortly.');
        setFormData({ title: '', content: '', postType: 'post' });
        setCreating(false);
        await loadPosts();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editing) return;

    try {
      const response = await PostAPI.update(editing, {
        title: formData.title,
        content: formData.content,
      });

      if (response.success) {
        setSuccess('Post updated successfully!');
        setFormData({ title: '', content: '', postType: 'post' });
        setEditing(null);
        await loadPosts();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
    }
  };

  const handleEdit = (post: Post) => {
    setEditing(post.id);
    setFormData({
      title: post.title,
      content: post.content,
      postType: post.post_type,
    });
    setCreating(false);
  };

  const cancelEdit = () => {
    setEditing(null);
    setCreating(false);
    setFormData({ title: '', content: '', postType: 'post' });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      pending: { color: '#f39c12', text: '⏳ Pending Review' },
      active: { color: '#27ae60', text: '✅ Active' },
      inactive: { color: '#95a5a6', text: '⏸️ Inactive' },
      expired: { color: '#e74c3c', text: '⏰ Expired' },
    };
    const badge = badges[status] || badges.inactive;
    return <span className="status-badge" style={{ color: badge.color }}>{badge.text}</span>;
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="card-panel center">
          <div className="loading-spinner"></div>
          <p>Loading posts...</p>
        </div>
      </div>
    );
  }

  if (!passInfo?.publisher_pass) {
    return (
      <div className="page-shell">
        <div className="card-panel center">
          <h3>🔒 Publisher Pass Required</h3>
          <p>Grab a pass from Rewards to start creating campaigns.</p>
          <button className="cta" onClick={() => window.location.assign('/rewards')}>See Rewards</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <p className="eyebrow">PUBLISH</p>
          <h1>My Posts</h1>
          <p className="lede">Create, review, and activate your campaigns with pass-gated controls.</p>
        </div>
        <div className="glow-pill">
          <span className="dot-pulse"></span>
          Publisher console
        </div>
      </div>

      <div className="card-panel split">
        <div>
          <p className="eyebrow">PASS STATUS</p>
          <h3>{passInfo.publisher_pass.pass_type} Publisher Pass</h3>
          <p className="muted">Post duration: {passInfo.publisher_pass.duration_days} days</p>
        </div>
        {!creating && !editing && (
          <button onClick={() => setCreating(true)} className="cta">
            ➕ Create New Post
          </button>
        )}
      </div>

      {error && <div className="banner error">{error}</div>}
      {success && <div className="banner success">{success}</div>}

      {(creating || editing) && (
        <div className="card-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">{editing ? 'EDIT' : 'CREATE'}</p>
              <h2>{editing ? 'Edit Post' : 'Create New Post'}</h2>
            </div>
            <button className="cta ghost" onClick={cancelEdit}>Close</button>
          </div>
          <form onSubmit={editing ? handleUpdatePost : handleCreatePost} className="form-grid">
            <label>
              <span>Title *</span>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={100}
                required
              />
            </label>
            <label>
              <span>Content *</span>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                maxLength={500}
                rows={4}
                required
              />
            </label>
            <label>
              <span>Post Type *</span>
              <select
                name="postType"
                value={formData.postType}
                onChange={handleInputChange}
                required
              >
                <option value="post">Post</option>
                <option value="ad">Ad</option>
                <option value="announcement">Announcement</option>
              </select>
            </label>
            <div className="form-actions">
              <button type="submit" className="cta">
                {editing ? 'Save Changes' : 'Create Post'}
              </button>
              <button type="button" onClick={cancelEdit} className="cta ghost">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="section-head">
        <div>
          <p className="eyebrow">YOUR CAMPAIGNS</p>
          <h2>Posts ({posts.length})</h2>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="card-panel center">
          <p>No posts yet. Create your first campaign!</p>
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
                {getStatusBadge(post.status)}
              </div>
              <div className="tile-meta">
                <span className="chip">Status: {post.status}</span>
                <span className="chip">
                  Expires: {post.expires_at ? new Date(post.expires_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="tile-actions">
                <button
                  onClick={() => handleEdit(post)}
                  className="cta ghost"
                  disabled={post.status === 'expired'}
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsPage;
