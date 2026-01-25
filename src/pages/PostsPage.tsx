import React, { useState, useEffect } from 'react';
import { apiCall, API_ENDPOINTS } from '../utils/api';

interface MyPost {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  link_url?: string;
  status: string;
  created_at: string;
  expires_at: string;
  views_count: number;
}

interface PassInfo {
  has_publisher_pass: boolean;
  pass_type?: string;
  max_active_posts: number;
  post_duration_days: number;
}

const PostsPage: React.FC = () => {
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [passInfo, setPassInfo] = useState<PassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const [postsRes, passesRes] = await Promise.all([
        apiCall(API_ENDPOINTS.MY_POSTS),
        apiCall(API_ENDPOINTS.MEMBER_PASSES),
      ]);

      if (postsRes.success) {
        setPosts(postsRes.posts || []);
      }

      if (passesRes.success) {
        setPassInfo(passesRes.pass_info);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    const activePosts = posts.filter((p) => p.status === 'active').length;
    if (activePosts >= (passInfo?.max_active_posts || 3)) {
      setError(`You can only have ${passInfo?.max_active_posts || 3} active posts at a time`);
      return;
    }

    try {
      const response = await apiCall(API_ENDPOINTS.POST_CREATE, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.success) {
        setSuccess('Post created successfully! It will be reviewed shortly.');
        setFormData({ title: '', description: '', image_url: '', link_url: '' });
        setCreating(false);
        await loadPosts();
      } else {
        setError(response.error || 'Failed to create post');
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
      const response = await apiCall(API_ENDPOINTS.POST_UPDATE, {
        method: 'POST',
        body: JSON.stringify({
          post_id: editing,
          ...formData,
        }),
      });

      if (response.success) {
        setSuccess('Post updated successfully!');
        setFormData({ title: '', description: '', image_url: '', link_url: '' });
        setEditing(null);
        await loadPosts();
      } else {
        setError(response.error || 'Failed to update post');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
    }
  };

  const handleEdit = (post: MyPost) => {
    setEditing(post.id);
    setFormData({
      title: post.title,
      description: post.description,
      image_url: post.image_url || '',
      link_url: post.link_url || '',
    });
    setCreating(false);
  };

  const cancelEdit = () => {
    setEditing(null);
    setCreating(false);
    setFormData({ title: '', description: '', image_url: '', link_url: '' });
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
      <div className="posts-page">
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  if (!passInfo?.has_publisher_pass) {
    return (
      <div className="posts-page">
        <div className="no-access">
          <h2>🔒 Publisher Pass Required</h2>
          <p>You need a Publisher Pass NFT to create and manage posts.</p>
          <p>Visit the Rewards page to learn more about Publisher Passes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-page">
      <div className="posts-header">
        <h1>📝 My Posts</h1>
        <div className="pass-info">
          <p>
            <strong>Pass Type:</strong> {passInfo.pass_type || 'Basic'} |{' '}
            <strong>Max Active Posts:</strong> {passInfo.max_active_posts} |{' '}
            <strong>Post Duration:</strong> {passInfo.post_duration_days} days
          </p>
        </div>
        {!creating && !editing && (
          <button onClick={() => setCreating(true)} className="create-button">
            ➕ Create New Post
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {(creating || editing) && (
        <div className="post-form-container">
          <h2>{editing ? '✏️ Edit Post' : '➕ Create New Post'}</h2>
          <form onSubmit={editing ? handleUpdatePost : handleCreatePost} className="post-form">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={100}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={500}
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image_url">Image URL (optional)</label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-group">
              <label htmlFor="link_url">Link URL (optional)</label>
              <input
                type="url"
                id="link_url"
                name="link_url"
                value={formData.link_url}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                {editing ? '💾 Update Post' : '🚀 Create Post'}
              </button>
              <button type="button" onClick={cancelEdit} className="cancel-button">
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="posts-list">
        <h2>Your Posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any posts yet. Click "Create New Post" to get started!</p>
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
                  <div className="post-header">
                    <h3>{post.title}</h3>
                    {getStatusBadge(post.status)}
                  </div>
                  <p>{post.description}</p>
                  
                  <div className="post-meta">
                    <span>👁️ {post.views_count} views</span>
                    <span>📅 Created: {new Date(post.created_at).toLocaleDateString()}</span>
                    <span>⏰ Expires: {new Date(post.expires_at).toLocaleDateString()}</span>
                  </div>

                  {post.link_url && (
                    <a 
                      href={post.link_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="post-link"
                    >
                      🔗 {post.link_url}
                    </a>
                  )}

                  <div className="post-actions">
                    <button 
                      onClick={() => handleEdit(post)} 
                      className="edit-button"
                      disabled={post.status === 'expired'}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsPage;
