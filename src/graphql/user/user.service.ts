import { randomBytes, createHmac } from "crypto";
import { prisma } from "../../lib/prisma.js";

export interface CreateUserData {
  firstName: string;
  lastName?: string;
  profileImageUrl?: string;
  email: string;
  password: string;
}

function generateSalt(): string {
  return randomBytes(16).toString("hex");
}

function hashPassword(password: string, salt: string): string {
  return createHmac("sha256", salt).update(password).digest("hex");
}

export const userService = {
  async createUser(data: CreateUserData) {
    const salt = generateSalt();
    const hashedPassword = hashPassword(data.password, salt);

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

  async getAllUsers() {
    return prisma.user.findMany();
  },

  async getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
};
