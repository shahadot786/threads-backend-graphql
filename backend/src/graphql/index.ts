import { userTypeDefs } from "./user/user.typeDefs.js";
import { userResolvers } from "./user/user.resolvers.js";
import { postTypeDefs } from "./post/post.typeDefs.js";
import { postResolvers } from "./post/post.resolvers.js";
import { searchTypeDefs } from "./search/search.typeDefs.js";
import { searchResolvers } from "./search/search.resolvers.js";
import { reportTypeDefs } from "./report/report.typeDefs.js";
import { reportResolvers } from "./report/report.resolvers.js";

// Base types that can be extended
const baseTypeDefs = /* GraphQL */ `
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

// Merge all typeDefs
export const typeDefs = [baseTypeDefs, userTypeDefs, postTypeDefs, searchTypeDefs, reportTypeDefs];

// Deep merge resolvers
function mergeResolvers(...resolverArrays: Record<string, unknown>[]) {
  const merged: Record<string, Record<string, unknown>> = {};

  for (const resolvers of resolverArrays) {
    for (const [key, value] of Object.entries(resolvers)) {
      if (!merged[key]) {
        merged[key] = {};
      }
      Object.assign(merged[key], value);
    }
  }

  return merged;
}

// Merge all resolvers
export const resolvers = mergeResolvers(userResolvers, postResolvers, searchResolvers, reportResolvers);
