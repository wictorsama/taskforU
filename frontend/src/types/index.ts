export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  isActive: boolean;
}

export interface Task {
  id: string; // Changed to string for UUID
  title: string;
  description: string;
  status: TaskStatus; // Changed from isCompleted to status enum
  priority: number; // Added priority field
  createdAt: string;
  updatedAt: string; // Added missing updatedAt field
  userId: number;
}

export enum TaskStatus {
  Pending = 0,
  Completed = 1,
  Done = 1 // Alias para Completed
}

export interface CreateTaskDto {
  title: string;
  description: string;
  status?: TaskStatus;
  priority?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: number;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  currentPage?: number; // Added missing currentPage property
}