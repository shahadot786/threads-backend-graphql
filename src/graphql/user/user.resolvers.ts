import {
  userService,
  type CreateUserData,
  type GetUserTokenPayload,
} from "./user.service.js";
import { requireAuth, type GraphQLContext } from "../context.js";

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

    // Public: Get token (login)
    getUserToken: async (_: unknown, args: GetUserTokenPayload) => {
      return userService.getUserToken(args);
    },
  },
};
