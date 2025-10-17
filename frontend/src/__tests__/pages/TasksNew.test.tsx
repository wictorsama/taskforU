import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import TasksNew from '../../pages/TasksNew';
import * as useTasks from '../../hooks/useTasks';

// Mock dos hooks
jest.mock('../../hooks/useTasks');
const mockUseTasks = useTasks as jest.Mocked<typeof useTasks>;

// Mock do react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: undefined }),
}));

// Mock do Ant Design
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('TasksNew', () => {
  const mockCreateTask = jest.fn();
  const mockUpdateTask = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock padrão dos hooks
    mockUseTasks.useCreateTask.mockReturnValue({
      mutate: mockCreateTask,
      isLoading: false,
    } as any);

    mockUseTasks.useUpdateTask.mockReturnValue({
      mutate: mockUpdateTask,
      isLoading: false,
    } as any);

    mockUseTasks.useTasks.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    } as any);
  });

  test('renders new task form', () => {
    render(<TasksNew />);

    expect(screen.getByText('Nova Tarefa')).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toBeInTheDocument();
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument();
    expect(screen.getByLabelText('Prioridade')).toBeInTheDocument();
    expect(screen.getByText('Criar Tarefa')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(<TasksNew />);

    // Tenta submeter o formulário sem preencher campos obrigatórios
    const submitButton = screen.getByText('Criar Tarefa');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, insira o título da tarefa')).toBeInTheDocument();
    });
  });

  test('validates title length', async () => {
    render(<TasksNew />);

    const titleInput = screen.getByLabelText('Título');
    
    // Testa título muito curto
    await userEvent.type(titleInput, 'ab');
    
    const submitButton = screen.getByText('Criar Tarefa');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('O título deve ter pelo menos 3 caracteres')).toBeInTheDocument();
    });

    // Limpa o campo
    await userEvent.clear(titleInput);
    
    // Testa título muito longo
    const longTitle = 'a'.repeat(201);
    await userEvent.type(titleInput, longTitle);
    
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('O título deve ter no máximo 200 caracteres')).toBeInTheDocument();
    });
  });

  test('validates description length', async () => {
    render(<TasksNew />);

    const titleInput = screen.getByLabelText('Título');
    const descriptionInput = screen.getByLabelText('Descrição');
    
    // Preenche título válido
    await userEvent.type(titleInput, 'Título válido');
    
    // Testa descrição muito longa
    const longDescription = 'a'.repeat(1001);
    await userEvent.type(descriptionInput, longDescription);
    
    const submitButton = screen.getByText('Criar Tarefa');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('A descrição deve ter no máximo 1000 caracteres')).toBeInTheDocument();
    });
  });

  test('creates task successfully', async () => {
    render(<TasksNew />);

    // Preenche o formulário
    const titleInput = screen.getByLabelText('Título');
    const descriptionInput = screen.getByLabelText('Descrição');
    const prioritySelect = screen.getByLabelText('Prioridade');

    await userEvent.type(titleInput, 'Nova Tarefa');
    await userEvent.type(descriptionInput, 'Descrição da nova tarefa');
    await userEvent.click(prioritySelect);
    
    const highPriorityOption = screen.getByText('Alta');
    await userEvent.click(highPriorityOption);

    // Submete o formulário
    const submitButton = screen.getByText('Criar Tarefa');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith({
        title: 'Nova Tarefa',
        description: 'Descrição da nova tarefa',
        priority: 3,
        status: 0,
      });
    });
  });

  test('handles create task error', async () => {
    // Mock erro na criação
    mockUseTasks.useCreateTask.mockReturnValue({
      mutate: jest.fn().mockRejectedValue(new Error('Erro ao criar tarefa')),
      isLoading: false,
      error: new Error('Erro ao criar tarefa'),
    } as any);

    render(<TasksNew />);

    // Preenche e submete o formulário
    const titleInput = screen.getByLabelText('Título');
    await userEvent.type(titleInput, 'Nova Tarefa');

    const submitButton = screen.getByText('Criar Tarefa');
    await userEvent.click(submitButton);

    // Verifica se o erro foi tratado
    await waitFor(() => {
      expect(screen.getByText('Erro ao criar tarefa')).toBeInTheDocument();
    });
  });

  test('shows loading state during creation', async () => {
    // Mock loading state
    mockUseTasks.useCreateTask.mockReturnValue({
      mutate: mockCreateTask,
      isLoading: true,
      error: null,
    } as any);

    render(<TasksNew />);

    // Verifica se o botão está desabilitado durante loading
    const submitButton = screen.getByText('Criando...');
    expect(submitButton).toBeDisabled();
  });

  test('resets form after successful creation', async () => {
    render(<TasksNew />);

    // Preenche o formulário
    const titleInput = screen.getByLabelText('Título');
    const descriptionInput = screen.getByLabelText('Descrição');

    await userEvent.type(titleInput, 'Nova Tarefa');
    await userEvent.type(descriptionInput, 'Descrição da nova tarefa');

    // Submete o formulário
    const submitButton = screen.getByText('Criar Tarefa');
    await userEvent.click(submitButton);

    // Verifica se o formulário foi resetado
    await waitFor(() => {
      expect(titleInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
    });
  });

  test('navigates back to tasks list', async () => {
    render(<TasksNew />);

    const backButton = screen.getByText('Voltar');
    await userEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/tasks');
  });

  test('handles priority selection', async () => {
    render(<TasksNew />);

    const prioritySelect = screen.getByLabelText('Prioridade');
    await userEvent.click(prioritySelect);

    // Testa seleção de prioridade baixa
    const lowPriorityOption = screen.getByText('Baixa');
    await userEvent.click(lowPriorityOption);

    expect(screen.getByDisplayValue('Baixa')).toBeInTheDocument();

    // Testa seleção de prioridade média
    await userEvent.click(prioritySelect);
    const mediumPriorityOption = screen.getByText('Média');
    await userEvent.click(mediumPriorityOption);

    expect(screen.getByDisplayValue('Média')).toBeInTheDocument();

    // Testa seleção de prioridade alta
    await userEvent.click(prioritySelect);
    const highPriorityOption = screen.getByText('Alta');
    await userEvent.click(highPriorityOption);

    expect(screen.getByDisplayValue('Alta')).toBeInTheDocument();
  });

  test('handles status selection', async () => {
    render(<TasksNew />);

    const statusSelect = screen.getByLabelText('Status');
    await userEvent.click(statusSelect);

    // Testa seleção de status em progresso
    const inProgressOption = screen.getByText('Em Progresso');
    await userEvent.click(inProgressOption);

    expect(screen.getByDisplayValue('Em Progresso')).toBeInTheDocument();

    // Testa seleção de status concluído
    await userEvent.click(statusSelect);
    const completedOption = screen.getByText('Concluída');
    await userEvent.click(completedOption);

    expect(screen.getByDisplayValue('Concluída')).toBeInTheDocument();
  });

  test('handles form keyboard navigation', async () => {
    render(<TasksNew />);

    const titleInput = screen.getByLabelText('Título');
    
    // Foca no campo de título
    titleInput.focus();
    expect(titleInput).toHaveFocus();

    // Navega para o próximo campo usando Tab
    await userEvent.tab();
    const descriptionInput = screen.getByLabelText('Descrição');
    expect(descriptionInput).toHaveFocus();

    // Navega para o campo de prioridade
    await userEvent.tab();
    const prioritySelect = screen.getByLabelText('Prioridade');
    expect(prioritySelect).toHaveFocus();
  });

  test('handles form submission with Enter key', async () => {
    render(<TasksNew />);

    const titleInput = screen.getByLabelText('Título');
    await userEvent.type(titleInput, 'Nova Tarefa');

    // Submete o formulário usando Enter
    await userEvent.keyboard('{Enter}');

    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith({
        title: 'Nova Tarefa',
        description: '',
        priority: 1,
        status: 0,
      });
    });
  });

  test('maintains form state during typing', async () => {
    render(<TasksNew />);

    const titleInput = screen.getByLabelText('Título');
    const descriptionInput = screen.getByLabelText('Descrição');

    // Digita nos campos
    await userEvent.type(titleInput, 'Título de teste');
    await userEvent.type(descriptionInput, 'Descrição de teste');

    // Verifica se os valores foram mantidos
    expect(titleInput).toHaveValue('Título de teste');
    expect(descriptionInput).toHaveValue('Descrição de teste');
  });

  test('shows character count for description', async () => {
    render(<TasksNew />);

    const descriptionInput = screen.getByLabelText('Descrição');
    
    // Digita na descrição
    await userEvent.type(descriptionInput, 'Teste de contagem');

    // Verifica se o contador de caracteres está sendo exibido
    expect(screen.getByText('17 / 500')).toBeInTheDocument();
  });
});