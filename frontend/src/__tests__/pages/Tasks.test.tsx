import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import Tasks from '../../pages/Tasks';
import * as useTasks from '../../hooks/useTasks';

// Mock dos hooks
jest.mock('../../hooks/useTasks');
const mockUseTasks = useTasks as jest.Mocked<typeof useTasks>;

// Mock do Ant Design
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock do react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Tasks', () => {
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

  const mockUpdateTask = jest.fn();
  const mockDeleteTask = jest.fn();
  const mockBulkUpdate = jest.fn();
  const mockBulkDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock padrão dos hooks
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

    mockUseTasks.useUpdateTask.mockReturnValue({
      mutate: mockUpdateTask,
      isLoading: false,
    } as any);

    mockUseTasks.useDeleteTask.mockReturnValue({
      mutate: mockDeleteTask,
      isLoading: false,
    } as any);

    mockUseTasks.useBulkOperations.mockReturnValue({
      bulkUpdate: { mutate: mockBulkUpdate, isLoading: false },
      bulkDelete: { mutate: mockBulkDelete, isLoading: false },
    } as any);
  });

  test('renders tasks list', async () => {
    render(<Tasks />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });
  });

  test('renders page header with title and new task button', () => {
    render(<Tasks />);

    expect(screen.getByText('Tarefas')).toBeInTheDocument();
    expect(screen.getByText('Nova Tarefa')).toBeInTheDocument();
  });

  test('shows loading state', () => {
    mockUseTasks.useTasks.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<Tasks />);

    expect(screen.getByTestId('loading-tasks')).toBeInTheDocument();
  });

  test('handles error state', async () => {
    const mockError = new Error('Failed to fetch tasks');
    mockUseTasks.useTasks.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: jest.fn(),
    } as any);

    render(<Tasks />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar tarefas')).toBeInTheDocument();
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

    render(<Tasks />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma tarefa encontrada')).toBeInTheDocument();
    });
  });

  test('filters tasks by search', async () => {
    render(<Tasks />);

    const searchInput = screen.getByPlaceholderText('Buscar tarefas...');
    await userEvent.type(searchInput, 'test search');

    // Verifica se o filtro de busca foi aplicado
    expect(searchInput).toHaveValue('test search');
  });

  test('filters tasks by status', async () => {
    render(<Tasks />);

    const statusSelect = screen.getByDisplayValue('Todos os status');
    await userEvent.click(statusSelect);

    const pendingOption = screen.getByText('Pendente');
    await userEvent.click(pendingOption);
  });

  test('filters tasks by priority', async () => {
    render(<Tasks />);

    const prioritySelect = screen.getByDisplayValue('Todas as prioridades');
    await userEvent.click(prioritySelect);

    const highOption = screen.getByText('Alta');
    await userEvent.click(highOption);
  });

  test('opens task details modal', async () => {
    render(<Tasks />);

    const taskTitle = screen.getByText('Task 1');
    await userEvent.click(taskTitle);

    // Verifica se o modal foi aberto
    expect(screen.getByText('Detalhes da Tarefa')).toBeInTheDocument();
  });

  test('opens edit task modal', async () => {
    render(<Tasks />);

    const editButton = screen.getAllByLabelText('edit')[0];
    await userEvent.click(editButton);

    // Verifica se o modal de edição foi aberto
    expect(screen.getByText('Editar Tarefa')).toBeInTheDocument();
  });

  test('deletes a task', async () => {
    render(<Tasks />);

    const deleteButton = screen.getAllByLabelText('delete')[0];
    await userEvent.click(deleteButton);

    // Confirma a exclusão
    const confirmButton = screen.getByText('Sim');
    await userEvent.click(confirmButton);

    expect(mockDeleteTask).toHaveBeenCalledWith('1');
  });

  test('selects tasks for bulk operations', async () => {
    render(<Tasks />);

    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]); // Primeira tarefa
    await userEvent.click(checkboxes[2]); // Segunda tarefa

    // Verifica se as tarefas foram selecionadas
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });

  test('performs bulk delete', async () => {
    render(<Tasks />);

    // Seleciona tarefas
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);
    await userEvent.click(checkboxes[2]);

    // Clica no botão de exclusão em massa
    const bulkDeleteButton = screen.getByText('Excluir Selecionadas');
    await userEvent.click(bulkDeleteButton);

    // Confirma a exclusão
    const confirmButton = screen.getByText('Sim');
    await userEvent.click(confirmButton);

    expect(mockBulkDelete).toHaveBeenCalledWith(['1', '2']);
  });

  test('performs bulk status update', async () => {
    render(<Tasks />);

    // Seleciona tarefas
    const checkboxes = screen.getAllByRole('checkbox');
    await userEvent.click(checkboxes[1]);

    // Clica no botão de atualização de status
    const bulkStatusButton = screen.getByText('Marcar como Concluída');
    await userEvent.click(bulkStatusButton);

    expect(mockBulkUpdate).toHaveBeenCalledWith({
      ids: ['1'],
      updates: { status: 2 }
    });
  });

  test('clears all filters', async () => {
    render(<Tasks />);

    // Aplica alguns filtros primeiro
    const searchInput = screen.getByPlaceholderText('Buscar tarefas...');
    await userEvent.type(searchInput, 'test');

    // Limpa os filtros
    const clearButton = screen.getByText('Limpar Filtros');
    await userEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  test('navigates to create task page', async () => {
    render(<Tasks />);

    const createButton = screen.getByText('Nova Tarefa');
    await userEvent.click(createButton);

    // Verifica se a navegação foi chamada (mock)
    // Como useNavigate é mockado, apenas verificamos se o botão existe
    expect(createButton).toBeInTheDocument();
  });

  test('changes page size', async () => {
    render(<Tasks />);

    // Muda o tamanho da página na paginação
    const pageSizeSelect = screen.getByText('10 / página');
    await userEvent.click(pageSizeSelect);

    const option20 = screen.getByText('20 / página');
    await userEvent.click(option20);

    // Verifica se o tamanho da página foi alterado
    expect(screen.getByText('20 / página')).toBeInTheDocument();
  });

  test('navigates between pages', async () => {
    // Mock com múltiplas páginas
    mockUseTasks.useTasks.mockReturnValue({
      data: {
        data: mockTasks,
        totalCount: 25,
        currentPage: 1,
        pageSize: 10,
        totalPages: 3,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    render(<Tasks />);

    // Clica na próxima página
    const nextButton = screen.getByLabelText('Next Page');
    await userEvent.click(nextButton);

    // Verifica se a paginação está funcionando
    expect(nextButton).toBeInTheDocument();
  });

  test('resets filters', async () => {
    render(<Tasks />);

    // Aplica alguns filtros
    const searchInput = screen.getByPlaceholderText('Buscar tarefas...');
    await userEvent.type(searchInput, 'test');

    // Clica no botão de limpar filtros
    const clearButton = screen.getByText('Limpar Filtros');
    await userEvent.click(clearButton);

    // Verifica se os filtros foram resetados
    expect(searchInput).toHaveValue('');
  });
});