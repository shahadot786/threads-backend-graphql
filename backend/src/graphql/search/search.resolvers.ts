import { searchService } from "./search.service.js";
import type { GraphQLContext } from "../context.js";

export const searchResolvers = {
  Query: {
    // Search users (PUBLIC)
    searchUsers: async (
      _: unknown,
      args: { query: string; first?: number; after?: string },
      _context: GraphQLContext
    ) => {
      return searchService.searchUsers(args.query, args.first, args.after);
    },

    // Search posts (PUBLIC)
    searchPosts: async (
      _: unknown,
      args: { query: string; first?: number; after?: string },
      _context: GraphQLContext
    ) => {
      return searchService.searchPosts(args.query, args.first, args.after);
    },

    // Search hashtags (PUBLIC)
    searchHashtags: async (
      _: unknown,
      args: { query: string; first?: number },
      _context: GraphQLContext
    ) => {
      return searchService.searchHashtags(args.query, args.first);
    },

    // Get trending hashtags (PUBLIC)
    getTrendingHashtags: async (
      _: unknown,
      args: { first?: number },
      _context: GraphQLContext
    ) => {
      return searchService.getTrendingHashtags(args.first);
    },
  },
};
