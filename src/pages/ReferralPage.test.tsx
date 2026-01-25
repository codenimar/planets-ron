import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReferralPage from './ReferralPage';
import { ReferralAPI } from '../utils/api';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the API
jest.mock('../utils/api', () => ({
  ReferralAPI: {
    getReferrals: jest.fn(),
    getReferralStats: jest.fn(),
  },
}));

// Mock the wallet utility
jest.mock('../utils/wallet', () => ({
  truncateWalletAddress: (address: string) => address.slice(0, 6) + '...' + address.slice(-4),
}));

const { useAuth } = require('../contexts/AuthContext');

describe('ReferralPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    });
  });

  test('should not show LOADING in referral link when code is not available', async () => {
    useAuth.mockReturnValue({
      member: null,
    });

    (ReferralAPI.getReferrals as jest.Mock).mockResolvedValue({
      success: true,
      referrals: [],
    });

    (ReferralAPI.getReferralStats as jest.Mock).mockResolvedValue({
      success: true,
      stats: {
        total_referrals: 0,
        referrals_with_claims: 0,
      },
    });

    render(<ReferralPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading referral data...')).not.toBeInTheDocument();
    });

    // Check that the input field shows placeholder text
    const input = screen.getByPlaceholderText('Referral code not generated yet');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');

    // Check that LOADING is not in the value
    expect(input).not.toHaveValue(expect.stringContaining('LOADING'));
    expect(input).not.toHaveValue(expect.stringContaining('?ref=LOADING'));
  });

  test('should show loading indicator in referral code display when code is not available', async () => {
    useAuth.mockReturnValue({
      member: null,
    });

    (ReferralAPI.getReferrals as jest.Mock).mockResolvedValue({
      success: true,
      referrals: [],
    });

    (ReferralAPI.getReferralStats as jest.Mock).mockResolvedValue({
      success: true,
      stats: {
        total_referrals: 0,
        referrals_with_claims: 0,
      },
    });

    render(<ReferralPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading referral data...')).not.toBeInTheDocument();
    });

    // Check that the referral code display shows "Loading..."
    const codeValueElement = screen.getByText('Referral Code').nextElementSibling as HTMLElement | null;
    expect(codeValueElement).toBeInTheDocument();
    expect(codeValueElement).toHaveTextContent(/Not ready/i);
  });

  test('should enable generate button when referral code is not available', async () => {
    useAuth.mockReturnValue({
      member: null,
    });

    (ReferralAPI.getReferrals as jest.Mock).mockResolvedValue({
      success: true,
      referrals: [],
    });

    (ReferralAPI.getReferralStats as jest.Mock).mockResolvedValue({
      success: true,
      stats: {
        total_referrals: 0,
        referrals_with_claims: 0,
      },
    });

    render(<ReferralPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading referral data...')).not.toBeInTheDocument();
    });

    // Check that the generate button is enabled
    const generateButton = screen.getByRole('button', { name: /Generate link/i });
    expect(generateButton).not.toBeDisabled();
  });

  test('should show valid referral link when code is available', async () => {
    useAuth.mockReturnValue({
      member: {
        referral_code: 'TEST123',
      },
    });

    (ReferralAPI.getReferrals as jest.Mock).mockResolvedValue({
      success: true,
      referrals: [],
    });

    (ReferralAPI.getReferralStats as jest.Mock).mockResolvedValue({
      success: true,
      stats: {
        total_referrals: 0,
        referrals_with_claims: 0,
        referral_code: 'TEST123',
      },
    });

    render(<ReferralPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading referral data...')).not.toBeInTheDocument();
    });

    // Check that the input field shows a valid referral link
    const input = screen.getByDisplayValue(/\?ref=TEST123/);
    expect(input).toBeInTheDocument();

    // Check that the referral code is displayed
    expect(screen.getByText('TEST123')).toBeInTheDocument();

    // Check that the copy button is enabled
    const copyButton = screen.getByRole('button', { name: /📋 Copy Link/i });
    expect(copyButton).not.toBeDisabled();
  });

  test('should copy referral link when copy button is clicked', async () => {
    useAuth.mockReturnValue({
      member: {
        referral_code: 'TEST123',
      },
    });

    (ReferralAPI.getReferrals as jest.Mock).mockResolvedValue({
      success: true,
      referrals: [],
    });

    (ReferralAPI.getReferralStats as jest.Mock).mockResolvedValue({
      success: true,
      stats: {
        total_referrals: 0,
        referrals_with_claims: 0,
        referral_code: 'TEST123',
      },
    });

    render(<ReferralPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading referral data...')).not.toBeInTheDocument();
    });

    const copyButton = screen.getByRole('button', { name: /📋 Copy Link/i });
    await userEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('?ref=TEST123')
    );

    // Check that the button text changes to "✓ Copied!"
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /✓ Copied!/i })).toBeInTheDocument();
    });
  });

  test('should prioritize stats referral code over member referral code', async () => {
    useAuth.mockReturnValue({
      member: {
        referral_code: 'MEMBER123',
      },
    });

    (ReferralAPI.getReferrals as jest.Mock).mockResolvedValue({
      success: true,
      referrals: [],
    });

    (ReferralAPI.getReferralStats as jest.Mock).mockResolvedValue({
      success: true,
      stats: {
        total_referrals: 0,
        referrals_with_claims: 0,
        referral_code: 'STATS456',
      },
    });

    render(<ReferralPage />);

    await waitFor(() => {
      expect(screen.queryByText('Loading referral data...')).not.toBeInTheDocument();
    });

    // Check that the input field shows the stats referral code
    const input = screen.getByDisplayValue(/\?ref=STATS456/);
    expect(input).toBeInTheDocument();

    // Verify that the member code is not shown
    expect(input).not.toHaveValue(expect.stringContaining('MEMBER123'));
  });
});
