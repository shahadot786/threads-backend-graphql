import { create } from 'zustand';
import type { Post } from '@/types';

interface AlertModal {
  title: string;
  message: string;
}

interface UIState {
  // Modals
  isCreatePostOpen: boolean;
  createPostContent: string;
  isLoginModalOpen: boolean;
  isEditProfileOpen: boolean;
  isReplyModalOpen: boolean;
  replyToPost: Post | null;
  isAlertModalOpen: boolean;
  alertModal: AlertModal | null;

  // Toast/notification
  toastMessage: string | null;

  // UI States
  isSidebarCollapsed: boolean;

  // Actions
  openCreatePost: (initialContentOrPost?: string | Post) => void;
  closeCreatePost: () => void;
  toggleCreatePost: () => void;

  openLoginModal: () => void;
  closeLoginModal: () => void;

  openEditProfileModal: () => void;
  closeEditProfileModal: () => void;

  openReplyModal: (post: Post) => void;
  closeReplyModal: () => void;

  showAlert: (title: string, message: string) => void;
  closeAlert: () => void;

  showToast: (message: string) => void;
  hideToast: () => void;

  toggleSidebar: () => void;

  isReportProblemOpen: boolean;
  openReportProblemModal: () => void;
  closeReportProblemModal: () => void;

  isEditPostModalOpen: boolean;
  editPostData: Post | null;
  openEditPostModal: (post: Post) => void;
  closeEditPostModal: () => void;

  // Home Refresh Trigger
  homeRefreshTrigger: number;
  triggerHomeRefresh: () => void;

  // Scroll Position Persistence
  homeScrollPosition: number;
  setHomeScrollPosition: (position: number) => void;
  clearHomeScrollPosition: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isCreatePostOpen: false,
  createPostContent: "",
  isLoginModalOpen: false,
  isEditProfileOpen: false,
  isReplyModalOpen: false,
  replyToPost: null,
  isAlertModalOpen: false,
  alertModal: null,
  toastMessage: null,
  isSidebarCollapsed: false,

  openCreatePost: (initialContentOrPost) => {
    if (typeof initialContentOrPost === 'string') {
      set({
        isCreatePostOpen: true,
        createPostContent: initialContentOrPost,
        editPostData: null // Ensure we are NOT in edit mode
      });
    } else if (initialContentOrPost && typeof initialContentOrPost === 'object') {
      // It's a Post object -> Edit Mode
      set({
        isCreatePostOpen: true,
        createPostContent: initialContentOrPost.content || "",
        editPostData: initialContentOrPost
      });
    } else {
      // Default open
      set({
        isCreatePostOpen: true,
        createPostContent: "",
        editPostData: null
      });
    }
  },
  closeCreatePost: () => set({ isCreatePostOpen: false, createPostContent: "", editPostData: null }),
  toggleCreatePost: () => set((state) => ({ isCreatePostOpen: !state.isCreatePostOpen, editPostData: null })),

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  openEditProfileModal: () => set({ isEditProfileOpen: true }),
  closeEditProfileModal: () => set({ isEditProfileOpen: false }),

  openReplyModal: (post: Post) => set({ isReplyModalOpen: true, replyToPost: post }),
  closeReplyModal: () => set({ isReplyModalOpen: false, replyToPost: null }),

  showAlert: (title: string, message: string) => set({
    isAlertModalOpen: true,
    alertModal: { title, message }
  }),
  closeAlert: () => set({ isAlertModalOpen: false, alertModal: null }),

  showToast: (message: string) => {
    set({ toastMessage: message });
    // Auto-hide after 3 seconds
    setTimeout(() => set({ toastMessage: null }), 3000);
  },
  hideToast: () => set({ toastMessage: null }),

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  isReportProblemOpen: false,
  openReportProblemModal: () => set({ isReportProblemOpen: true }),
  closeReportProblemModal: () => set({ isReportProblemOpen: false }),

  isEditPostModalOpen: false,
  editPostData: null,
  openEditPostModal: (post) => set({ isEditPostModalOpen: true, editPostData: post }),
  closeEditPostModal: () => set({ isEditPostModalOpen: false, editPostData: null }),

  homeRefreshTrigger: 0,
  triggerHomeRefresh: () => set((state) => ({ homeRefreshTrigger: state.homeRefreshTrigger + 1 })),

  // Scroll Position Persistence
  homeScrollPosition: 0,
  setHomeScrollPosition: (position: number) => set({ homeScrollPosition: position }),
  clearHomeScrollPosition: () => set({ homeScrollPosition: 0 }),
}));
