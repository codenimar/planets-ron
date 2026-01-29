import React, { useState } from 'react';
import { MemberAPI } from '../utils/api';

interface XHandleSetupProps {
  onComplete: () => void;
}

const XHandleSetup: React.FC<XHandleSetupProps> = ({ onComplete }) => {
  const [xHandle, setXHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!xHandle.trim()) {
      setError('Please enter your X.com handle');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await MemberAPI.updateXHandle(xHandle);
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to update X.com handle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <h2>Connect Your X.com Account</h2>
        <p className="lede" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          To participate in tasks and earn rewards, we need your X.com handle. 
          This is a one-time setup.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="x-handle">X.com Handle</label>
            <input
              id="x-handle"
              type="text"
              value={xHandle}
              onChange={(e) => setXHandle(e.target.value)}
              placeholder="@username or username"
              disabled={loading}
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
              }}
            />
            <small style={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', marginTop: '0.5rem' }}>
              Enter your X.com (Twitter) username without the @ symbol
            </small>
          </div>

          {error && (
            <div className="error-message" style={{ 
              padding: '0.75rem', 
              marginBottom: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#f87171',
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="cta primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Saving...' : 'Save X.com Handle'}
          </button>
        </form>

        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
            <strong>Why do we need this?</strong><br />
            Your X.com handle is used to verify your social media actions (likes, retweets, follows)
            to earn points and rewards.
          </p>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: rgba(26, 27, 35, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .modal-content h2 {
          margin-top: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </div>
  );
};

export default XHandleSetup;
