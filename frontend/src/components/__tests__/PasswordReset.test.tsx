import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PasswordReset } from '../PasswordReset';
import { useAuth } from '../../contexts/AuthContext';
import { showNotification } from '../NotificationSystem';

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext');
jest.mock('../NotificationSystem');

describe('PasswordReset', () => {
  const mockRequestPasswordReset = jest.fn();
  const mockResetPassword = jest.fn();

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      requestPasswordReset: mockRequestPasswordReset,
      resetPassword: mockResetPassword,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders password reset form correctly', () => {
    render(<PasswordReset />);
    
    expect(screen.getByText(/reset password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset instructions/i })).toBeInTheDocument();
  });

  it('handles password reset request successfully', async () => {
    mockRequestPasswordReset.mockResolvedValueOnce(undefined);
    render(<PasswordReset />);
    
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith('test@example.com');
      expect(showNotification.success).toHaveBeenCalledWith('Password reset instructions sent to your email');
    });
  });

  it('handles password reset request failure', async () => {
    mockRequestPasswordReset.mockRejectedValueOnce(new Error('Failed'));
    render(<PasswordReset />);
    
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(showNotification.error).toHaveBeenCalledWith('Failed to send reset instructions');
    });
  });

  it('switches to reset password form after successful request', async () => {
    mockRequestPasswordReset.mockResolvedValueOnce(undefined);
    render(<PasswordReset />);
    
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/enter new password/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/reset token/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/new password/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
    });
  });

  it('handles password reset successfully', async () => {
    mockResetPassword.mockResolvedValueOnce(undefined);
    render(<PasswordReset />);
    
    // First request reset
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset instructions/i });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Then enter reset details
      const tokenInput = screen.getByPlaceholderText(/reset token/i);
      const newPasswordInput = screen.getByPlaceholderText(/new password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);
      const resetButton = screen.getByRole('button', { name: /reset password/i });
      
      fireEvent.change(tokenInput, { target: { value: 'reset-token' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
      fireEvent.click(resetButton);
      
      expect(mockResetPassword).toHaveBeenCalledWith('reset-token', 'newpassword123');
      expect(showNotification.success).toHaveBeenCalledWith('Password reset successful');
    });
  });

  it('shows error when passwords do not match', async () => {
    render(<PasswordReset />);
    
    // Switch to reset form
    const switchButton = screen.getByText(/already have a reset token/i);
    fireEvent.click(switchButton);
    
    // Enter mismatched passwords
    const newPasswordInput = screen.getByPlaceholderText(/new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);
    const resetButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    fireEvent.click(resetButton);
    
    expect(showNotification.error).toHaveBeenCalledWith('Passwords do not match');
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('handles password reset failure', async () => {
    mockResetPassword.mockRejectedValueOnce(new Error('Failed'));
    render(<PasswordReset />);
    
    // Switch to reset form
    const switchButton = screen.getByText(/already have a reset token/i);
    fireEvent.click(switchButton);
    
    // Enter reset details
    const tokenInput = screen.getByPlaceholderText(/reset token/i);
    const newPasswordInput = screen.getByPlaceholderText(/new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);
    const resetButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.change(tokenInput, { target: { value: 'reset-token' } });
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(resetButton);
    
    await waitFor(() => {
      expect(showNotification.error).toHaveBeenCalledWith('Failed to reset password');
    });
  });
}); 