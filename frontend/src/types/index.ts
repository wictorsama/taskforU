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
  createdAt: string;
  userId: number;
}

export enum TaskStatus {
  Pending = 0,
  Done = 1
}

export interface CreateTaskDto {
  title: string;
  description: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
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
  search?: string;
  sortBy?: string;
  sortDescending?: boolean;
  page?: number;
  pageSize?: number;
}