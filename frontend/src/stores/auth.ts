import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading to check auth
  isRefreshing: false,
  error: null,
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    isLoading: false 
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  
  setError: (error) => set({ error }),
  
  login: (user) => set({ 
    user, 
    isAuthenticated: true, 
    isLoading: false,
    error: null 
  }),
  
  logout: () => set({ 
    user: null, 
    isAuthenticated: false, 
    isLoading: false,
    error: null 
  }),
  
  clearError: () => set({ error: null }),
}));

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
