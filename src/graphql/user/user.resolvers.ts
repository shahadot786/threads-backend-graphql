import { userService, type CreateUserData } from "./user.service.js";

export const userResolvers = {
  Query: {
    getUsers: async () => {
      return userService.getAllUsers();
    },
    getUserById: async (_: unknown, args: { id: string }) => {
      return userService.getUserById(args.id);
    },
  },
  Mutation: {
    createUser: async (_: unknown, args: CreateUserData) => {
      return userService.createUser(args);
    },
  },
};
