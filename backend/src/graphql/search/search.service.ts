import { prisma } from "../../lib/prisma.js";

// =====================
// HELPER FUNCTIONS
// =====================

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
// SEARCH SERVICE
// =====================

export const searchService = {
  // =====================
  // SEARCH USERS
  // =====================
  async searchUsers(query: string, first = 20, _after?: string) {
    const searchQuery = query.toLowerCase();

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: searchQuery, mode: "insensitive" } },
          { firstName: { contains: searchQuery, mode: "insensitive" } },
          { lastName: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
      take: first + 1,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const hasNextPage = users.length > first;
    const edges = users.slice(0, first).map((user) => ({
      cursor: encodeCursor(user.createdAt, user.id),
      node: user,
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
  // SEARCH POSTS
  // =====================
  async searchPosts(query: string, first = 20, _after?: string) {
    const searchQuery = query.toLowerCase();

    const posts = await prisma.post.findMany({
      where: {
        visibility: "PUBLIC",
        content: { contains: searchQuery, mode: "insensitive" },
      },
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
  // SEARCH HASHTAGS
  // =====================
  async searchHashtags(query: string, first = 20) {
    const searchQuery = query.toLowerCase().replace("#", "");

    return prisma.hashtag.findMany({
      where: {
        tag: { contains: searchQuery, mode: "insensitive" },
      },
      take: first,
      orderBy: { usageCount: "desc" },
    });
  },

  // =====================
  // GET TRENDING HASHTAGS
  // =====================
  async getTrendingHashtags(first = 10) {
    return prisma.hashtag.findMany({
      take: first,
      orderBy: { usageCount: "desc" },
    });
  },
};
