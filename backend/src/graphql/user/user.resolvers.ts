import {
  userService,
  type CreateUserData,
  type LoginPayload,
} from "./user.service.js";
import {
  requireAuth,
  type GraphQLContext,
  setAuthCookies,
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
} from "../context.js";

export const userResolvers = {
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
  },

  Mutation: {
    // Public: Create user (registration)
    createUser: async (_: unknown, args: CreateUserData) => {
      return userService.createUser(args);
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
        throw new Error("No refresh token provided");
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
  },
};
