import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailVerification } from '../EmailVerification';
import { useAuth } from '../../contexts/AuthContext';
import { showNotification } from '../NotificationSystem';
import { useLocation } from 'react-router-dom';

// Mock the hooks
jest.mock('../../contexts/AuthContext');
jest.mock('../NotificationSystem');
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

describe('EmailVerification', () => {
  const mockVerifyEmail = jest.fn();
  const mockResendVerificationEmail = jest.fn();
  const mockLocation = { search: '' };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      verifyEmail: mockVerifyEmail,
      resendVerificationEmail: mockResendVerificationEmail,
    });
    (useLocation as jest.Mock).mockReturnValue(mockLocation);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders email verification message', () => {
    render(<EmailVerification />);
    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
  });

  it('handles email verification from URL token', async () => {
    const token = 'verification-token';
    (useLocation as jest.Mock).mockReturnValue({ search: `?token=${token}` });
    mockVerifyEmail.mockResolvedValueOnce(undefined);
    
    render(<EmailVerification />);
    
    await waitFor(() => {
      expect(mockVerifyEmail).toHaveBeenCalledWith(token);
      expect(showNotification.success).toHaveBeenCalledWith('Email verified successfully!');
    });
  });

  it('handles email verification failure', async () => {
    const token = 'invalid-token';
    (useLocation as jest.Mock).mockReturnValue({ search: `?token=${token}` });
    mockVerifyEmail.mockRejectedValueOnce(new Error('Failed'));
    
    render(<EmailVerification />);
    
    await waitFor(() => {
      expect(showNotification.error).toHaveBeenCalledWith('Failed to verify email');
    });
  });

  it('handles resend verification email successfully', async () => {
    mockResendVerificationEmail.mockResolvedValueOnce(undefined);
    render(<EmailVerification />);
    
    const resendButton = screen.getByRole('button', { name: /resend verification email/i });
    fireEvent.click(resendButton);
    
    await waitFor(() => {
      expect(mockResendVerificationEmail).toHaveBeenCalled();
      expect(showNotification.success).toHaveBeenCalledWith('Verification email sent!');
    });
  });

  it('handles resend verification email failure', async () => {
    mockResendVerificationEmail.mockRejectedValueOnce(new Error('Failed'));
    render(<EmailVerification />);
    
    const resendButton = screen.getByRole('button', { name: /resend verification email/i });
    fireEvent.click(resendButton);
    
    await waitFor(() => {
      expect(showNotification.error).toHaveBeenCalledWith('Failed to send verification email');
    });
  });

  it('disables resend button during countdown', async () => {
    mockResendVerificationEmail.mockResolvedValueOnce(undefined);
    render(<EmailVerification />);
    
    const resendButton = screen.getByRole('button', { name: /resend verification email/i });
    fireEvent.click(resendButton);
    
    expect(resendButton).toBeDisabled();
    expect(screen.getByText(/resend in 60s/i)).toBeInTheDocument();
    
    // Wait for countdown to complete
    await waitFor(() => {
      expect(screen.getByText(/resend verification email/i)).toBeInTheDocument();
      expect(resendButton).not.toBeDisabled();
    }, { timeout: 61000 });
  });

  it('shows loading state during verification', async () => {
    const token = 'verification-token';
    (useLocation as jest.Mock).mockReturnValue({ search: `?token=${token}` });
    mockVerifyEmail.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<EmailVerification />);
    
    expect(screen.getByText(/verifying your email/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/verifying your email/i)).not.toBeInTheDocument();
    });
  });
}); 