import { userService } from "./user.service.js";
import { requireAuth, requireSupabaseAuth } from "../context.js";

export const userResolvers = {
  Query: {
    // Get all users
    getUsers: async (_: any, __: any, context: any) => {
      // requireAuth(context);
      return userService.getAllUsers();
    },

    // Get user by ID
    getUserById: async (_: any, { id }: { id: string }, context: any) => {
      // requireAuth(context);
      return userService.getUserById(id);
    },

    // Get user by username
    getUserByUsername: async (_: any, { username }: { username: string }) => {
      return userService.getUserByUsername(username);
    },

    // Get user by email
    getUserByEmail: async (_: any, { email }: { email: string }, context: any) => {
      requireAuth(context);
      return userService.getUserByEmail(email);
    },

    // Get current logged in user
    getCurrentLoggedInUser: async (_: any, __: any, context: any) => {
      return context.user;
    },

    // Get suggested users
    getSuggestedUsers: async (_: any, { first }: { first: number }, context: any) => {
      // requireAuth(context);
      return userService.getSuggestedUsers(first);
    },

    // Get followers
    getFollowers: async (_: any, { userId }: { userId: string }, context: any) => {
      requireAuth(context);
      return userService.getFollowers(userId);
    },

    // Get following
    getFollowing: async (_: any, { userId }: { userId: string }, context: any) => {
      requireAuth(context);
      return userService.getFollowing(userId);
    },

    // Get blocked users
    getBlockedUsers: async (_: any, __: any, context: any) => {
      const user = requireAuth(context);
      return userService.getBlockedUsers(user.id);
    },

    // Get notifications
    getMyNotifications: async (_: any, __: any, context: any) => {
      const user = requireAuth(context);
      return userService.getMyNotifications(user.id);
    },
  },

  Mutation: {
    // Create User Profile (after Supabase Signup)
    createUser: async (_: any, args: any, context: any) => {
      // Ensure user has a valid Supabase session
      const supabaseUser = requireSupabaseAuth(context);

      // Use the ID from Supabase Auth to create the profile
      // This links the Auth User to the Public Profile
      return userService.createUser({
        ...args,
        id: supabaseUser.id,
      });
    },

    // Update user profile
    updateUserProfile: async (_: any, { input }: { input: any }, context: any) => {
      const user = requireAuth(context);
      return userService.updateUserProfile(user.id, input);
    },

    // Follow user
    followUser: async (_: any, { userId }: { userId: string }, context: any) => {
      const user = requireAuth(context);
      return userService.followUser(user.id, userId);
    },

    // Unfollow user
    unfollowUser: async (_: any, { userId }: { userId: string }, context: any) => {
      const user = requireAuth(context);
      return userService.unfollowUser(user.id, userId);
    },

    // Block user
    blockUser: async (_: any, { userId }: { userId: string }, context: any) => {
      const user = requireAuth(context);
      return userService.blockUser(user.id, userId);
    },

    // Unblock user
    unblockUser: async (_: any, { userId }: { userId: string }, context: any) => {
      const user = requireAuth(context);
      return userService.unblockUser(user.id, userId);
    },

    // Mark notification as read
    markNotificationAsRead: async (_: any, { notificationId }: { notificationId: string }, context: any) => {
      const user = requireAuth(context);
      return userService.markNotificationAsRead(user.id, notificationId);
    },

    // Mark all notifications as read
    markAllNotificationsAsRead: async (_: any, __: any, context: any) => {
      const user = requireAuth(context);
      return userService.markAllNotificationsAsRead(user.id);
    },
  },

  User: {
    // Resolve computed fields
    stats: async (parent: any) => {
      return userService.getUserStats(parent.id);
    },

    isFollowing: async (parent: any, _: any, context: any) => {
      if (!context.user) return false;
      return userService.isFollowing(context.user.id, parent.id);
    }
  },
};
