import JWT from "jsonwebtoken";
import { userService } from "./user/user.service.js";
import { Errors } from "./errors.js";
import type { User } from "../../generated/prisma/client.js";
import type { Request, Response } from "express";

export interface GraphQLContext {
  user: User | null;
  req: Request;
  res: Response;
}

export interface JWTPayload {
  id: string;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET;

// Cookie options for security
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const ACCESS_TOKEN_COOKIE = "__threads_graphql_demo_access_token";
export const REFRESH_TOKEN_COOKIE = "__threads_graphql_demo_refresh_token";

export async function createContext(
  req: Request,
  res: Response
): Promise<GraphQLContext> {
  // Get access token from cookie
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];

  // If no token or JWT_SECRET, return unauthenticated context
  if (!token || !JWT_SECRET) {
    if (!token && req.cookies?.[REFRESH_TOKEN_COOKIE]) {
      console.warn(`[AUTH] Access token missing but Refresh Token IS present.`);
    }
    return { user: null, req, res };
  }

  try {
    // Verify and decode the JWT
    const decoded = JWT.verify(token, JWT_SECRET) as JWTPayload;

    // Fetch user from database
    const user = await userService.getUserById(decoded.id);

    return { user, req, res };
  } catch (err: any) {
    // Token invalid or expired
    return { user: null, req, res };
  }
}

// Helper to check if user is authenticated
export function requireAuth(context: GraphQLContext): User {
  if (!context.user) {
    throw Errors.unauthenticated();
  }
  return context.user;
}

// Helper to set auth cookies
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  // Access token - shorter expiry
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh token - longer expiry
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 120 * 24 * 60 * 60 * 1000, // 120 days
  });
}

// Helper to clear auth cookies
export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, COOKIE_OPTIONS);
  res.clearCookie(REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS);
}
