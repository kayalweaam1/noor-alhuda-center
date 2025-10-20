import "express-session";

declare module "express-session" {
  interface SessionData {
    phone?: string;
    userId?: string;
  }
}
