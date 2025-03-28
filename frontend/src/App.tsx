import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VideoUpload } from './components/VideoUpload';
import { JobStatus } from './components/JobStatus';
import { ProcessingOptions } from './components/ProcessingOptions';
import { VideoPreview } from './components/VideoPreview';
import { JobManager } from './components/JobManager';
import { SettingsPanel } from './components/SettingsPanel';
import { NotificationSystem, NotificationProvider } from './components/NotificationSystem';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { PasswordReset } from './components/PasswordReset';
import { EmailVerification } from './components/EmailVerification';

const queryClient = new QueryClient();

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.isEmailVerified) {
    return <Navigate to="/verify-email" />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Editorist
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                AI-powered video editing tool for content creators
              </p>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user.name}
                </span>
                <SettingsPanel />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Upload and Processing Options */}
            <div className="lg:col-span-2 space-y-8">
              <VideoUpload />
              <ProcessingOptions />
              <JobStatus />
            </div>

            {/* Right Column - Job Management and Preview */}
            <div className="space-y-8">
              <JobManager />
              <VideoPreview />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Editorist. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<PasswordReset />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <AppContent />
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}; 