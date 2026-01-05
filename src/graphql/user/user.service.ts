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

export interface GetUserTokenPayload {
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;


//generate password hash
function generateHash(password: string, salt: string): string {
  return createHmac("sha256", salt).update(password).digest("hex");
}

export const userService = {
  //create new user
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

  //get all users
  async getAllUsers() {
    return prisma.user.findMany();
  },

  //get user by ID
  async getUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  //get user by email
  async getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  //get user token (login)
  async getUserToken(payload: GetUserTokenPayload) {
    const { email, password } = payload;
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = generateHash(password, user.salt);

    if (hashedPassword !== user.password) {
      throw new Error("Incorrect password");
    }

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    //generate JWT Token
    const token = JWT.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN ?? "15m" } as JWT.SignOptions
    );

    return token;
  },
};
