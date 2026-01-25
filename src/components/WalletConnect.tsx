import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RoninWalletConnector } from '@sky-mavis/tanto-connect';
import { connectMetamask, disconnectWallet, truncateWalletAddress, WalletState } from '../utils/wallet';
import { useAuth } from '../contexts/AuthContext';

const WalletConnect: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  
  const referralCode = searchParams.get('ref');
  
  const [roninWallet, setRoninWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    balance: null,
  });
  
  const [metamaskWallet, setMetamaskWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    balance: null,
  });

  const [roninConnector, setRoninConnector] = useState<RoninWalletConnector | null>(null);
  const [loading, setLoading] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    // Initialize Ronin Wallet Connector
    try {
      const connector = new RoninWalletConnector();
      setRoninConnector(connector);

      return () => {
        // Cleanup - disconnect if connected
        connector.disconnect().catch((err) => {
          // Silently handle disconnect errors (e.g., provider not found)
          console.debug('Disconnect cleanup error (expected if wallet not installed):', err);
        });
      };
    } catch (err) {
      console.error('Error initializing Ronin Wallet Connector:', err);
      return undefined;
    }
  }, []);

  const handleLogin = async (address: string, walletType: 'ronin' | 'metamask') => {
    try {
      await login(address, walletType, referralCode ?? undefined);
      setSuccess('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(`Login failed: ${err.message}`);
      throw err;
    }
  };

  const handleRoninConnect = async () => {
    if (!roninConnector) {
      setError('Ronin Wallet Connector not initialized');
      return;
    }
    
    setLoading('ronin');
    setError('');
    setSuccess('');
    
    try {
      const result = await roninConnector.connect(2020); // Ronin mainnet chain ID
      
      if (result && result.account) {
        setRoninWallet({
          address: result.account,
          isConnected: true,
          balance: 'N/A',
        });
        
        await handleLogin(result.account, 'ronin');
      }
    } catch (err: any) {
      console.error('Error connecting Ronin wallet:', err);
      if (err.message && err.message.includes('ProviderNotFound')) {
        setError('Ronin Wallet extension not found. Please install it from the Chrome Web Store.');
      } else {
        setError(`Ronin connection failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading('');
    }
  };

  const handleRoninDisconnect = async () => {
    if (!roninConnector) return;
    
    try {
      await roninConnector.disconnect();
      setRoninWallet(disconnectWallet());
      setSuccess('');
    } catch (err: any) {
      console.error('Error disconnecting Ronin wallet:', err);
    }
  };

  const handleMetamaskConnect = async () => {
    setLoading('metamask');
    setError('');
    setSuccess('');
    
    try {
      const wallet = await connectMetamask();
      setMetamaskWallet(wallet);
      
      if (wallet.address) {
        await handleLogin(wallet.address, 'metamask');
      }
    } catch (err: any) {
      console.error('Error connecting Metamask:', err);
      if (err.message && err.message.includes('not installed')) {
        setError('Metamask extension not found. Please install it from metamask.io');
      } else {
        setError(`Metamask connection failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading('');
    }
  };

  const handleMetamaskDisconnect = () => {
    setMetamaskWallet(disconnectWallet());
    setSuccess('');
  };

  return (
    <div className="wallet-connect">
      <h2>Connect Your Wallet</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="wallet-cards">
        <div className="wallet-card">
          <h3>Ronin Wallet</h3>
          <div className="wallet-icon">🎮</div>
          {!roninWallet.isConnected ? (
            <button
              onClick={handleRoninConnect}
              disabled={loading === 'ronin'}
              className="connect-button ronin"
            >
              {loading === 'ronin' ? 'Connecting...' : 'Connect Ronin Wallet'}
            </button>
          ) : (
            <div className="wallet-info">
              <p className="wallet-address">
                <strong>Address:</strong> {truncateWalletAddress(roninWallet.address || '')}
              </p>
              <p className="full-address" title={roninWallet.address || ''}>
                {roninWallet.address}
              </p>
              <button
                onClick={handleRoninDisconnect}
                className="disconnect-button"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        <div className="wallet-card">
          <h3>Metamask</h3>
          <div className="wallet-icon">🦊</div>
          {!metamaskWallet.isConnected ? (
            <button
              onClick={handleMetamaskConnect}
              disabled={loading === 'metamask'}
              className="connect-button metamask"
            >
              {loading === 'metamask' ? 'Connecting...' : 'Connect Metamask'}
            </button>
          ) : (
            <div className="wallet-info">
              <p className="wallet-address">
                <strong>Address:</strong> {truncateWalletAddress(metamaskWallet.address || '')}
              </p>
              <p className="full-address" title={metamaskWallet.address || ''}>
                {metamaskWallet.address}
              </p>
              {metamaskWallet.balance && (
                <p className="wallet-balance">
                  <strong>Balance:</strong> {parseFloat(metamaskWallet.balance).toFixed(4)} ETH
                </p>
              )}
              <button
                onClick={handleMetamaskDisconnect}
                className="disconnect-button"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="connection-status">
        {(roninWallet.isConnected || metamaskWallet.isConnected) && (
          <p className="status-text">
            ✓ Wallet connected and authenticated!
          </p>
        )}
      </div>
    </div>
  );
};

export default WalletConnect;
