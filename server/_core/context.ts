import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    console.log('[Context] Session data:', {
      phone: opts.req.session?.phone,
      userId: opts.req.session?.userId,
      sessionID: opts.req.sessionID
    });
    
    // Try phone-based session first
    const phoneSession = opts.req.session?.phone;
    if (phoneSession) {
      const users = await import("../db");
      const dbUser = await users.getUserByPhone(phoneSession);
      if (dbUser) {
        user = dbUser;
        console.log('[Context] User loaded from phone session:', { id: user.id, role: user.role });
      }
    }
    
    // Also try userId-based session
    if (!user && opts.req.session?.userId) {
      const users = await import("../db");
      const dbUser = await users.getUser(opts.req.session.userId);
      if (dbUser) {
        user = dbUser;
        console.log('[Context] User loaded from userId session:', { id: user.id, role: user.role });
      }
    }
    
    if (!user) {
      console.log('[Context] No user found in session');
    }
  } catch (error) {
    console.error('[Context] Error loading user:', error);
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
