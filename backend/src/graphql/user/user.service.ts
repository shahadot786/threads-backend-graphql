import { randomBytes, createHmac } from "crypto";
import { prisma } from "../../lib/prisma.js";
import JWT from "jsonwebtoken";
import { Errors } from "../errors.js";
import type { User } from "../../../generated/prisma/client.js";

export interface CreateUserData {
  firstName: string;
  lastName?: string;
  username?: string;
  profileImageUrl?: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  user: User;
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

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRES_DAYS = 30;

// Generate password hash with salt
function generateHash(password: string, salt: string): string {
  return createHmac("sha256", salt).update(password).digest("hex");
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
  // Create new user
  async createUser(data: CreateUserData) {
    const salt = randomBytes(32).toString("hex");
    const hashedPassword = generateHash(data.password, salt);

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
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        username,
        profileImageUrl: data.profileImageUrl ?? null,
        email: data.email,
        password: hashedPassword,
        salt,
      },
    });
  },

  // Get all users
  async getAllUsers() {
    return prisma.user.findMany();
  },

  // Get suggested users (ordered by follower count)
  async getSuggestedUsers(first: number = 10) {
    // Since we don't have a direct follower count column on user table yet (it's in stats via subquery usually),
    // we can either return random users or join with follows.
    // For performance in this MVP, let's just return users with most followers.
    // However, Prisma sort by relation count is tricky in older versions or requires specific syntax.
    // A simple approximation is getting users who have posts or just verified users.
    // Let's try sorting by follower count if possible, or just return keys.

    // A better approach for "Suggested" in MVP without complex analytics:
    // Return users who strictly have > 0 followers, ordered by creation (newest) or random.
    // OR: Use prisma's relation count sorting if enabled or supported.

    // Using explicit SQL grouping for best performance, but let's stick to Prisma API for now.
    // We'll simplisticly fetch users. For a production app, this would be a computed table.

    // Let's fetch users along with their follower count and sort in memory for MVP (assuming low user count), 
    // OR just limit to 50 and sort.
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

    // console.log(`[SuggestedUsers] Found ${users.length} users, returning top ${first}`);
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
  },

  // Generate access token
  generateAccessToken(userId: string, email: string): string {
    if (!JWT_SECRET) {
      throw Errors.internalError("JWT_SECRET is not configured");
    }
    return JWT.sign({ id: userId, email }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES,
    } as JWT.SignOptions);
  },

  // Generate refresh token and save to DB
  async generateRefreshToken(userId: string, email: string): Promise<string> {
    if (!REFRESH_SECRET) {
      throw Errors.internalError("REFRESH_SECRET is not configured");
    }
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    const token = JWT.sign({ id: userId, email }, REFRESH_SECRET, {
      expiresIn: `${REFRESH_TOKEN_EXPIRES_DAYS}d`,
    } as JWT.SignOptions);

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  },

  // Login and generate tokens
  async login(
    payload: LoginPayload
  ): Promise<
    TokenPair & { user: { id: string; email: string; firstName: string } }
  > {
    const { email, password } = payload;
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw Errors.unauthenticated("Invalid email or password");
    }

    const hashedPassword = generateHash(password, user.salt);

    if (hashedPassword !== user.password) {
      throw Errors.unauthenticated("Invalid email or password");
    }

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id, user.email);

    return {
      accessToken,
      refreshToken,
      user,
    };
  },

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    // Find refresh token in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw Errors.invalidToken("Invalid refresh token");
    }

    // Check if expired
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw Errors.tokenExpired("Refresh token expired");
    }

    // Delete old refresh token (rotation)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    const accessToken = this.generateAccessToken(
      storedToken.user.id,
      storedToken.user.email
    );
    const newRefreshToken = await this.generateRefreshToken(
      storedToken.user.id,
      storedToken.user.email
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: storedToken.user,
    };
  },

  // Logout - delete refresh token
  async logout(refreshToken: string): Promise<boolean> {
    try {
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
      return true;
    } catch {
      return false;
    }
  },

  // Delete all refresh tokens for user (logout all devices)
  async logoutAll(userId: string): Promise<boolean> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return true;
  },

  // Forgot Password - Generate reset token
  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) return true; // Return true to prevent email enumeration

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });
    if (!REFRESH_SECRET) {
      throw Errors.internalError("REFRESH_SECRET is not configured");
    }
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    const token = JWT.sign({ id: user.id, email }, REFRESH_SECRET, {
      expiresIn: `${REFRESH_TOKEN_EXPIRES_DAYS}d`,
    } as JWT.SignOptions);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // In a real app, you would send this token via email.
    // console.log(`[PASS_RESET] Token for ${email}: ${token}`);

    return true;
  },

  // Reset Password - Verify token and update password
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const storedToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken) {
      throw Errors.invalidToken("Invalid or expired reset token");
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: storedToken.id } });
      throw Errors.tokenExpired("Reset token expired");
    }

    const salt = randomBytes(32).toString("hex");
    const hashedPassword = generateHash(newPassword, salt);

    await prisma.user.update({
      where: { id: storedToken.userId },
      data: {
        password: hashedPassword,
        salt,
      },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({ where: { id: storedToken.id } });

    // Also invalidate all refresh tokens (logout from all devices after password change)
    await this.logoutAll(storedToken.userId);

    return true;
  },
};
