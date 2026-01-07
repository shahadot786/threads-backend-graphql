import { prisma } from "../../lib/prisma.js";
import { Errors } from "../errors.js";
import type { PostVisibility, MediaType, Prisma } from "../../../generated/prisma/client.js";

// =====================
// TYPES
// =====================

export interface CreatePostInput {
  content?: string;
  visibility?: PostVisibility;
  media?: CreatePostMediaInput[];
}

export interface CreatePostMediaInput {
  mediaType: MediaType;
  mediaUrl: string;
  position?: number;
}

export interface UpdatePostInput {
  content?: string;
  visibility?: PostVisibility;
}

export interface PaginationInput {
  first?: number;
  after?: string | undefined;
}

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Extract hashtags from content (e.g., #thread -> thread)
 */
function extractHashtags(content: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex);
  if (!matches) return [];
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
}

/**
 * Extract mentions from content (e.g., @username -> username)
 */
function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = content.match(mentionRegex);
  if (!matches) return [];
  return [...new Set(matches.map((mention) => mention.slice(1).toLowerCase()))];
}

/**
 * Decode cursor for pagination
 */
function decodeCursor(cursor: string): { createdAt: Date; id: string } {
  const decoded = Buffer.from(cursor, "base64").toString("utf-8");
  const parts = decoded.split(":");
  const createdAt = parts[0] ?? "";
  const id = parts[1] ?? "";
  return { createdAt: new Date(createdAt), id };
}

/**
 * Encode cursor for pagination
 */
function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}:${id}`).toString("base64");
}

/**
 * Get last cursor from edges array safely
 */
function getEndCursor<T extends { cursor: string }>(edges: T[]): string | null {
  if (edges.length === 0) return null;
  const lastEdge = edges[edges.length - 1];
  return lastEdge?.cursor ?? null;
}

// =====================
// POST SERVICE
// =====================

export const postService = {
  // =====================
  // CREATE POST
  // =====================
  async createPost(authorId: string, input: CreatePostInput) {
    const { content, visibility = "PUBLIC", media } = input;

    // Validate: must have content or media
    if (!content && (!media || media.length === 0)) {
      throw Errors.badRequest("Post must have content or media");
    }

    // Extract hashtags and mentions from content
    const hashtagNames = content ? extractHashtags(content) : [];
    const mentionUsernames = content ? extractMentions(content) : [];

    // Build post data
    const postData: Prisma.PostUncheckedCreateInput = {
      content: content ?? null,
      visibility,
      authorId,
    };

    // Create post with transaction
    return prisma.$transaction(async (tx) => {
      // Build create data
      const createData = {
        ...postData,
        ...(media && media.length > 0
          ? {
            media: {
              create: media.map((m, index) => ({
                mediaType: m.mediaType,
                mediaUrl: m.mediaUrl,
                position: m.position ?? index,
              })),
            },
          }
          : {}),
      };

      // Create the post
      const post = await tx.post.create({
        data: createData,
        include: {
          author: true,
          media: true,
        },
      });

      // Process hashtags
      if (hashtagNames.length > 0) {
        for (const tag of hashtagNames) {
          // Upsert hashtag
          const hashtag = await tx.hashtag.upsert({
            where: { tag },
            create: { tag, usageCount: 1 },
            update: { usageCount: { increment: 1 } },
          });

          // Link to post
          await tx.postHashtag.create({
            data: { postId: post.id, hashtagId: hashtag.id },
          });
        }
      }

      // Process mentions
      if (mentionUsernames.length > 0) {
        for (const username of mentionUsernames) {
          const mentionedUser = await tx.user.findUnique({
            where: { username },
          });

          if (mentionedUser && mentionedUser.id !== authorId) {
            // Link mention to post
            await tx.postMention.create({
              data: { postId: post.id, mentionedUserId: mentionedUser.id },
            });

            // Create notification for mentioned user
            await tx.notification.create({
              data: {
                userId: mentionedUser.id,
                actorId: authorId,
                type: "MENTION",
                entityId: post.id,
              },
            });
          }
        }
      }

      return post;
    });
  },

  // =====================
  // REPLY TO POST
  // =====================
  async replyToPost(authorId: string, parentPostId: string, content: string) {
    // Verify parent post exists
    const parentPost = await prisma.post.findUnique({
      where: { id: parentPostId },
      select: { id: true, authorId: true, visibility: true },
    });

    if (!parentPost) {
      throw Errors.notFound("Post");
    }

    // Create reply
    const reply = await this.createPost(authorId, {
      content,
      visibility: parentPost.visibility,
    });

    // Link reply to parent
    await prisma.post.update({
      where: { id: reply.id },
      data: { parentPostId },
    });

    // Create notification for parent post author (if not self-reply)
    if (parentPost.authorId !== authorId) {
      await prisma.notification.create({
        data: {
          userId: parentPost.authorId,
          actorId: authorId,
          type: "REPLY",
          entityId: reply.id,
        },
      });
    }

    return prisma.post.findUnique({
      where: { id: reply.id },
      include: { author: true, parentPost: true, media: true },
    });
  },

  // =====================
  // UPDATE POST
  // =====================
  async updatePost(userId: string, postId: string, input: UpdatePostInput) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw Errors.notFound("Post");
    }

    if (post.authorId !== userId) {
      throw Errors.forbidden("You can only edit your own posts");
    }

    const updateData: Prisma.PostUpdateInput = {};
    if (input.content !== undefined) updateData.content = input.content;
    if (input.visibility !== undefined) updateData.visibility = input.visibility;

    return prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: { author: true, media: true },
    });
  },

  // =====================
  // DELETE POST
  // =====================
  async deletePost(userId: string, postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      throw Errors.notFound("Post");
    }

    if (post.authorId !== userId) {
      throw Errors.forbidden("You can only delete your own posts");
    }

    await prisma.post.delete({ where: { id: postId } });
    return true;
  },

  // =====================
  // GET POST BY ID
  // =====================
  async getPostById(postId: string, currentUserId?: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        parentPost: { include: { author: true } },
        media: { orderBy: { position: "asc" } },
        hashtags: { include: { hashtag: true } },
        mentions: { include: { mentionedUser: true } },
      },
    });

    if (!post) {
      throw Errors.notFound("Post");
    }

    // Check visibility for private posts
    if (post.visibility === "PRIVATE" && post.authorId !== currentUserId) {
      throw Errors.forbidden("This post is private");
    }

    // Check if author's account is private and viewer doesn't follow them
    if (post.author.is_private && post.authorId !== currentUserId) {
      const isFollowing = currentUserId
        ? await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: post.authorId,
            },
          },
        })
        : null;

      if (!isFollowing) {
        throw Errors.forbidden("This account is private");
      }
    }

    return post;
  },

  // =====================
  // GET POST REPLIES (with pagination)
  // =====================
  async getPostReplies(postId: string, pagination: PaginationInput = {}) {
    const { first = 20, after } = pagination;

    const whereClause: Prisma.PostWhereInput = {
      parentPostId: postId,
    };

    if (after) {
      const { createdAt, id } = decodeCursor(after);
      whereClause.OR = [
        { createdAt: { lt: createdAt } },
        { createdAt, id: { lt: id } },
      ];
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      take: first + 1,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        author: true,
        media: { orderBy: { position: "asc" } },
      },
    });

    const hasNextPage = posts.length > first;
    const edges = posts.slice(0, first).map((post) => ({
      cursor: encodeCursor(post.createdAt, post.id),
      node: post,
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor: getEndCursor(edges),
      },
    };
  },

  // =====================
  // GET USER POSTS (with pagination)
  // =====================
  async getUserPosts(
    userId: string,
    currentUserId: string | null,
    pagination: PaginationInput = {}
  ) {
    const { first = 20, after } = pagination;

    // Check if viewing own posts or if user is private
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { is_private: true },
    });

    if (!targetUser) {
      throw Errors.notFound("User");
    }

    // If private and not following, don't show posts
    if (targetUser.is_private && userId !== currentUserId) {
      const isFollowing = currentUserId
        ? await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: userId,
            },
          },
        })
        : null;

      if (!isFollowing) {
        return { edges: [], pageInfo: { hasNextPage: false, endCursor: null } };
      }
    }

    const whereClause: Prisma.PostWhereInput = {
      authorId: userId,
      parentPostId: null, // Only top-level posts, not replies
    };

    if (after) {
      const { createdAt, id } = decodeCursor(after);
      whereClause.OR = [
        { createdAt: { lt: createdAt } },
        { createdAt, id: { lt: id } },
      ];
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      take: first + 1,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        author: true,
        media: { orderBy: { position: "asc" } },
      },
    });

    const hasNextPage = posts.length > first;
    const edges = posts.slice(0, first).map((post) => ({
      cursor: encodeCursor(post.createdAt, post.id),
      node: post,
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor: getEndCursor(edges),
      },
    };
  },

  // =====================
  // GET HOME FEED (posts from followed users)
  // =====================
  async getHomeFeed(_userId: string, pagination: PaginationInput = {}) {
    const { first = 20, after } = pagination;

    const whereClause: Prisma.PostWhereInput = {
      parentPostId: null, // Only top-level posts
      visibility: { in: ["PUBLIC", "FOLLOWERS"] },
    };

    if (after) {
      const { createdAt, id } = decodeCursor(after);
      whereClause.OR = [
        { createdAt: { lt: createdAt } },
        { createdAt, id: { lt: id } },
      ];
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      take: first + 1,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        author: true,
        media: { orderBy: { position: "asc" } },
      },
    });

    const hasNextPage = posts.length > first;
    const edges = posts.slice(0, first).map((post) => ({
      cursor: encodeCursor(post.createdAt, post.id),
      node: post,
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor: getEndCursor(edges),
      },
    };
  },

  // =====================
  // GET PUBLIC FEED (public posts, sorted by createdAt for guests)
  // =====================
  async getPublicFeed(pagination: PaginationInput = {}) {
    const { first = 20, after } = pagination;

    const whereClause: Prisma.PostWhereInput = {
      parentPostId: null, // Only top-level posts
      visibility: "PUBLIC",
    };

    if (after) {
      const { createdAt, id } = decodeCursor(after);
      whereClause.OR = [
        { createdAt: { lt: createdAt } },
        { createdAt, id: { lt: id } },
      ];
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      take: first + 1,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        author: true,
        media: { orderBy: { position: "asc" } },
      },
    });

    const hasNextPage = posts.length > first;
    const edges = posts.slice(0, first).map((post) => ({
      cursor: encodeCursor(post.createdAt, post.id),
      node: post,
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor: getEndCursor(edges),
      },
    };
  },

  // =====================
  // GET TRENDING POSTS (public posts, sorted by engagement)
  // =====================
  async getTrendingPosts(pagination: PaginationInput = {}) {
    const { first = 20, after } = pagination;

    // For trending, we use a simple approach: recent public posts with most likes
    // In production, you'd use a more sophisticated algorithm

    const whereClause: Prisma.PostWhereInput = {
      visibility: "PUBLIC",
      parentPostId: null,
      // Last 7 days
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    };

    if (after) {
      const { createdAt, id } = decodeCursor(after);
      whereClause.OR = [
        { createdAt: { lt: createdAt } },
        { createdAt, id: { lt: id } },
      ];
    }

    // Get posts with like counts
    const posts = await prisma.post.findMany({
      where: whereClause,
      take: first + 1,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        author: true,
        media: { orderBy: { position: "asc" } },
        _count: { select: { likes: true, replies: true } },
      },
    });

    // Sort by engagement (likes + replies), fallback to recency
    // Primary: engagement score (higher first)
    // Secondary: createdAt (newer first - higher timestamp first)
    // Tertiary: id (for consistent ordering)
    posts.sort((a, b) => {
      const scoreA = (a._count?.likes || 0) + (a._count?.replies || 0);
      const scoreB = (b._count?.likes || 0) + (b._count?.replies || 0);

      // Sort by engagement score (higher first)
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      // If scores are equal, sort by createdAt DESC (newer posts first)
      const timeDiff = b.createdAt.getTime() - a.createdAt.getTime();
      if (timeDiff !== 0) {
        return timeDiff;
      }

      // Tertiary sort by id for consistent ordering
      return b.id.localeCompare(a.id);
    });

    const hasNextPage = posts.length > first;
    const edges = posts.slice(0, first).map((post) => ({
      cursor: encodeCursor(post.createdAt, post.id),
      node: post,
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor: getEndCursor(edges),
      },
    };
  },

  // =====================
  // GET POSTS BY HASHTAG
  // =====================
  async getPostsByHashtag(tag: string, pagination: PaginationInput = {}) {
    const { first = 20 } = pagination;

    const hashtag = await prisma.hashtag.findUnique({
      where: { tag: tag.toLowerCase() },
    });

    if (!hashtag) {
      return { edges: [], pageInfo: { hasNextPage: false, endCursor: null } };
    }

    const whereClause: Prisma.PostHashtagWhereInput = {
      hashtagId: hashtag.id,
      post: { visibility: "PUBLIC" },
    };

    const postHashtags = await prisma.postHashtag.findMany({
      where: whereClause,
      take: first + 1,
      orderBy: { post: { createdAt: "desc" } },
      include: {
        post: {
          include: {
            author: true,
            media: { orderBy: { position: "asc" } },
          },
        },
      },
    });

    const hasNextPage = postHashtags.length > first;
    const edges = postHashtags.slice(0, first).map((ph) => ({
      cursor: encodeCursor(ph.post.createdAt, ph.post.id),
      node: ph.post,
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor: getEndCursor(edges),
      },
    };
  },

  // =====================
  // LIKE POST
  // =====================
  async likePost(userId: string, postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      throw Errors.notFound("Post");
    }

    // Check if already liked
    const existingLike = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingLike) {
      throw Errors.conflict("You have already liked this post");
    }

    await prisma.postLike.create({
      data: { userId, postId },
    });

    // Create notification for post author (if not self-like)
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          actorId: userId,
          type: "LIKE",
          entityId: postId,
        },
      });
    }

    return true;
  },

  // =====================
  // UNLIKE POST
  // =====================
  async unlikePost(userId: string, postId: string) {
    const like = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (!like) {
      throw Errors.notFound("Like");
    }

    await prisma.postLike.delete({
      where: { userId_postId: { userId, postId } },
    });

    return true;
  },

  // =====================
  // BOOKMARK POST
  // =====================
  async bookmarkPost(userId: string, postId: string) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw Errors.notFound("Post");
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingBookmark) {
      throw Errors.conflict("You have already bookmarked this post");
    }

    await prisma.bookmark.create({
      data: { userId, postId },
    });

    return true;
  },

  // =====================
  // UNBOOKMARK POST
  // =====================
  async unbookmarkPost(userId: string, postId: string) {
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (!bookmark) {
      throw Errors.notFound("Bookmark");
    }

    await prisma.bookmark.delete({
      where: { userId_postId: { userId, postId } },
    });

    return true;
  },

  // =====================
  // GET MY BOOKMARKS
  // =====================
  async getMyBookmarks(userId: string, pagination: PaginationInput = {}) {
    const { first = 20 } = pagination;

    const whereClause: Prisma.BookmarkWhereInput = {
      userId,
    };

    const bookmarks = await prisma.bookmark.findMany({
      where: whereClause,
      take: first + 1,
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            author: true,
            media: { orderBy: { position: "asc" } },
          },
        },
      },
    });

    const hasNextPage = bookmarks.length > first;
    const edges = bookmarks.slice(0, first).map((bookmark) => ({
      cursor: encodeCursor(bookmark.createdAt, bookmark.id),
      node: bookmark.post,
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage,
        endCursor: getEndCursor(edges),
      },
    };
  },

  // =====================
  // FIELD RESOLVERS (computed fields)
  // =====================
  async getLikesCount(postId: string) {
    return prisma.postLike.count({ where: { postId } });
  },

  async getRepliesCount(postId: string) {
    return prisma.post.count({ where: { parentPostId: postId } });
  },

  async getIsLiked(postId: string, userId: string | null) {
    if (!userId) return false;
    const like = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    return !!like;
  },

  async getIsBookmarked(postId: string, userId: string | null) {
    if (!userId) return false;
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    return !!bookmark;
  },

  async getPostHashtags(postId: string) {
    const postHashtags = await prisma.postHashtag.findMany({
      where: { postId },
      include: { hashtag: true },
    });
    return postHashtags.map((ph) => ph.hashtag);
  },

  async getPostMentions(postId: string) {
    const mentions = await prisma.postMention.findMany({
      where: { postId },
      include: { mentionedUser: true },
    });
    return mentions.map((m) => m.mentionedUser);
  },
};
