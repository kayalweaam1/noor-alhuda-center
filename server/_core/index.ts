import "dotenv/config";
import express from "express";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
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
  
  // Parse DATABASE_URL -> MySQL connection options
  function parseMySqlOptionsFromUrl(url?: string) {
    if (!url) return null;
    try {
      const u = new URL(url);
      return {
        host: u.hostname,
        port: parseInt(u.port || "3306"),
        user: decodeURIComponent(u.username),
        password: decodeURIComponent(u.password),
        database: u.pathname.replace(/^\//, ""),
        createDatabaseTable: true,
      } as any;
    } catch (_err) {
      console.warn("[Session] Failed to parse DATABASE_URL for session store");
      return null;
    }
  }

  // Session middleware (use MySQL store in production)
  const MySQLStore = MySQLStoreFactory(session);
  const mysqlOptions = parseMySqlOptionsFromUrl(ENV.databaseUrl);
  const sessionStore = ENV.isProduction && mysqlOptions
    ? new MySQLStore(mysqlOptions)
    : undefined;

  if (ENV.isProduction && !sessionStore) {
    console.warn("Warning: connect.session() MemoryStore is not designed for production; using in-memory store as fallback.");
  }

  app.use(
    session({
      secret: ENV.cookieSecret,
      store: sessionStore as any,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: ENV.isProduction,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: ENV.isProduction ? 'none' : 'lax',
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
  const port = ENV.isProduction
    ? preferredPort
    : await findAvailablePort(preferredPort);

  if (!ENV.isProduction && port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  const host = ENV.isProduction ? "0.0.0.0" : "localhost";
  server.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}/`);
  });
}

startServer().catch(console.error);
