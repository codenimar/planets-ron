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
    <nav className="navigation frosted">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            🪙 RoninAds
          </Link>
          {isAuthenticated && (
            <div className="nav-links">
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/referral" className="nav-link">Referrals</Link>
              <Link to="/mailbox" className="nav-link">Mailbox</Link>
              {member?.is_admin && (
                <Link to="/admin" className="nav-link">Admin</Link>
              )}
            </div>
          )}
        </div>
        
        <div className="nav-right">
          <Link to="/terms" className="nav-link">Terms</Link>
          <Link to="/privacy" className="nav-link">Privacy</Link>
          
          {isAuthenticated && member && (
            <>
              <div className="nav-pill">
                <span className="dot-pulse"></span>
                {member.points} pts
              </div>
              <button onClick={handleLogout} className="nav-logout">
                Logout
              </button>
            </>
          )}
          <a 
            href="https://x.com/planetronin" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="nav-link"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
