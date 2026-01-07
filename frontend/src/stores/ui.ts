import { create } from 'zustand';
import type { Post } from '@/types';

interface UIState {
  // Modals
  isCreatePostOpen: boolean;
  isLoginModalOpen: boolean;
  isReplyModalOpen: boolean;
  replyToPost: Post | null;
  
  // Toast/notification
  toastMessage: string | null;
  
  // UI States
  isSidebarCollapsed: boolean;
  
  // Actions
  openCreatePost: () => void;
  closeCreatePost: () => void;
  toggleCreatePost: () => void;
  
  openLoginModal: () => void;
  closeLoginModal: () => void;
  
  openReplyModal: (post: Post) => void;
  closeReplyModal: () => void;
  
  showToast: (message: string) => void;
  hideToast: () => void;
  
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isCreatePostOpen: false,
  isLoginModalOpen: false,
  isReplyModalOpen: false,
  replyToPost: null,
  toastMessage: null,
  isSidebarCollapsed: false,
  
  openCreatePost: () => set({ isCreatePostOpen: true }),
  closeCreatePost: () => set({ isCreatePostOpen: false }),
  toggleCreatePost: () => set((state) => ({ isCreatePostOpen: !state.isCreatePostOpen })),
  
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  
  openReplyModal: (post: Post) => set({ isReplyModalOpen: true, replyToPost: post }),
  closeReplyModal: () => set({ isReplyModalOpen: false, replyToPost: null }),
  
  showToast: (message: string) => {
    set({ toastMessage: message });
    // Auto-hide after 3 seconds
    setTimeout(() => set({ toastMessage: null }), 3000);
  },
  hideToast: () => set({ toastMessage: null }),
  
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
