import { prisma } from "../../lib/prisma.js";
import { Errors } from "../errors.js";
import type { User } from "../../../generated/prisma/client.js";

export interface CreateUserData {
  id?: string; // Optional because we might auto-generate or pass from Supabase
  firstName: string;
  lastName?: string;
  username?: string;
  profileImageUrl?: string;
  email: string;
}

export interface UpdateUserProfileInput {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  website?: string;
  location?: string;
  dob?: string;
  profileImageUrl?: string;
  is_private?: boolean;
}

// Generate a unique username based on firstName and lastName
async function generateUniqueUsername(
  firstName: string,
  lastName?: string
): Promise<string> {
  // Create base username from firstName and lastName (lowercase, no spaces)
  const baseName = `${firstName}${lastName || ""}`
    .toLowerCase()
    .replace(/\s+/g, "");

  let username = baseName;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Check if username exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!existingUser) {
      isUnique = true;
    } else {
      // Add random 4-digit number to make it unique
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      username = `${baseName}${randomNum}`;
      attempts++;
    }
  }

  // If still not unique after max attempts, use timestamp
  if (!isUnique) {
    username = `${baseName}${Date.now()}`;
  }

  return username;
}

// Check if username is unique (for updates)
async function isUsernameUnique(
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (!existingUser) return true;
  if (excludeUserId && existingUser.id === excludeUserId) return true;
  return false;
}

export const userService = {
  // Create new user (Profile) - ID should come from Supabase Auth
  async createUser(data: CreateUserData) {
    if (!data.id) {
      throw Errors.badRequest("User ID is required");
    }

    // Generate username if not provided
    let username = data.username;
    if (!username) {
      username = await generateUniqueUsername(data.firstName, data.lastName);
    } else {
      // Verify provided username is unique
      const isUnique = await isUsernameUnique(username);
      if (!isUnique) {
        throw Errors.conflict("Username already taken");
      }
    }

    return prisma.user.create({
      data: {
        id: data.id, // Use ID from Supabase Auth if provided
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        username,
        profileImageUrl: data.profileImageUrl ?? null,
        email: data.email,
      },
    });
  },

  // Get all users
  async getAllUsers() {
    return prisma.user.findMany();
  },

  // Get suggested users (ordered by follower count)
  async getSuggestedUsers(first: number = 10) {
    const users = await prisma.user.findMany({
      take: 50, // Fetch a pool
      include: {
        _count: {
          select: { followers: true }
        }
      }
    });

    // Sort by follower count descending with safety check
    const sorted = users.sort((a, b) => {
      const countA = (a as any)._count?.followers ?? 0;
      const countB = (b as any)._count?.followers ?? 0;
      return countB - countA;
    });

    return sorted.slice(0, first);
  },

  // Get user by ID
  async getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  // Get user by email
  async getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  // Get user by username
  async getUserByUsername(username: string) {
    return prisma.user.findUnique({ where: { username } });
  },

  // Update user profile
  async updateUserProfile(userId: string, input: UpdateUserProfileInput) {
    // Verify username uniqueness if being updated
    if (input.username !== undefined) {
      const isUnique = await isUsernameUnique(input.username, userId);
      if (!isUnique) {
        throw Errors.conflict("Username already taken");
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.firstName !== undefined && { firstName: input.firstName }),
        ...(input.lastName !== undefined && { lastName: input.lastName }),
        ...(input.username !== undefined && { username: input.username }),
        ...(input.bio !== undefined && { bio: input.bio }),
        ...(input.website !== undefined && { website: input.website }),
        ...(input.location !== undefined && { location: input.location }),
        ...(input.dob !== undefined && {
          dob: input.dob ? new Date(input.dob) : null,
        }),
        ...(input.profileImageUrl !== undefined && {
          profileImageUrl: input.profileImageUrl,
        }),
        ...(input.is_private !== undefined && { is_private: input.is_private }),
      },
    });
  },

  // Get user stats
  async getUserStats(userId: string) {
    const [followersCount, followingCount, postsCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
      prisma.post.count({ where: { authorId: userId, parentPostId: null } }),
    ]);

    return {
      followersCount,
      followingCount,
      postsCount,
    };
  },

  // Follow a user
  async followUser(followerId: string, userId: string) {
    if (followerId === userId) {
      throw Errors.badRequest("You cannot follow yourself");
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      throw Errors.conflict("Already following this user");
    }

    await prisma.follow.create({
      data: {
        followerId,
        followingId: userId,
      },
    });

    // Create notification for the followed user
    await prisma.notification.create({
      data: {
        userId,
        actorId: followerId,
        type: "FOLLOW",
      },
    });

    return true;
  },

  // Unfollow a user
  async unfollowUser(followerId: string, userId: string) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId,
        },
      },
    });

    return true;
  },

  // Check if user follows target user
  async isFollowing(followerId: string, followingId: string) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    return !!follow;
  },

  // Get followers of a user
  async getFollowers(userId: string) {
    const follows = await prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: true },
    });

    return follows.map((f) => f.follower);
  },

  // Get users that a user is following
  async getFollowing(userId: string) {
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: true },
    });

    return follows.map((f) => f.following);
  },

  // Block a user
  async blockUser(blockerId: string, userId: string) {
    if (blockerId === userId) {
      throw Errors.badRequest("You cannot block yourself");
    }

    const existingBlock = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId: userId,
        },
      },
    });

    if (existingBlock) {
      throw Errors.conflict("Already blocked this user");
    }

    await prisma.block.create({
      data: {
        blockerId,
        blockedId: userId,
      },
    });

    // Also unfollow each other if following
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: blockerId, followingId: userId },
          { followerId: userId, followingId: blockerId },
        ],
      },
    });

    return true;
  },

  // Unblock a user
  async unblockUser(blockerId: string, userId: string) {
    await prisma.block.delete({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId: userId,
        },
      },
    });

    return true;
  },

  // Get blocked users
  async getBlockedUsers(blockerId: string) {
    const blocks = await prisma.block.findMany({
      where: { blockerId },
      include: { blocked: true },
    });

    return blocks.map((b) => b.blocked);
  },

  // Get notifications for a user
  async getMyNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      include: {
        user: true,
        actor: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // Mark notification as read
  async markNotificationAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw Errors.notFound("Notification");
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return true;
  },

  // Mark all notifications as read
  async markAllNotificationsAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return true;
  }
};
