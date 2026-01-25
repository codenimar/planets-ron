import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PostsPage from './pages/PostsPage';
import RewardsPage from './pages/RewardsPage';
import ReferralPage from './pages/ReferralPage';
import MailboxPage from './pages/MailboxPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AdminPage from './pages/AdminPage';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      <div className="app-bg" aria-hidden>
        <div className="bg-grid"></div>
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>
      {isAuthenticated && <Navigation />}
      <main className="App-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/posts"
            element={
              <PrivateRoute>
                <PostsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/rewards"
            element={
              <PrivateRoute>
                <RewardsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/referral"
            element={
              <PrivateRoute>
                <ReferralPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/mailbox"
            element={
              <PrivateRoute>
                <MailboxPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
