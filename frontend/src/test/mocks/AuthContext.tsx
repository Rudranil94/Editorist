import React, { createContext, useContext } from 'react';
import { vi } from 'vitest';

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

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  isEmailVerified: true,
  preferences: {
    theme: 'light',
    defaultStyle: 'cinematic',
    defaultStrength: 0.5,
    defaultQualityThreshold: 0.7,
    defaultImportanceThreshold: 0.6,
    enableMotionAnalysis: true,
    enableContinuityAnalysis: true,
  },
};

export const mockAuthContext: AuthContextType = {
  user: mockUser,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  updatePreferences: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerificationEmail: vi.fn(),
};

export const AuthContext = createContext<AuthContextType>(mockAuthContext);

export const useAuth = () => useContext(AuthContext);

export const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  );
}; 