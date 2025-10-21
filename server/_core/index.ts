import "dotenv/config";
import express from "express";
import session from "express-session";
import mysqlSessionFactory from "express-mysql-session";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ENV } from "./env";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Create default admin if not exists
  const { createDefaultAdmin } = await import('../db');
  await createDefaultAdmin();
  
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

  // Force a real store in production – never fall back to MemoryStore
  let sessionStore: InstanceType<ReturnType<typeof MySQLStore>> | undefined;
  if (storeOptions) {
    sessionStore = new (MySQLStore as unknown as any)({
      createDatabaseTable: true,
      ...storeOptions,
    });
  } else if (ENV.isProduction) {
    console.error(
      "[Session] DATABASE_URL is missing/invalid. Refusing to run with MemoryStore in production."
    );
    process.exit(1);
  }
  app.use(
    session({
      secret: ENV.cookieSecret,
      // Use MySQL-backed session store to avoid MemoryStore in production
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
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
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  // In production, bind exactly to the platform-provided PORT. In dev, try to find a free one.
  const port = ENV.isProduction ? preferredPort : await findAvailablePort(preferredPort);

  if (!ENV.isProduction && port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer().catch(console.error);
