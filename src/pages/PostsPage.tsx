import React, { useState, useEffect } from 'react';
import { PostAPI, MemberAPI } from '../utils/api';
import { Post } from '../utils/localStorage';

interface PassInfo {
  click_pass: any;
  publisher_pass: any;
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
    const maxPosts = 3; // From config
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
      <div className="posts-page">
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  if (!passInfo?.publisher_pass) {
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
            <strong>Pass Type:</strong> {passInfo.publisher_pass?.pass_type || 'Basic'} |{' '}
            <strong>Post Duration:</strong> {passInfo.publisher_pass?.duration_days || 3} days
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
              <label htmlFor="content">Content *</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                maxLength={500}
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="postType">Post Type *</label>
              <select
                id="postType"
                name="postType"
                value={formData.postType}
                onChange={handleInputChange}
                required
              >
                <option value="post">Post</option>
                <option value="ad">Ad</option>
                <option value="announcement">Announcement</option>
              </select>
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
                <div className="post-content">
                  <div className="post-header">
                    <h3>{post.title}</h3>
                    {getStatusBadge(post.status)}
                  </div>
                  <p>{post.content}</p>
                  <div className="post-type-badge">{post.post_type}</div>
                  
                  <div className="post-meta">
                    <span>📅 Created: {new Date(post.created_at).toLocaleDateString()}</span>
                    <span>⏰ Expires: {post.expires_at ? new Date(post.expires_at).toLocaleDateString() : 'N/A'}</span>
                  </div>

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
