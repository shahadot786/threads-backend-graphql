import { randomBytes, createHmac } from "crypto";
import { prisma } from "../../lib/prisma.js";
import JWT from "jsonwebtoken";

export interface CreateUserData {
  firstName: string;
  lastName?: string;
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
}

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

// Generate password hash with salt
function generateHash(password: string, salt: string): string {
  return createHmac("sha256", salt).update(password).digest("hex");
}

// Generate random token
function generateRandomToken(): string {
  return randomBytes(40).toString("hex");
}

export const userService = {
  // Create new user
  async createUser(data: CreateUserData) {
    const salt = randomBytes(32).toString("hex");
    const hashedPassword = generateHash(data.password, salt);

    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName ?? null,
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

  // Get user by ID
  async getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  // Get user by email
  async getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  // Generate access token
  generateAccessToken(userId: string, email: string): string {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }
    return JWT.sign(
      { id: userId, email },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES } as JWT.SignOptions
    );
  },

  // Generate refresh token and save to DB
  async generateRefreshToken(userId: string): Promise<string> {
    const token = generateRandomToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

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
  async login(payload: LoginPayload): Promise<TokenPair & { user: { id: string; email: string; firstName: string } }> {
    const { email, password } = payload;
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const hashedPassword = generateHash(password, user.salt);

    if (hashedPassword !== user.password) {
      throw new Error("Invalid email or password");
    }

    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
      },
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
      throw new Error("Invalid refresh token");
    }

    // Check if expired
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new Error("Refresh token expired");
    }

    // Delete old refresh token (rotation)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    const accessToken = this.generateAccessToken(storedToken.user.id, storedToken.user.email);
    const newRefreshToken = await this.generateRefreshToken(storedToken.user.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
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
};
