import { Task, TaskStats, User, LoginResponse } from '../types';

// Mock data
export const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  createdAt: '2024-01-01T00:00:00Z',
  isActive: true,
};

export const mockLoginResponse: LoginResponse = {
  user: mockUser,
  token: 'mock-jwt-token',
};

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Description for test task 1',
    status: 0, // Pending
    priority: 1, // Medium
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    userId: 1,
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Description for test task 2',
    status: 1, // Done
    priority: 2, // High
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    userId: 1,
  },
];

export const mockTaskStats: TaskStats = {
  totalTasks: 2,
  pendingTasks: 1,
  completedTasks: 1,
};

export const mockTasksResponse = {
  data: mockTasks,
  totalCount: 2,
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
};

// Mock API functions
export const authApi = {
  login: jest.fn().mockResolvedValue(mockLoginResponse),
  register: jest.fn().mockResolvedValue(mockLoginResponse),
  getProfile: jest.fn().mockResolvedValue(mockUser),
  changePassword: jest.fn().mockResolvedValue(undefined),
};

export const tasksApi = {
  getTasks: jest.fn().mockResolvedValue(mockTasksResponse),
  getTask: jest.fn().mockResolvedValue(mockTasks[0]),
  createTask: jest.fn().mockImplementation((task) => 
    Promise.resolve({ ...task, id: '3', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), userId: 1 })
  ),
  updateTask: jest.fn().mockImplementation((id, updates) => 
    Promise.resolve({ ...mockTasks.find(t => t.id === id), ...updates, updatedAt: new Date().toISOString() })
  ),
  deleteTask: jest.fn().mockResolvedValue(undefined),
  getStats: jest.fn().mockResolvedValue(mockTaskStats),
  bulkUpdateStatus: jest.fn().mockResolvedValue(undefined),
  bulkDelete: jest.fn().mockResolvedValue(undefined),
};

// Reset all mocks
export const resetMocks = () => {
  Object.values(authApi).forEach(mock => mock.mockClear());
  Object.values(tasksApi).forEach(mock => mock.mockClear());
};