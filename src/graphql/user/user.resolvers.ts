import {
  userService,
  type CreateUserData,
  type GetUserTokenPayload,
} from "./user.service.js";

export const userResolvers = {
  Query: {
    getUsers: async () => {
      return userService.getAllUsers();
    },
    getUserById: async (_: unknown, args: { id: string }) => {
      return userService.getUserById(args.id);
    },
    getUserByEmail: async (_: unknown, args: { email: string }) => {
      return userService.getUserByEmail(args.email);
    },
  },
  Mutation: {
    createUser: async (_: unknown, args: CreateUserData) => {
      return userService.createUser(args);
    },
    getUserToken: async (_: unknown, args: GetUserTokenPayload) => {
      return userService.getUserToken(args);
    },
  },
};
