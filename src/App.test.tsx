import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the AuthContext to avoid API calls during tests
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    isAuthenticated: false,
    member: null,
    loading: false,
    login: jest.fn(),
    logout: jest.fn(),
    refreshMember: jest.fn(),
  }),
}));

test('renders app without crashing', () => {
  render(<App />);
  expect(document.querySelector('.App')).toBeInTheDocument();
});
