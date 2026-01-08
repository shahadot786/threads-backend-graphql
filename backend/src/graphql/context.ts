import { userService } from "./user/user.service.js";
import { Errors } from "./errors.js";
import type { User } from "../../generated/prisma/client.js";
import type { Request, Response } from "express";
import { supabase } from "../lib/supabase.js";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface GraphQLContext {
  user: User | null;         // Database Profile
  supabaseUser: SupabaseUser | null; // Supabase Auth User
  req: Request;
  res: Response;
}

export async function createContext(
  req: Request,
  res: Response
): Promise<GraphQLContext> {
  const authHeader = req.headers.authorization;
  let user: User | null = null;
  let supabaseUser: SupabaseUser | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    // Verify token with Supabase
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error("[AUTH] Supabase verification error:", error.message);
    }

    if (authUser && !error) {
      supabaseUser = authUser;
      // Try to find corresponding profile in our DB
      user = await userService.getUserById(authUser.id);
    } else if (!authUser) {
      console.warn("[AUTH] No user found for provided token");
    }
  } else if (authHeader) {
    console.warn("[AUTH] Invalid Authorization header format");
  }

  return { user, supabaseUser, req, res };
}

// Helper to check if user is authenticated (has profile)
export function requireAuth(context: GraphQLContext): User {
  if (!context.user) {
    throw Errors.unauthenticated();
  }
  return context.user;
}

// Helper to check if user has valid Supabase session (even if no profile)
export function requireSupabaseAuth(context: GraphQLContext): SupabaseUser {
  if (!context.supabaseUser) {
    throw Errors.unauthenticated("Invalid or missing session");
  }
  return context.supabaseUser;
}
