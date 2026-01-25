import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { isAuthenticated, member, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            🪙 RoninAds
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/posts" className="nav-link">Posts</Link>
              <Link to="/rewards" className="nav-link">Rewards</Link>
              <a 
                href="https://x.com/planetronin" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="nav-link"
              >
                Contact
              </a>
            </>
          )}
        </div>
        
        <div className="nav-right">
          <Link to="/terms" className="nav-link">Terms</Link>
          <Link to="/privacy" className="nav-link">Privacy</Link>
          
          {isAuthenticated && member && (
            <>
              <div className="nav-points">
                💎 {member.points} points
              </div>
              <button onClick={handleLogout} className="nav-logout">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
