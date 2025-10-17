import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import { useAuth } from '../../contexts/AuthContext';
import Login from '../../pages/Login';

// Mock do useAuth
jest.mock('../../contexts/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock do useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock do message do Ant Design
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('Login Page', () => {
  const mockLoginWithCredentials = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      login: jest.fn(),
      loginWithCredentials: mockLoginWithCredentials,
      register: jest.fn(),
      logout: jest.fn(),
      loading: false,
      isAuthenticated: false,
    });
    mockNavigate.mockClear();
    mockLoginWithCredentials.mockClear();
  });

  test('renders login form correctly', () => {
    render(<Login />);

    expect(screen.getByText('TaskForU')).toBeInTheDocument();
    expect(screen.getByText('Faça login em sua conta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    render(<Login />);

    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, insira seu email!')).toBeInTheDocument();
      expect(screen.getByText('Por favor, insira sua senha!')).toBeInTheDocument();
    });
  });

  test('shows validation error for invalid email format', async () => {
    render(<Login />);

    const emailInput = screen.getByPlaceholderText('Email');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, insira um email válido!')).toBeInTheDocument();
    });
  });

  test('submits form with valid credentials', async () => {
    mockLoginWithCredentials.mockResolvedValue(undefined);

    render(<Login />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLoginWithCredentials).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('navigates to dashboard after successful login', async () => {
    mockLoginWithCredentials.mockResolvedValue(undefined);

    render(<Login />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles login error', async () => {
    const errorMessage = 'Invalid credentials';
    mockLoginWithCredentials.mockRejectedValue(new Error(errorMessage));

    render(<Login />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Entrar' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLoginWithCredentials).toHaveBeenCalled();
    });

    // O erro deve ser tratado internamente pelo componente
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('shows loading state during login', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      token: null,
      login: jest.fn(),
      loginWithCredentials: mockLoginWithCredentials,
      register: jest.fn(),
      logout: jest.fn(),
      loading: true,
      isAuthenticated: false,
    });

    render(<Login />);

    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    expect(submitButton).toBeDisabled();
  });

  test('redirects authenticated user to dashboard', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Test User', email: 'test@example.com', createdAt: '2024-01-01T00:00:00Z', isActive: true },
      token: 'mock-token',
      login: jest.fn(),
      loginWithCredentials: mockLoginWithCredentials,
      register: jest.fn(),
      logout: jest.fn(),
      loading: false,
      isAuthenticated: true,
    });

    render(<Login />);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});