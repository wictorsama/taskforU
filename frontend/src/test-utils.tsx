import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import ptBR from 'antd/locale/pt_BR';

// Cria um QueryClient para testes
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

interface AllTheProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

const AllTheProviders = ({ children, queryClient = createTestQueryClient() }: AllTheProvidersProps) => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={ptBR}>
          {children}
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient }
) => {
  const { queryClient, ...renderOptions } = options || {};
  
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Renderiza apenas com Redux (sem React Query)
const renderWithRedux = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <Provider store={store}>
        <ConfigProvider locale={ptBR}>
          {children}
        </ConfigProvider>
      </Provider>
    ),
    ...options,
  });
};

// Renderiza apenas com React Query (sem Redux)
const renderWithQuery = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient }
) => {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options || {};
  
  return rtlRender(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={ptBR}>
          {children}
        </ConfigProvider>
      </QueryClientProvider>
    ),
    ...renderOptions,
  });
};

// re-export everything except render to avoid conflicts
export {
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
  within,
  getByRole,
  getByText,
  getByLabelText,
  getByPlaceholderText,
  getByTestId,
  getByDisplayValue,
  queryByRole,
  queryByText,
  queryByLabelText,
  queryByPlaceholderText,
  queryByTestId,
  queryByDisplayValue,
  findByRole,
  findByText,
  findByLabelText,
  findByPlaceholderText,
  findByTestId,
  findByDisplayValue,
  getAllByRole,
  getAllByText,
  getAllByLabelText,
  getAllByPlaceholderText,
  getAllByTestId,
  getAllByDisplayValue,
  queryAllByRole,
  queryAllByText,
  queryAllByLabelText,
  queryAllByPlaceholderText,
  queryAllByTestId,
  queryAllByDisplayValue,
  findAllByRole,
  findAllByText,
  findAllByLabelText,
  findAllByPlaceholderText,
  findAllByTestId,
  findAllByDisplayValue,
} from '@testing-library/react';

// override render method
export { customRender as render, renderWithRedux, renderWithQuery, createTestQueryClient };