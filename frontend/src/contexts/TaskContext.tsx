import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Task, TaskStats, TaskFilter } from '../types';
import { tasksApi } from '../services/api';

interface TaskContextType {
  tasks: Task[];
  stats: TaskStats;
  loading: boolean;
  totalCount: number;
  refreshTasks: (filter?: TaskFilter) => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshAll: () => Promise<void>;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({ totalTasks: 0, completedTasks: 0, pendingTasks: 0 });
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const refreshTasks = useCallback(async (filter: TaskFilter = { page: 1, pageSize: 10 }) => {
    try {
      setLoading(true);
      // Resetar o estado para evitar inconsistências durante o carregamento
      setTasks([]);
      setTotalCount(0);
      
      const response = await tasksApi.getTasks(filter);
      
      // Validação rigorosa e atualização atômica dos dados
      if (response && response.tasks && Array.isArray(response.tasks) && typeof response.totalCount === 'number') {
        // Atualização atômica: só atualizar se ambos os valores são válidos
        const newTasks = response.tasks;
        const newTotalCount = response.totalCount;
        
        // Log para debug
        console.log('📡 API Response:', {
          tasksReceived: newTasks.length,
          totalCount: newTotalCount,
          filter,
          isValidResponse: true
        });
        
        // Atualizar de forma síncrona para evitar race conditions
        setTasks(newTasks);
        setTotalCount(newTotalCount);
      } else {
        console.warn('⚠️ Invalid API response:', response);
        // Se a resposta não for válida, manter estado limpo
        setTasks([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      // Em caso de erro, garantir que o estado seja consistente
      setTasks([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      const response = await tasksApi.getStats();
      setStats(response);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshTasks(), refreshStats()]);
  }, [refreshTasks, refreshStats]);

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [task, ...prev]);
    // Atualizar totalCount também
    setTotalCount(prev => prev + 1);
    setStats(prev => ({
      totalTasks: prev.totalTasks + 1,
      pendingTasks: prev.pendingTasks + 1,
      completedTasks: prev.completedTasks
    }));
  }, []);

  const updateTask = useCallback((taskId: string, updatedTask: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updatedTask } : task
    ));
    
    // Atualizar estatísticas se o status mudou
    if (updatedTask.status !== undefined) {
      setStats(prev => {
        const oldTask = tasks.find(t => t.id === taskId);
        if (!oldTask) return prev;
        
        let completedDiff = 0;
        let pendingDiff = 0;
        
        if (oldTask.status === 0 && updatedTask.status === 1) { // Pending -> Done
          completedDiff = 1;
          pendingDiff = -1;
        } else if (oldTask.status === 1 && updatedTask.status === 0) { // Done -> Pending
          completedDiff = -1;
          pendingDiff = 1;
        }
        
        return {
          totalTasks: prev.totalTasks,
          completedTasks: prev.completedTasks + completedDiff,
          pendingTasks: prev.pendingTasks + pendingDiff
        };
      });
    }
  }, [tasks]);

  const removeTask = useCallback((taskId: string) => {
    const taskToRemove = tasks.find(t => t.id === taskId);
    if (taskToRemove) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      // Atualizar totalCount também
      setTotalCount(prev => prev - 1);
      setStats(prev => ({
        totalTasks: prev.totalTasks - 1,
        completedTasks: taskToRemove.status === 1 ? prev.completedTasks - 1 : prev.completedTasks,
        pendingTasks: taskToRemove.status === 0 ? prev.pendingTasks - 1 : prev.pendingTasks
      }));
    }
  }, [tasks]);

  const value: TaskContextType = {
    tasks,
    stats,
    loading,
    totalCount,
    refreshTasks,
    refreshStats,
    refreshAll,
    addTask,
    updateTask,
    removeTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};