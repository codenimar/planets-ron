import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthAPI, MemberAPI } from '../utils/api';
import { Member } from '../utils/localStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  member: Member | null;
  loading: boolean;
  login: (address: string, walletType: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const response = await AuthAPI.checkSession();
      if (response.authenticated) {
        setIsAuthenticated(true);
        setMember(response.member);
      } else {
        setIsAuthenticated(false);
        setMember(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setIsAuthenticated(false);
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (address: string, walletType: string) => {
    try {
      const response = await AuthAPI.login(address, walletType);

      if (response.success) {
        setIsAuthenticated(true);
        setMember(response.member);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthAPI.logout();
      setIsAuthenticated(false);
      setMember(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const refreshMember = async () => {
    try {
      const response = await MemberAPI.getProfile();
      if (response.success && response.member) {
        setMember(response.member);
      }
    } catch (error) {
      console.error('Failed to refresh member data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        member,
        loading,
        login,
        logout,
        refreshMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
