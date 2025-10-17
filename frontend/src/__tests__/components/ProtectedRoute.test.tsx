import React from 'react';
import { render, screen } from '../../test-utils';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

// Mock do Navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }: { to: string }) => {
    mockNavigate(to);
    return <div data-testid="navigate">Redirecting to {to}</div>;
  },
}));

// Mock do AuthContext
jest.mock('../../contexts/AuthContext');

describe('ProtectedRoute Component', () => {
  const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Test User', email: 'test@example.com', createdAt: '2024-01-01T00:00:00Z', isActive: true },
      token: 'mock-token',
      login: jest.fn(),
      loginWithCredentials: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      loading: false,
      isAuthenticated: true,
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      login: jest.fn(),
      loginWithCredentials: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      loading: false,
      isAuthenticated: false,
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  test('shows loading state when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      login: jest.fn(),
      loginWithCredentials: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      loading: true,
      isAuthenticated: false,
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    // Durante o loading, não deve renderizar nem o conteúdo nem o redirect
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  test('redirects to login when token exists but user is null', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: 'mock-token',
      login: jest.fn(),
      loginWithCredentials: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      loading: false,
      isAuthenticated: false,
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
  });

  test('redirects to login when user exists but token is null', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Test User', email: 'test@example.com', createdAt: '2024-01-01T00:00:00Z', isActive: true },
      token: null,
      login: jest.fn(),
      loginWithCredentials: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      loading: false,
      isAuthenticated: false,
    });

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
  });
});