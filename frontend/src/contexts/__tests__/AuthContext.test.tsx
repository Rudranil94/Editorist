import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from '../AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthContext', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    isEmailVerified: true,
    preferences: {
      theme: 'light' as const,
      defaultStyle: 'cinematic',
      defaultStrength: 0.5,
      defaultQualityThreshold: 0.7,
      defaultImportanceThreshold: 0.6,
      enableMotionAnalysis: true,
      enableContinuityAnalysis: true,
    },
  };

  const mockToken = 'mock-token';

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('provides initial state correctly', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('handles successful login', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { token: mockToken, user: mockUser },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('auth_token')).toBe(mockToken);
  });

  it('handles login failure', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Login failed'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await expect(
        result.current.login('test@example.com', 'wrongpassword')
      ).rejects.toThrow('Login failed');
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('handles successful registration', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { token: mockToken, user: mockUser },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.register('test@example.com', 'password123', 'Test User');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('auth_token')).toBe(mockToken);
  });

  it('handles successful logout', async () => {
    localStorage.setItem('auth_token', mockToken);
    mockedAxios.post.mockResolvedValueOnce({});

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('handles successful password reset request', async () => {
    mockedAxios.post.mockResolvedValueOnce({});

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.requestPasswordReset('test@example.com');
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/request-password-reset', {
      email: 'test@example.com',
    });
  });

  it('handles successful password reset', async () => {
    mockedAxios.post.mockResolvedValueOnce({});

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.resetPassword('reset-token', 'newpassword123');
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/reset-password', {
      token: 'reset-token',
      newPassword: 'newpassword123',
    });
  });

  it('handles successful email verification', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { user: { ...mockUser, isEmailVerified: true } },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.verifyEmail('verification-token');
    });

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/verify-email', {
      token: 'verification-token',
    });
    expect(result.current.user?.isEmailVerified).toBe(true);
  });

  it('handles successful preferences update', async () => {
    localStorage.setItem('auth_token', mockToken);
    const updatedPreferences = {
      ...mockUser.preferences,
      theme: 'dark' as const,
    };
    mockedAxios.put.mockResolvedValueOnce({
      data: updatedPreferences,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.updatePreferences(updatedPreferences);
    });

    expect(mockedAxios.put).toHaveBeenCalledWith(
      '/api/auth/preferences',
      updatedPreferences,
      {
        headers: { Authorization: `Bearer ${mockToken}` },
      }
    );
    expect(result.current.user?.preferences).toEqual(updatedPreferences);
  });

  it('restores session from localStorage on mount', async () => {
    localStorage.setItem('auth_token', mockToken);
    mockedAxios.get.mockResolvedValueOnce({
      data: mockUser,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      // Wait for the initial session check
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles failed session restoration', async () => {
    localStorage.setItem('auth_token', 'invalid-token');
    mockedAxios.get.mockRejectedValueOnce(new Error('Invalid token'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      // Wait for the initial session check
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
}); 