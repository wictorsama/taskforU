import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TaskFilter } from '../../types';

interface UIState {
  currentPage: number;
  pageSize: number;
  filters: TaskFilter;
  selectedTasks: string[];
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
}

const initialState: UIState = {
  currentPage: 1,
  pageSize: 10,
  filters: {
    page: 1,
    pageSize: 10,
    search: '',
    status: undefined,
    priority: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  selectedTasks: [],
  sidebarCollapsed: false,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
      state.filters.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.filters.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page when changing page size
      state.filters.page = 1;
    },
    setFilters: (state, action: PayloadAction<Partial<TaskFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to first page when filters change
      if (action.payload.search !== undefined || 
          action.payload.status !== undefined || 
          action.payload.priority !== undefined) {
        state.currentPage = 1;
        state.filters.page = 1;
      }
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.currentPage = 1;
      state.filters.page = 1;
    },
    setStatus: (state, action: PayloadAction<number | undefined>) => {
      state.filters.status = action.payload;
      state.currentPage = 1;
      state.filters.page = 1;
    },
    setPriority: (state, action: PayloadAction<number | undefined>) => {
      state.filters.priority = action.payload;
      state.currentPage = 1;
      state.filters.page = 1;
    },
    setSorting: (state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) => {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
    },
    setSelectedTasks: (state, action: PayloadAction<string[]>) => {
      state.selectedTasks = action.payload;
    },
    toggleTaskSelection: (state, action: PayloadAction<string>) => {
      const taskId = action.payload;
      const index = state.selectedTasks.indexOf(taskId);
      if (index > -1) {
        state.selectedTasks.splice(index, 1);
      } else {
        state.selectedTasks.push(taskId);
      }
    },
    clearSelectedTasks: (state: UIState) => {
      state.selectedTasks = [];
    },
    toggleSidebar: (state: UIState) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setTheme: (state: UIState, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    resetFilters: (state: UIState) => {
      state.filters = {
        page: 1,
        pageSize: 10,
        search: '',
        status: undefined,
        priority: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      state.currentPage = 1;
      state.pageSize = 10;
      state.selectedTasks = [];
    },
  },
});

export const {
  setCurrentPage,
  setPageSize,
  setFilters,
  setSearch,
  setStatus,
  setPriority,
  setSorting,
  setSelectedTasks,
  toggleTaskSelection,
  clearSelectedTasks,
  toggleSidebar,
  setTheme,
  resetFilters,
} = uiSlice.actions;

export default uiSlice.reducer;