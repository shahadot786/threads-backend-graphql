import JWT from "jsonwebtoken";
import { userService } from "./user/user.service.js";
import type { User } from "../../generated/prisma/client.js";

export interface GraphQLContext {
  user: User | null;
}

export interface JWTPayload {
  id: string;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET;

export async function createContext(
  token: string | undefined
): Promise<GraphQLContext> {
  // If no token, return null user (unauthenticated)
  if (!token || !JWT_SECRET) {
    return { user: null };
  }

  try {
    // Verify and decode the JWT
    const decoded = JWT.verify(token, JWT_SECRET) as JWTPayload;

    // Fetch user from database
    const user = await userService.getUserById(decoded.id);

    return { user };
  } catch {
    // Token invalid or expired
    return { user: null };
  }
}

// Helper to check if user is authenticated
export function requireAuth(context: GraphQLContext): User {
  if (!context.user) {
    throw new Error("You must be logged in to perform this action");
  }
  return context.user;
}
