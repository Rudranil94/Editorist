import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PrivateRoute } from '../PrivateRoute';
import { AuthProvider } from '../../contexts/AuthContext';
import { useAuth } from '../../contexts/AuthContext';

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext');

const TestComponent = () => <div>Protected Content</div>;

describe('PrivateRoute', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when authentication is in progress', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: true,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <TestComponent />
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <TestComponent />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects to email verification when user is not verified', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        isEmailVerified: false,
      },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <TestComponent />
                </PrivateRoute>
              }
            />
            <Route path="/verify-email" element={<div>Email Verification</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Email Verification')).toBeInTheDocument();
  });

  it('renders protected content when user is authenticated and verified', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        isEmailVerified: true,
      },
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <TestComponent />
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('preserves the current location when redirecting to login', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
    });

    render(
      <MemoryRouter initialEntries={['/protected-page']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/protected-page"
              element={
                <PrivateRoute>
                  <TestComponent />
                </PrivateRoute>
              }
            />
            <Route
              path="/login"
              element={
                <div>
                  Login Page
                  <div data-testid="location-state">
                    {new URLSearchParams(window.location.search).get('from')}
                  </div>
                </div>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('location-state')).toHaveTextContent('/protected-page');
  });

  it('handles nested routes correctly', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        isEmailVerified: true,
      },
      isLoading: false,
    });

    const NestedComponent = () => <div>Nested Content</div>;

    render(
      <MemoryRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <TestComponent />
                </PrivateRoute>
              }
            >
              <Route path="nested" element={<NestedComponent />} />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
}); 