import { create } from 'zustand';

interface UIState {
  // Modals
  isCreatePostOpen: boolean;
  isLoginModalOpen: boolean;
  
  // UI States
  isSidebarCollapsed: boolean;
  
  // Actions
  openCreatePost: () => void;
  closeCreatePost: () => void;
  toggleCreatePost: () => void;
  
  openLoginModal: () => void;
  closeLoginModal: () => void;
  
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isCreatePostOpen: false,
  isLoginModalOpen: false,
  isSidebarCollapsed: false,
  
  openCreatePost: () => set({ isCreatePostOpen: true }),
  closeCreatePost: () => set({ isCreatePostOpen: false }),
  toggleCreatePost: () => set((state) => ({ isCreatePostOpen: !state.isCreatePostOpen })),
  
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
