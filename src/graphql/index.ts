import { userTypeDefs } from "./user/user.typeDefs.js";
import { userResolvers } from "./user/user.resolvers.js";

// Merge all typeDefs
export const typeDefs = [userTypeDefs];

// Merge all resolvers
export const resolvers = [userResolvers];
