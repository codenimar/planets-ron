import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminAPI, ConfigService } from '../utils/api';
import { AppConfig, NFTCollection, Reward } from '../utils/localStorage';

const AdminPage: React.FC = () => {
  const { member } = useAuth();
  const [activeTab, setActiveTab] = useState<'config' | 'posts' | 'claims' | 'passes' | 'data'>('config');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [newAdminWallet, setNewAdminWallet] = useState('');
  const [memberIdForPass, setMemberIdForPass] = useState('');
  const [passType, setPassType] = useState('Basic');
  const [passKind, setPassKind] = useState<'click' | 'publisher'>('click');
  
  // Config form states
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionAddress, setNewCollectionAddress] = useState('');
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardDescription, setNewRewardDescription] = useState('');
  const [newRewardType, setNewRewardType] = useState<'nft' | 'token'>('nft');
  const [newRewardCost, setNewRewardCost] = useState('100');
  const [newRewardQuantity, setNewRewardQuantity] = useState('10');

  useEffect(() => {
    if (member?.is_admin) {
      loadAdminData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member, activeTab]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeTab === 'config') {
        const configRes = await AdminAPI.getConfig();
        if (configRes.success) {
          setConfig(configRes.config);
        }
      } else if (activeTab === 'posts') {
        const postsRes = await AdminAPI.getPendingPosts();
        if (postsRes.success) {
          setPendingPosts(postsRes.posts || []);
        }
      } else if (activeTab === 'claims') {
        const claimsRes = await AdminAPI.getAllClaims();
        if (claimsRes.success) {
          setClaims(claimsRes.claims || []);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePost = async (postId: string) => {
    try {
      const response = await AdminAPI.approvePost(postId);
      if (response.success) {
        setSuccess('Post approved successfully');
        loadAdminData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve post');
    }
  };

  const handleRejectPost = async (postId: string) => {
    try {
      const response = await AdminAPI.rejectPost(postId);
      if (response.success) {
        setSuccess('Post rejected successfully');
        loadAdminData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reject post');
    }
  };

  const handleUpdateClaimStatus = async (claimId: string, status: 'sent' | 'cancelled') => {
    try {
      const response = await AdminAPI.updateClaimStatus(claimId, status);
      if (response.success) {
        setSuccess(`Claim marked as ${status}`);
        loadAdminData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update claim status');
    }
  };

  const handleAddAdminWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminWallet.trim()) return;

    try {
      const response = await AdminAPI.addAdminWallet(newAdminWallet.trim());
      if (response.success) {
        setSuccess('Admin wallet added successfully');
        setNewAdminWallet('');
        loadAdminData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add admin wallet');
    }
  };

  const handleGivePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberIdForPass.trim()) return;

    try {
      const response = await AdminAPI.givePass(memberIdForPass.trim(), passType, passKind);
      if (response.success) {
        setSuccess(`${passKind} pass given successfully`);
        setMemberIdForPass('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to give pass');
    }
  };

  const handleAddNFTCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !newCollectionName.trim() || !newCollectionAddress.trim()) return;

    try {
      const newCollection: NFTCollection = {
        id: Date.now().toString(),
        collection_name: newCollectionName.trim(),
        collection_address: newCollectionAddress.trim(),
        points_per_nft: 1,
        max_nfts_counted: 3,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const updatedConfig = {
        ...config,
        nft_collections: [...config.nft_collections, newCollection],
      };

      await AdminAPI.updateConfig(updatedConfig);
      setConfig(updatedConfig);
      setSuccess('NFT Collection added successfully');
      setNewCollectionName('');
      setNewCollectionAddress('');
    } catch (err: any) {
      setError(err.message || 'Failed to add NFT collection');
    }
  };

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !newRewardName.trim()) return;

    try {
      const newReward: Reward = {
        id: Date.now().toString(),
        reward_type: newRewardType,
        name: newRewardName.trim(),
        description: newRewardDescription.trim(),
        points_cost: parseInt(newRewardCost) || 100,
        image_url: '/logo192.png',
        quantity_available: parseInt(newRewardQuantity) || 10,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const updatedConfig = {
        ...config,
        rewards: [...config.rewards, newReward],
      };

      await AdminAPI.updateConfig(updatedConfig);
      setConfig(updatedConfig);
      setSuccess('Reward added successfully');
      setNewRewardName('');
      setNewRewardDescription('');
      setNewRewardCost('100');
      setNewRewardQuantity('10');
    } catch (err: any) {
      setError(err.message || 'Failed to add reward');
    }
  };

  const handleToggleCollectionStatus = async (collectionId: string) => {
    if (!config) return;

    try {
      const updatedCollections = config.nft_collections.map(c =>
        c.id === collectionId ? { ...c, is_active: !c.is_active } : c
      );

      const updatedConfig = {
        ...config,
        nft_collections: updatedCollections,
      };

      await AdminAPI.updateConfig(updatedConfig);
      setConfig(updatedConfig);
      setSuccess('NFT Collection status updated');
    } catch (err: any) {
      setError(err.message || 'Failed to update collection status');
    }
  };

  const handleToggleRewardStatus = async (rewardId: string) => {
    if (!config) return;

    try {
      const updatedRewards = config.rewards.map(r =>
        r.id === rewardId ? { ...r, is_active: !r.is_active } : r
      );

      const updatedConfig = {
        ...config,
        rewards: updatedRewards,
      };

      await AdminAPI.updateConfig(updatedConfig);
      setConfig(updatedConfig);
      setSuccess('Reward status updated');
    } catch (err: any) {
      setError(err.message || 'Failed to update reward status');
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    try {
      await AdminAPI.updateConfig(config);
      setSuccess('Settings updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    }
  };

  const handleExportData = () => {
    const data = ConfigService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roninads-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccess('Data exported successfully');
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = ConfigService.importData(text);
      
      if (success) {
        setSuccess('Data imported successfully');
        loadAdminData();
      } else {
        setError('Failed to import data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to import data');
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
      ConfigService.clearAllData();
      setSuccess('All data cleared');
      loadAdminData();
    }
  };

  if (!member?.is_admin) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="error-message">
            ⚠️ Admin access required. Please connect with an admin wallet.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1>Admin Panel</h1>

        <div className="admin-tabs">
          <button
            className={activeTab === 'config' ? 'active' : ''}
            onClick={() => setActiveTab('config')}
          >
            Configuration
          </button>
          <button
            className={activeTab === 'posts' ? 'active' : ''}
            onClick={() => setActiveTab('posts')}
          >
            Pending Posts
          </button>
          <button
            className={activeTab === 'claims' ? 'active' : ''}
            onClick={() => setActiveTab('claims')}
          >
            Reward Claims
          </button>
          <button
            className={activeTab === 'passes' ? 'active' : ''}
            onClick={() => setActiveTab('passes')}
          >
            Give Passes
          </button>
          <button
            className={activeTab === 'data' ? 'active' : ''}
            onClick={() => setActiveTab('data')}
          >
            Data Management
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {loading && <div className="loading">Loading...</div>}

        {!loading && activeTab === 'config' && config && (
          <div className="admin-content">
            <section className="admin-section">
              <h2>App Settings</h2>
              <form onSubmit={handleUpdateSettings} className="admin-form">
                <div className="form-group">
                  <label>Base Points Per View:</label>
                  <input
                    type="number"
                    value={config.app_settings.base_points_per_view}
                    onChange={(e) => setConfig({
                      ...config,
                      app_settings: {
                        ...config.app_settings,
                        base_points_per_view: parseInt(e.target.value) || 1,
                      },
                    })}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Required View Duration (seconds):</label>
                  <input
                    type="number"
                    value={config.app_settings.view_duration_required}
                    onChange={(e) => setConfig({
                      ...config,
                      app_settings: {
                        ...config.app_settings,
                        view_duration_required: parseInt(e.target.value) || 10,
                      },
                    })}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Cooldown Hours:</label>
                  <input
                    type="number"
                    value={config.app_settings.cooldown_hours}
                    onChange={(e) => setConfig({
                      ...config,
                      app_settings: {
                        ...config.app_settings,
                        cooldown_hours: parseInt(e.target.value) || 24,
                      },
                    })}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Max Posts Per Publisher:</label>
                  <input
                    type="number"
                    value={config.app_settings.max_posts_per_publisher}
                    onChange={(e) => setConfig({
                      ...config,
                      app_settings: {
                        ...config.app_settings,
                        max_posts_per_publisher: parseInt(e.target.value) || 3,
                      },
                    })}
                    min="1"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Update Settings
                </button>
              </form>
            </section>

            <section className="admin-section">
              <h2>Admin Wallets</h2>
              <form onSubmit={handleAddAdminWallet} className="admin-form">
                <div className="form-group">
                  <label>Add Admin Wallet:</label>
                  <input
                    type="text"
                    value={newAdminWallet}
                    onChange={(e) => setNewAdminWallet(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Add Admin
                </button>
              </form>
              <div className="admin-list">
                <h3>Current Admins:</h3>
                {config.admin_wallets.length === 0 ? (
                  <p>No admin wallets configured</p>
                ) : (
                  <ul>
                    {config.admin_wallets.map((wallet, index) => (
                      <li key={index}>{wallet}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="admin-section">
              <h2>NFT Collections</h2>
              <form onSubmit={handleAddNFTCollection} className="admin-form">
                <div className="form-group">
                  <label>Collection Name:</label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="e.g., Axie Infinity"
                  />
                </div>
                <div className="form-group">
                  <label>Collection Address:</label>
                  <input
                    type="text"
                    value={newCollectionAddress}
                    onChange={(e) => setNewCollectionAddress(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Add Collection
                </button>
              </form>
              <div className="admin-list">
                {config.nft_collections.map((collection) => (
                  <div key={collection.id} className="admin-list-item">
                    <div>
                      <strong>{collection.collection_name}</strong>
                      <br />
                      <small>{collection.collection_address}</small>
                      <br />
                      <small>+{collection.points_per_nft} pts/NFT (max {collection.max_nfts_counted})</small>
                    </div>
                    <button
                      onClick={() => handleToggleCollectionStatus(collection.id)}
                      className={collection.is_active ? 'btn btn-success' : 'btn btn-secondary'}
                    >
                      {collection.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-section">
              <h2>Rewards</h2>
              <form onSubmit={handleAddReward} className="admin-form">
                <div className="form-group">
                  <label>Reward Type:</label>
                  <select
                    value={newRewardType}
                    onChange={(e) => setNewRewardType(e.target.value as 'nft' | 'token')}
                  >
                    <option value="nft">NFT</option>
                    <option value="token">Token</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reward Name:</label>
                  <input
                    type="text"
                    value={newRewardName}
                    onChange={(e) => setNewRewardName(e.target.value)}
                    placeholder="e.g., Premium NFT Badge"
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <input
                    type="text"
                    value={newRewardDescription}
                    onChange={(e) => setNewRewardDescription(e.target.value)}
                    placeholder="e.g., Exclusive badge for members"
                  />
                </div>
                <div className="form-group">
                  <label>Points Cost:</label>
                  <input
                    type="number"
                    value={newRewardCost}
                    onChange={(e) => setNewRewardCost(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Quantity Available:</label>
                  <input
                    type="number"
                    value={newRewardQuantity}
                    onChange={(e) => setNewRewardQuantity(e.target.value)}
                    min="1"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Add Reward
                </button>
              </form>
              <div className="admin-list">
                {config.rewards.map((reward) => (
                  <div key={reward.id} className="admin-list-item">
                    <div>
                      <strong>{reward.name}</strong> ({reward.reward_type})
                      <br />
                      <small>{reward.description}</small>
                      <br />
                      <small>Cost: {reward.points_cost} pts | Available: {reward.quantity_available}</small>
                    </div>
                    <button
                      onClick={() => handleToggleRewardStatus(reward.id)}
                      className={reward.is_active ? 'btn btn-success' : 'btn btn-secondary'}
                    >
                      {reward.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {!loading && activeTab === 'posts' && (
          <div className="admin-content">
            <h2>Pending Posts</h2>
            {pendingPosts.length === 0 ? (
              <p>No pending posts</p>
            ) : (
              <div className="posts-list">
                {pendingPosts.map((post) => (
                  <div key={post.id} className="post-card">
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <div className="post-meta">
                      <span>Type: {post.post_type}</span>
                      <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="post-actions">
                      <button
                        onClick={() => handleApprovePost(post.id)}
                        className="btn btn-success"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectPost(post.id)}
                        className="btn btn-danger"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'claims' && (
          <div className="admin-content">
            <h2>Reward Claims</h2>
            {claims.length === 0 ? (
              <p>No reward claims</p>
            ) : (
              <div className="claims-list">
                {claims.map((claim) => (
                  <div key={claim.id} className="claim-card">
                    <h3>{claim.reward?.name || 'Unknown Reward'}</h3>
                    <p>Member: {claim.member?.wallet_address || 'Unknown'}</p>
                    <p>Points Spent: {claim.points_spent}</p>
                    <p>Status: {claim.status}</p>
                    <p>Claimed: {new Date(claim.claimed_at).toLocaleString()}</p>
                    {claim.status === 'pending' && (
                      <div className="claim-actions">
                        <button
                          onClick={() => handleUpdateClaimStatus(claim.id, 'sent')}
                          className="btn btn-success"
                        >
                          Mark as Sent
                        </button>
                        <button
                          onClick={() => handleUpdateClaimStatus(claim.id, 'cancelled')}
                          className="btn btn-danger"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'passes' && (
          <div className="admin-content">
            <h2>Give Passes to Members</h2>
            <form onSubmit={handleGivePass} className="admin-form">
              <div className="form-group">
                <label>Member ID:</label>
                <input
                  type="text"
                  value={memberIdForPass}
                  onChange={(e) => setMemberIdForPass(e.target.value)}
                  placeholder="Enter member ID"
                  required
                />
              </div>
              <div className="form-group">
                <label>Pass Kind:</label>
                <select
                  value={passKind}
                  onChange={(e) => setPassKind(e.target.value as 'click' | 'publisher')}
                >
                  <option value="click">Click Pass</option>
                  <option value="publisher">Publisher Pass</option>
                </select>
              </div>
              <div className="form-group">
                <label>Pass Type:</label>
                <select
                  value={passType}
                  onChange={(e) => setPassType(e.target.value)}
                >
                  <option value="Basic">Basic</option>
                  <option value="Silver">Silver</option>
                  <option value={passKind === 'click' ? 'Golden' : 'Gold'}>
                    {passKind === 'click' ? 'Golden' : 'Gold'}
                  </option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                Give Pass
              </button>
            </form>
            <div className="pass-info">
              <h3>Pass Types:</h3>
              <ul>
                <li><strong>Click Pass Basic:</strong> +10 points per view</li>
                <li><strong>Click Pass Silver:</strong> +20 points per view</li>
                <li><strong>Click Pass Golden:</strong> +30 points per view</li>
                <li><strong>Publisher Pass Basic:</strong> 3-day posts</li>
                <li><strong>Publisher Pass Silver:</strong> 10-day posts</li>
                <li><strong>Publisher Pass Gold:</strong> 30-day posts</li>
              </ul>
            </div>
          </div>
        )}

        {!loading && activeTab === 'data' && (
          <div className="admin-content">
            <h2>Data Management</h2>
            <section className="admin-section">
              <h3>Export Data</h3>
              <p>Download all application data as a JSON file for backup.</p>
              <button onClick={handleExportData} className="btn btn-primary">
                Export All Data
              </button>
            </section>

            <section className="admin-section">
              <h3>Import Data</h3>
              <p>Import previously exported data. This will overwrite existing data.</p>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="file-input"
              />
            </section>

            <section className="admin-section">
              <h3>Clear All Data</h3>
              <p className="warning-text">
                ⚠️ WARNING: This will permanently delete all data including members, posts, and claims.
                This action cannot be undone!
              </p>
              <button onClick={handleClearAllData} className="btn btn-danger">
                Clear All Data
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
