import { postService, type CreatePostInput, type UpdatePostInput } from "./post.service.js";
import { requireAuth, type GraphQLContext } from "../context.js";
import { prisma } from "../../lib/prisma.js";

// Type for Post with optional computed fields
interface PostParent {
  id: string;
  authorId?: string;
  parentPostId?: string | null;
  author?: unknown;
  parentPost?: unknown;
  media?: unknown[];
}

export const postResolvers = {
  // =====================
  // FIELD RESOLVERS
  // =====================
  Post: {
    // Author relation (already included in queries, but needed for type safety)
    author: async (parent: PostParent) => {
      // If author is already loaded, return it
      if (parent.author) {
        return parent.author;
      }
      // Otherwise fetch it
      return prisma.user.findUnique({ where: { id: parent.authorId! } });
    },

    // Likes count
    likesCount: async (parent: PostParent) => {
      return postService.getLikesCount(parent.id);
    },

    // Replies count
    repliesCount: async (parent: PostParent) => {
      return postService.getRepliesCount(parent.id);
    },

    // Is current user liking this post
    isLiked: async (parent: PostParent, _: unknown, context: GraphQLContext) => {
      return postService.getIsLiked(parent.id, context.user?.id ?? null);
    },

    // Is current user bookmarking this post
    isBookmarked: async (parent: PostParent, _: unknown, context: GraphQLContext) => {
      return postService.getIsBookmarked(parent.id, context.user?.id ?? null);
    },

    // Is current user reposting this post
    isReposted: async (parent: PostParent, _: unknown, context: GraphQLContext) => {
      return postService.getIsReposted(parent.id, context.user?.id ?? null);
    },

    // Reposts count
    repostsCount: async (parent: PostParent) => {
      return postService.getRepostsCount(parent.id);
    },

    // Get post hashtags
    hashtags: async (parent: PostParent) => {
      return postService.getPostHashtags(parent.id);
    },

    // Get post mentions
    mentions: async (parent: PostParent) => {
      return postService.getPostMentions(parent.id);
    },

    // Parent post (for replies)
    parentPost: async (parent: PostParent) => {
      if (!parent.parentPostId) return null;
      if (parent.parentPost) {
        return parent.parentPost;
      }
      return prisma.post.findUnique({
        where: { id: parent.parentPostId },
        include: { author: true },
      });
    },

    // Media attachments
    media: async (parent: PostParent) => {
      if (parent.media && parent.media.length > 0) {
        return parent.media;
      }
      return prisma.postMedia.findMany({
        where: { postId: parent.id },
        orderBy: { position: "asc" },
      });
    },
  },

  // =====================
  // QUERIES
  // =====================
  Query: {
    // Get post by ID (PUBLIC - guests can view)
    getPostById: async (
      _: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      return postService.getPostById(args.id, context.user?.id);
    },

    // Get post replies (PUBLIC - guests can view)
    getPostReplies: async (
      _: unknown,
      args: { postId: string; first?: number; after?: string }
    ) => {
      return postService.getPostReplies(args.postId, {
        first: args.first ?? 20,
        after: args.after,
      });
    },

    // Get user posts (PUBLIC - but respects privacy settings)
    getUserPosts: async (
      _: unknown,
      args: { userId: string; filter?: "THREADS" | "REPLIES" | "REPOSTS"; first?: number; after?: string },
      context: GraphQLContext
    ) => {
      return postService.getUserPosts(args.userId, context.user?.id ?? null, {
        first: args.first ?? 20,
        after: args.after,
      }, args.filter);
    },

    // Get home feed (PROTECTED - authenticated users only)
    getHomeFeed: async (
      _: unknown,
      args: { first?: number; after?: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return postService.getHomeFeed(user.id, {
        first: args.first ?? 20,
        after: args.after,
      });
    },

    // Get trending posts (PUBLIC - guests can view)
    getTrendingPosts: async (
      _: unknown,
      args: { first?: number; after?: string }
    ) => {
      return postService.getTrendingPosts({
        first: args.first ?? 20,
        after: args.after,
      });
    },

    // Get public feed (PUBLIC - chronological order for guests)
    getPublicFeed: async (
      _: unknown,
      args: { first?: number; after?: string }
    ) => {
      return postService.getPublicFeed({
        first: args.first ?? 20,
        after: args.after,
      });
    },

    // Get posts by hashtag (PUBLIC - guests can view)
    getPostsByHashtag: async (
      _: unknown,
      args: { tag: string; first?: number; after?: string }
    ) => {
      return postService.getPostsByHashtag(args.tag, {
        first: args.first ?? 20,
        after: args.after,
      });
    },

    // Get my bookmarks (PROTECTED)
    getMyBookmarks: async (
      _: unknown,
      args: { first?: number; after?: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return postService.getMyBookmarks(user.id, {
        first: args.first ?? 20,
        after: args.after,
      });
    },
  },

  // =====================
  // MUTATIONS
  // =====================
  Mutation: {
    // Create post (PROTECTED)
    createPost: async (
      _: unknown,
      args: { input: CreatePostInput },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return postService.createPost(user.id, args.input);
    },

    // Update post (PROTECTED)
    updatePost: async (
      _: unknown,
      args: { postId: string; input: UpdatePostInput },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return postService.updatePost(user.id, args.postId, args.input);
    },

    // Delete post (PROTECTED)
    deletePost: async (
      _: unknown,
      args: { postId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return postService.deletePost(user.id, args.postId);
    },

    // Reply to post (PROTECTED)
    replyToPost: async (
      _: unknown,
      args: { parentPostId: string; content: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return postService.replyToPost(user.id, args.parentPostId, args.content);
    },

    // Like post (PROTECTED)
    likePost: async (
      _: unknown,
      args: { postId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return postService.likePost(user.id, args.postId);
    },

    // Unlike post (PROTECTED)
    unlikePost: async (
      _: unknown,
      args: { postId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return postService.unlikePost(user.id, args.postId);
    },

    // Bookmark post (PROTECTED)
    bookmarkPost: async (
      _: unknown,
      args: { postId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return postService.bookmarkPost(user.id, args.postId);
    },

    // Unbookmark post (PROTECTED)
    unbookmarkPost: async (
      _: unknown,
      args: { postId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return postService.unbookmarkPost(user.id, args.postId);
    },

    // Repost post (PROTECTED)
    repostPost: async (
      _: unknown,
      args: { postId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return postService.repostPost(user.id, args.postId);
    },

    // Unrepost post (PROTECTED)
    unrepostPost: async (
      _: unknown,
      args: { postId: string },
      context: GraphQLContext
    ) => {
      const user = requireAuth(context);
      return postService.unrepostPost(user.id, args.postId);
    },
  },
};
