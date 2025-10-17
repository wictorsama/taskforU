import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useTasks, useTaskStats, useCreateTask, useUpdateTask, useDeleteTask } from '../../hooks/useTasks';
import { tasksApi } from '../../services/api';
import uiSlice from '../../store/slices/uiSlice';
import authSlice from '../../store/slices/authSlice';

// Mock da API
jest.mock('../../services/api');
const mockTasksApi = tasksApi as jest.Mocked<typeof tasksApi>;

// Dados mock
const mockTasksResponse = {
  tasks: [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Description 1',
      status: 0,
      priority: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      userId: 1,
    },
  ],
  totalCount: 1,
};

const mockStats = {
  totalTasks: 1,
  pendingTasks: 1,
  completedTasks: 0,
};

// Wrapper para os testes
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const store = configureStore({
    reducer: {
      ui: uiSlice,
      auth: authSlice,
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Provider>
  );
};

describe('useTasks Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches tasks successfully', async () => {
    mockTasksApi.getTasks.mockResolvedValue(mockTasksResponse);

    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockTasksResponse);
    expect(mockTasksApi.getTasks).toHaveBeenCalled();
  });

  test('handles tasks fetch error', async () => {
    const errorMessage = 'Failed to fetch tasks';
    mockTasksApi.getTasks.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });

  test('shows loading state initially', () => {
    mockTasksApi.getTasks.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useTasks(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useTaskStats Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches task stats successfully', async () => {
    mockTasksApi.getStats.mockResolvedValue(mockStats);

    const { result } = renderHook(() => useTaskStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockStats);
    expect(mockTasksApi.getStats).toHaveBeenCalled();
  });

  test('handles stats fetch error', async () => {
    const errorMessage = 'Failed to fetch stats';
    mockTasksApi.getStats.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTaskStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });
});

describe('useCreateTask Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates task successfully', async () => {
    const newTask = {
      title: 'New Task',
      description: 'New Description',
      priority: 1,
      status: 0,
      userId: 1,
    };

    const createdTask = {
      id: '2',
      ...newTask,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    mockTasksApi.createTask.mockResolvedValue(createdTask);

    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newTask);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockTasksApi.createTask).toHaveBeenCalledWith(newTask);
    expect(result.current.data).toEqual(createdTask);
  });

  test('handles create task error', async () => {
    const newTask = {
      title: 'New Task',
      description: 'New Description',
      priority: 1,
      status: 0,
      userId: 1,
    };

    const errorMessage = 'Failed to create task';
    mockTasksApi.createTask.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useCreateTask(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(newTask);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });
});

describe('useUpdateTask Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('updates task successfully', async () => {
    const taskId = '1';
    const updates = { title: 'Updated Task' };
    const updatedTask = {
      id: taskId,
      title: 'Updated Task',
      description: 'Description 1',
      status: 0,
      priority: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T01:00:00Z',
      userId: 1,
    };

    mockTasksApi.updateTask.mockResolvedValue(updatedTask);

    const { result } = renderHook(() => useUpdateTask(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: taskId, task: updates });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockTasksApi.updateTask).toHaveBeenCalledWith(taskId, updates);
    expect(result.current.data).toEqual(updatedTask);
  });
});

describe('useDeleteTask Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deletes task successfully', async () => {
    const taskId = '1';
    mockTasksApi.deleteTask.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteTask(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(taskId);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockTasksApi.deleteTask).toHaveBeenCalledWith(taskId);
  });

  test('handles delete task error', async () => {
    const taskId = '1';
    const errorMessage = 'Failed to delete task';
    mockTasksApi.deleteTask.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDeleteTask(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(taskId);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });
});