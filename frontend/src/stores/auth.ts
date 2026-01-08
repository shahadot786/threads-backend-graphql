import { create } from 'zustand';
import type { User } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;         // Our DB Profile
  userSession: any | null;   // Supabase Auth session user
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;     // Keep for compatibility if needed, though mostly unused now
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: any | null) => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User) => void; // Keeping signature for compatibility, but logic changes
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  userSession: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading to check auth
  isRefreshing: false,
  error: null,

  setUser: (user) => set((state) => ({
    user,
    isAuthenticated: !!state.userSession, // Auth based on session
    isLoading: false
  })),

  setSession: (session) => set((state) => ({
    userSession: session?.user || null,
    isAuthenticated: !!session?.user,
    // If no session, we aren't loading profile
    isLoading: !!session?.user ? state.isLoading : false
  })),

  updateUser: (user) => set({ user }),

  setLoading: (isLoading) => set({ isLoading }),

  setRefreshing: (isRefreshing) => set({ isRefreshing }),

  setError: (error) => set({ error }),

  // Custom login: primarily for state sync, actual login happens via supabase.auth.signIn*
  login: (user) => set({
    user,
    isAuthenticated: true,
    isLoading: false,
    error: null
  }),

  logout: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      userSession: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  },

  clearError: () => set({ error: null }),
}));

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
