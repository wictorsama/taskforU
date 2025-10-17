import { configureStore } from '@reduxjs/toolkit';
import uiSlice, {
  setCurrentPage,
  setPageSize,
  setSearch,
  setStatus,
  setPriority,
  setSorting,
  setSelectedTasks,
  toggleTaskSelection,
  clearSelectedTasks,
  resetFilters,
} from '../../store/slices/uiSlice';

// Define the store type
type TestStore = ReturnType<typeof configureStore<{
  ui: ReturnType<typeof uiSlice>;
}>>;

describe('uiSlice', () => {
  let store: TestStore;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        ui: uiSlice,
      },
    });
  });

  test('should have correct initial state', () => {
    const state = store.getState().ui;
    
    expect(state.filters).toEqual({
      currentPage: 1,
      pageSize: 10,
      search: '',
      status: undefined,
      priority: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(state.selectedTasks).toEqual([]);
  });

  test('should handle setCurrentPage', () => {
    store.dispatch(setCurrentPage(3));
    
    const state = store.getState().ui;
    expect(state.filters.currentPage).toBe(3);
  });

  test('should handle setPageSize', () => {
    store.dispatch(setPageSize(20));
    
    const state = store.getState().ui;
    expect(state.filters.pageSize).toBe(20);
  });

  test('should handle setSearch', () => {
    store.dispatch(setSearch('test search'));
    
    const state = store.getState().ui;
    expect(state.filters.search).toBe('test search');
  });

  test('should handle setStatus', () => {
    store.dispatch(setStatus(1));
    
    const state = store.getState().ui;
    expect(state.filters.status).toBe(1);
  });

  test('should handle setPriority', () => {
    store.dispatch(setPriority(2));
    
    const state = store.getState().ui;
    expect(state.filters.priority).toBe(2);
  });

  test('should handle setSorting', () => {
    store.dispatch(setSorting({ sortBy: 'title', sortOrder: 'asc' }));
    
    const state = store.getState().ui;
    expect(state.filters.sortBy).toBe('title');
    expect(state.filters.sortOrder).toBe('asc');
  });

  test('should handle setSelectedTasks', () => {
    const taskIds = ['1', '2', '3'];
    store.dispatch(setSelectedTasks(taskIds));
    
    const state = store.getState().ui;
    expect(state.selectedTasks).toEqual(taskIds);
  });

  test('should handle toggleTaskSelection - add task', () => {
    store.dispatch(toggleTaskSelection('1'));
    
    const state = store.getState().ui;
    expect(state.selectedTasks).toEqual(['1']);
  });

  test('should handle toggleTaskSelection - remove task', () => {
    // Primeiro adiciona uma tarefa
    store.dispatch(setSelectedTasks(['1', '2']));
    
    // Depois remove uma tarefa
    store.dispatch(toggleTaskSelection('1'));
    
    const state = store.getState().ui;
    expect(state.selectedTasks).toEqual(['2']);
  });

  test('should handle clearSelectedTasks', () => {
    // Primeiro adiciona algumas tarefas
    store.dispatch(setSelectedTasks(['1', '2', '3']));
    
    // Depois limpa todas
    store.dispatch(clearSelectedTasks());
    
    const state = store.getState().ui;
    expect(state.selectedTasks).toEqual([]);
  });

  test('should handle resetFilters', () => {
    // Primeiro modifica os filtros
    store.dispatch(setCurrentPage(5));
    store.dispatch(setPageSize(20));
    store.dispatch(setSearch('test'));
    store.dispatch(setStatus(1));
    store.dispatch(setPriority(2));
    store.dispatch(setSorting({ sortBy: 'title', sortOrder: 'asc' }));
    
    // Depois reseta
    store.dispatch(resetFilters());
    
    const state = store.getState().ui;
    expect(state.filters).toEqual({
      currentPage: 1,
      pageSize: 10,
      search: '',
      status: undefined,
      priority: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  test('should reset currentPage to 1 when changing search', () => {
    // Primeiro vai para uma página diferente
    store.dispatch(setCurrentPage(5));
    expect(store.getState().ui.filters.currentPage).toBe(5);
    
    // Depois muda a busca
    store.dispatch(setSearch('new search'));
    
    const state = store.getState().ui;
    expect(state.filters.currentPage).toBe(1);
    expect(state.filters.search).toBe('new search');
  });

  test('should reset currentPage to 1 when changing status', () => {
    // Primeiro vai para uma página diferente
    store.dispatch(setCurrentPage(3));
    expect(store.getState().ui.filters.currentPage).toBe(3);
    
    // Depois muda o status
    store.dispatch(setStatus(1));
    
    const state = store.getState().ui;
    expect(state.filters.currentPage).toBe(1);
    expect(state.filters.status).toBe(1);
  });

  test('should reset currentPage to 1 when changing priority', () => {
    // Primeiro vai para uma página diferente
    store.dispatch(setCurrentPage(4));
    expect(store.getState().ui.filters.currentPage).toBe(4);
    
    // Depois muda a prioridade
    store.dispatch(setPriority(3));
    
    const state = store.getState().ui;
    expect(state.filters.currentPage).toBe(1);
    expect(state.filters.priority).toBe(3);
  });

  test('should handle multiple actions in sequence', () => {
    store.dispatch(setSearch('test'));
    store.dispatch(setStatus(1));
    store.dispatch(setPriority(2));
    store.dispatch(setCurrentPage(2));
    store.dispatch(setSelectedTasks(['1', '2']));
    
    const state = store.getState().ui;
    expect(state.filters.search).toBe('test');
    expect(state.filters.status).toBe(1);
    expect(state.filters.priority).toBe(2);
    expect(state.filters.currentPage).toBe(2);
    expect(state.selectedTasks).toEqual(['1', '2']);
  });
});