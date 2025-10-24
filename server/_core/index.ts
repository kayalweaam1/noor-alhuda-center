import "dotenv/config";
import express from "express";
import session from "express-session";
import mysqlSessionFactory from "express-mysql-session";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createTestUsers } from "../create-test-users-endpoint";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ENV } from "./env";

async function startServer() {
  // Create default admin if DB is available (don't crash if DB is down)
  try {
    const { createDefaultAdmin } = await import("../db");
    await createDefaultAdmin();
  } catch (error) {
    console.warn(
      "[Startup] Skipping default admin creation (DB may be unavailable)",
      error
    );
  }
  
  const app = express();
  const server = createServer(app);
  
  // Trust proxy for Railway/Heroku/etc
  app.set('trust proxy', 1);
  
  // Session middleware
  const MySQLStore = mysqlSessionFactory(session as unknown as any);
  const parseMysqlUrl = (url?: string) => {
    if (!url) return undefined as
      | { host: string; port?: number; user?: string; password?: string; database?: string }
      | undefined;
    try {
      const u = new URL(url);
      const dbName = u.pathname?.replace(/^\//, "");
      return {
        host: u.hostname,
        port: u.port ? Number(u.port) : undefined,
        user: u.username ? decodeURIComponent(u.username) : undefined,
        password: u.password ? decodeURIComponent(u.password) : undefined,
        database: dbName || undefined,
      };
    } catch {
      return undefined;
    }
  };
  const storeOptions = parseMysqlUrl(ENV.databaseUrl);
  let sessionStore: any | undefined = undefined;
  if (storeOptions) {
    try {
      sessionStore = new MySQLStore({ createDatabaseTable: true, ...storeOptions });
    } catch (error) {
      console.warn(
        "[Startup] Failed to initialize MySQL session store, falling back to MemoryStore",
        error
      );
      sessionStore = undefined;
    }
  }
  app.use(
    session({
      secret: ENV.cookieSecret,
      // Use MySQL-backed session store when available, otherwise MemoryStore
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      },
    })
  );
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Create test users endpoint (for development)
  app.get("/create-test-users-now", async (req, res) => {
    try {
      const result = await createTestUsers();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT environment variable or default to 8080
  // Do NOT search for available ports - use the specified port directly
  const port = parseInt(process.env.PORT || "8080", 10);
  
  server.listen(port, "0.0.0.0", () => {
    console.log(`[Server] Running on port ${port}`);
  });
}

startServer().catch(console.error);

