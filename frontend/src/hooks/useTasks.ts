import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../services/api';
import { Task, TaskFilter, TaskStats } from '../types';
import { useAppSelector } from '../store/hooks';

// Query Keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilter) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  stats: () => ['stats'] as const,
};

// Hook para buscar tarefas com paginação
export const useTasks = () => {
  const filters = useAppSelector((state) => state.ui.filters);
  
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => tasksApi.getTasks(filters),
    placeholderData: (previousData) => previousData, // Mantém dados anteriores durante loading
    staleTime: 2 * 60 * 1000, // 2 minutos para dados de lista
  });
};

// Hook para buscar estatísticas
export const useTaskStats = () => {
  return useQuery({
    queryKey: taskKeys.stats(),
    queryFn: () => tasksApi.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos para stats
  });
};

// Hook para buscar uma tarefa específica
export const useTask = (id: string) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.getTask(id),
    enabled: !!id, // Só executa se tiver ID
  });
};

// Hook para criar tarefa
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => 
      tasksApi.createTask(task),
    onSuccess: () => {
      // Invalidar todas as queries de tarefas e stats
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
    onError: (error) => {
      console.error('Erro ao criar tarefa:', error);
    },
  });
};

// Hook para atualizar tarefa
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, task }: { id: string; task: Partial<Task> }) =>
      tasksApi.updateTask(id, task),
    onMutate: async ({ id, task }) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      
      // Snapshot do estado anterior
      const previousTask = queryClient.getQueryData(taskKeys.detail(id));
      const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.lists() });
      
      // Update otimista na tarefa específica
      queryClient.setQueryData(taskKeys.detail(id), (old: Task | undefined) => 
        old ? { ...old, ...task } : old
      );
      
      // Update otimista nas listas de tarefas
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old?.tasks) return old;
        
        return {
          ...old,
          tasks: old.tasks.map((t: Task) => 
            t.id === id ? { ...t, ...task } : t
          ),
        };
      });
      
      return { previousTask, previousTasks };
    },
    onError: (err, { id }, context) => {
      // Rollback em caso de erro
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(id), context.previousTask);
      }
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Erro ao atualizar tarefa:', err);
    },
    onSettled: (data, error, { id }) => {
      // Sempre invalidar após a operação
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
  });
};

// Hook para deletar tarefa
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onMutate: async (id) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      
      // Snapshot do estado anterior
      const previousTasks = queryClient.getQueriesData({ queryKey: taskKeys.lists() });
      
      // Update otimista - remover da lista
      queryClient.setQueriesData({ queryKey: taskKeys.lists() }, (old: any) => {
        if (!old?.tasks) return old;
        
        return {
          ...old,
          tasks: old.tasks.filter((t: Task) => t.id !== id),
          totalCount: Math.max(0, old.totalCount - 1),
        };
      });
      
      return { previousTasks };
    },
    onError: (err, id, context) => {
      // Rollback em caso de erro
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      console.error('Erro ao deletar tarefa:', err);
    },
    onSettled: () => {
      // Sempre invalidar após a operação
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
  });
};

// Hook para operações em lote
export const useBulkOperations = () => {
  const queryClient = useQueryClient();
  
  const bulkDelete = useMutation({
    mutationFn: (ids: string[]) => 
      Promise.all(ids.map(id => tasksApi.deleteTask(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
  });
  
  const bulkUpdate = useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: Partial<Task> }) =>
      Promise.all(ids.map(id => tasksApi.updateTask(id, updates))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
  });
  
  return { bulkDelete, bulkUpdate };
};