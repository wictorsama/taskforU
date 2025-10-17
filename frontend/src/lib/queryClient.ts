import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tempo que os dados ficam "frescos" (não refetch automático)
      staleTime: 5 * 60 * 1000, // 5 minutos
      // Tempo que os dados ficam no cache
      gcTime: 10 * 60 * 1000, // 10 minutos
      // Refetch quando a janela volta ao foco
      refetchOnWindowFocus: true,
      // Refetch quando reconecta à internet
      refetchOnReconnect: true,
      // Retry automático em caso de erro
      retry: (failureCount: number, error: any) => {
        // Não retry em erros 4xx (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry até 3 vezes para outros erros
        return failureCount < 3;
      },
      // Delay entre retries (exponential backoff)
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry para mutations apenas em erros de rede
      retry: (failureCount: number, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});