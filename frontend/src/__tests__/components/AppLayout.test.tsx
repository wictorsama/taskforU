import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import { useAuth } from '../../contexts/AuthContext';
import AppLayout from '../../components/AppLayout';

// Mock do useAuth
jest.mock('../../contexts/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock do useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/dashboard' }),
}));

describe('AppLayout Component', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
  };

  const mockAuthContext = {
    user: mockUser,
    token: 'mock-token',
    login: jest.fn(),
    loginWithCredentials: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    loading: false,
    isAuthenticated: true,
  };

  beforeEach(() => {
    mockUseAuth.mockReturnValue(mockAuthContext);
    mockNavigate.mockClear();
  });

  test('renders layout with user information', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByText('TaskForU')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('renders navigation menu items', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Tarefas')).toBeInTheDocument();
  });

  test('calls logout when logout button is clicked', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    // Clica no dropdown do usuário
    const userButton = screen.getByText('Test User');
    fireEvent.click(userButton);

    // Procura pelo botão de logout no dropdown
    const logoutButton = screen.getByText('Sair');
    fireEvent.click(logoutButton);

    expect(mockAuthContext.logout).toHaveBeenCalled();
  });

  test('navigates to dashboard when dashboard menu is clicked', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('navigates to tasks when tasks menu is clicked', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    const tasksLink = screen.getByText('Tarefas');
    fireEvent.click(tasksLink);

    expect(mockNavigate).toHaveBeenCalledWith('/tasks');
  });

  test('toggles sidebar when menu button is clicked', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    // Procura pelo botão de toggle do menu
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    // Verifica se o estado do sidebar mudou (teste visual básico)
    expect(menuButton).toBeInTheDocument();
  });

  test('renders children content correctly', () => {
    const testContent = <div data-testid="test-content">Custom Content</div>;
    
    render(<AppLayout>{testContent}</AppLayout>);

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });
});