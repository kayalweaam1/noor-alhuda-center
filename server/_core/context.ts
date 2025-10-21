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
    // Try phone-based session first
    const phoneSession = opts.req.session?.phone;
    if (phoneSession) {
      const users = await import("../db");
      const dbUser = await users.getUserByPhone(phoneSession);
      if (dbUser) {
        user = dbUser;
      }
    }

    // Also try userId-based session
    if (!user && opts.req.session?.userId) {
      const users = await import("../db");
      const dbUser = await users.getUser(opts.req.session.userId);
      if (dbUser) {
        user = dbUser;
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
