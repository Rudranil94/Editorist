import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  preferences: {
    theme: 'light' | 'dark';
    defaultStyle: string;
    defaultStrength: number;
    defaultQualityThreshold: number;
    defaultImportanceThreshold: number;
    enableMotionAnalysis: boolean;
    enableContinuityAnalysis: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updatePreferences: (preferences: User['preferences']) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await axios.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('auth_token');
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      localStorage.removeItem('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await axios.post('/api/auth/register', { email, password, name });
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      setUser(user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const updatePreferences = async (preferences: User['preferences']) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      const response = await axios.put('/api/auth/preferences', preferences, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => prev ? { ...prev, preferences: response.data } : null);
    } catch (error) {
      console.error('Preferences update failed:', error);
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await axios.post('/api/auth/request-password-reset', { email });
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword });
    } catch (error) {
      console.error('Password reset failed:', error);
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await axios.post('/api/auth/verify-email', { token });
      const { user } = response.data;
      setUser(user);
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Not authenticated');

      await axios.post('/api/auth/resend-verification', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        updatePreferences,
        requestPasswordReset,
        resetPassword,
        verifyEmail,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 