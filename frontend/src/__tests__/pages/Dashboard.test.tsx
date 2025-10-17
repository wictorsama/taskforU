import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../test-utils';
import Dashboard from '../../pages/Dashboard';
import * as useTasks from '../../hooks/useTasks';

// Mock dos hooks
jest.mock('../../hooks/useTasks');
const mockUseTasks = useTasks as jest.Mocked<typeof useTasks>;

// Mock do Ant Design
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    error: jest.fn(),
  },
}));

describe('Dashboard', () => {
  const mockStats = {
    total: 10,
    pending: 5,
    completed: 5,
  };

  const mockTasks = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: 0,
      priority: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      userId: '1',
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      status: 1,
      priority: 2,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      userId: '1',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock padrão dos hooks
    mockUseTasks.useTaskStats.mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    mockUseTasks.useTasks.mockReturnValue({
      data: {
        data: mockTasks,
        totalCount: 2,
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);
  });

  test('renders dashboard with stats cards', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total de Tarefas')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Pendentes')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Concluídas')).toBeInTheDocument();
    });
  });

  test('renders recent tasks section', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Tarefas Recentes')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  test('shows loading state for stats', () => {
    mockUseTasks.useTaskStats.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<Dashboard />);

    // Verifica se os cards de estatísticas estão em estado de loading
    expect(screen.getAllByTestId('loading-card')).toHaveLength(3);
  });

  test('shows loading state for tasks', () => {
    mockUseTasks.useTasks.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<Dashboard />);

    expect(screen.getByTestId('loading-tasks')).toBeInTheDocument();
  });

  test('handles stats error', async () => {
    const mockError = new Error('Failed to fetch stats');
    mockUseTasks.useTaskStats.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: jest.fn(),
    } as any);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar estatísticas')).toBeInTheDocument();
    });
  });

  test('handles tasks error', async () => {
    const mockError = new Error('Failed to fetch tasks');
    mockUseTasks.useTasks.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: jest.fn(),
    } as any);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar tarefas recentes')).toBeInTheDocument();
    });
  });

  test('shows empty state when no tasks', async () => {
    mockUseTasks.useTasks.mockReturnValue({
      data: {
        data: [],
        totalCount: 0,
        currentPage: 1,
        pageSize: 10,
        totalPages: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma tarefa encontrada')).toBeInTheDocument();
    });
  });

  test('displays correct task status badges', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      // Verifica se os badges de status estão sendo exibidos
      expect(screen.getByText('Pendente')).toBeInTheDocument();
      expect(screen.getByText('Concluída')).toBeInTheDocument();
    });
  });

  test('displays correct priority badges', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      // Verifica se os badges de prioridade estão sendo exibidos
      expect(screen.getByText('Média')).toBeInTheDocument();
      expect(screen.getByText('Alta')).toBeInTheDocument();
    });
  });

  test('formats dates correctly', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      // Verifica se as datas estão sendo formatadas corretamente
      expect(screen.getByText('01/01/2024')).toBeInTheDocument();
      expect(screen.getByText('02/01/2024')).toBeInTheDocument();
    });
  });

  test('shows "Ver todas" link', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      const viewAllLink = screen.getByText('Ver todas');
      expect(viewAllLink).toBeInTheDocument();
      expect(viewAllLink.closest('a')).toHaveAttribute('href', '/tasks');
    });
  });

  test('calls refetch when retry button is clicked', async () => {
    const mockRefetch = jest.fn();
    mockUseTasks.useTaskStats.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
      refetch: mockRefetch,
    } as any);

    render(<Dashboard />);

    const retryButton = await screen.findByText('Tentar novamente');
    retryButton.click();

    expect(mockRefetch).toHaveBeenCalled();
  });
});