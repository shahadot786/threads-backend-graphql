import {
  userService,
  type CreateUserData,
  type LoginPayload,
  type UpdateUserProfileInput,
} from "./user.service.js";
import {
  requireAuth,
  type GraphQLContext,
  setAuthCookies,
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
} from "../context.js";
import { Errors } from "../errors.js";

export const userResolvers = {
  // Field resolvers for User type
  User: {
    stats: async (parent: { id: string }) => {
      return userService.getUserStats(parent.id);
    },
  },

  Query: {
    // Protected: Get all users
    getUsers: async (_: unknown, __: unknown, context: GraphQLContext) => {
      requireAuth(context);
      return userService.getAllUsers();
    },

    // Protected: Get user by ID
    getUserById: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      return userService.getUserById(args.id);
    },

    // Public: Get user by username (guests can view profiles)
    getUserByUsername: async (
      _: unknown,
      args: { username: string },
      _context: GraphQLContext
    ) => {
      return userService.getUserByUsername(args.username);
    },

    // Protected: Get user by email
    getUserByEmail: async (
      _: unknown,
      args: { email: string },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      return userService.getUserByEmail(args.email);
    },

    // Protected: Get current logged-in user
    getCurrentLoggedInUser: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      return requireAuth(context);
    },

    // Protected: Get followers of a user
    getFollowers: async (
      _: unknown,
      args: { userId: string },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      return userService.getFollowers(args.userId);
    },

    // Protected: Get users that a user is following
    getFollowing: async (
      _: unknown,
      args: { userId: string },
      context: GraphQLContext
    ) => {
      requireAuth(context);
      return userService.getFollowing(args.userId);
    },

    // Protected: Get blocked users
    getBlockedUsers: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return userService.getBlockedUsers(user.id);
    },

    // Protected: Get my notifications
    getMyNotifications: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return userService.getMyNotifications(user.id);
    },
  },

  Mutation: {
    // Public: Create user (registration)
    createUser: async (_: unknown, args: CreateUserData) => {
      return userService.createUser(args);
    },

    // Protected: Update user profile
    updateUserProfile: async (
      _: unknown,
      args: { input: UpdateUserProfileInput },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return userService.updateUserProfile(user.id, args.input);
    },

    // Public: Login
    login: async (
      _: unknown,
      args: LoginPayload,
      context: GraphQLContext
    ) => {
      const { accessToken, refreshToken, user } = await userService.login(args);

      // Set httpOnly cookies
      setAuthCookies(context.res, accessToken, refreshToken);

      return {
        accessToken,
        user: await userService.getUserById(user.id),
      };
    },

    // Public: Refresh access token
    refreshToken: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      const refreshTokenValue = context.req.cookies?.[REFRESH_TOKEN_COOKIE];

      if (!refreshTokenValue) {
        throw Errors.unauthenticated("No refresh token provided");
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await userService.refreshAccessToken(refreshTokenValue);

      // Set new cookies
      setAuthCookies(context.res, accessToken, newRefreshToken);

      // Get user from new access token
      const user = context.user;

      return {
        accessToken,
        user,
      };
    },

    // Protected: Logout
    logout: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const refreshTokenValue = context.req.cookies?.[REFRESH_TOKEN_COOKIE];

      if (refreshTokenValue) {
        await userService.logout(refreshTokenValue);
      }

      clearAuthCookies(context.res);
      return true;
    },

    // Protected: Logout from all devices
    logoutAll: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const user = requireAuth(context);
      await userService.logoutAll(user.id);
      clearAuthCookies(context.res);
      return true;
    },

    // Protected: Follow a user
    followUser: async (
      _: unknown,
      args: { userId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return userService.followUser(user.id, args.userId);
    },

    // Protected: Unfollow a user
    unfollowUser: async (
      _: unknown,
      args: { userId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return userService.unfollowUser(user.id, args.userId);
    },

    // Protected: Block a user
    blockUser: async (
      _: unknown,
      args: { userId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return userService.blockUser(user.id, args.userId);
    },

    // Protected: Unblock a user
    unblockUser: async (
      _: unknown,
      args: { userId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return userService.unblockUser(user.id, args.userId);
    },

    // Protected: Mark notification as read
    markNotificationAsRead: async (
      _: unknown,
      args: { notificationId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return userService.markNotificationAsRead(user.id, args.notificationId);
    },

    // Protected: Mark all notifications as read
    markAllNotificationsAsRead: async (
      _: unknown,
      __: unknown,
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return userService.markAllNotificationsAsRead(user.id);
    },

    // Password Recovery
    forgotPassword: async (_: unknown, args: { email: string }) => {
      return userService.forgotPassword(args.email);
    },

    resetPassword: async (
      _: unknown,
      args: { token: string; newPassword: string }
    ) => {
      return userService.resetPassword(args.token, args.newPassword);
    },
  },
};
