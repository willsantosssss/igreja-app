import dotenv from "dotenv";
import path from "path";
// Load .env.local first (for secrets set via webdev_request_secrets), then .env as fallback
// Use absolute path from current working directory
const projectRoot = process.cwd();
dotenv.config({ path: path.join(projectRoot, ".env.local") });
dotenv.config({ path: path.join(projectRoot, ".env") });
console.log("[Server] Loading env from:", projectRoot);
console.log("[Server] CUSTOM_JWT_SECRET length:", process.env.CUSTOM_JWT_SECRET?.length ?? 0);
console.log("[Server] JWT_SECRET length:", process.env.JWT_SECRET?.length ?? 0);
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
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
  // Debug: Log environment variables
  console.log('[Server] Environment variables:');
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL.replace('mysql://', 'http://').replace('mysql2://', 'http://'));
    console.log('[Server] DATABASE_URL:', `${url.protocol}//${url.hostname}:${url.port}/${url.pathname}`);
  } else {
    console.log('[Server] DATABASE_URL: NOT SET');
  }
  console.log('[Server] NODE_ENV:', process.env.NODE_ENV);
  console.log('[Server] PORT:', process.env.PORT);
  
  const app = express();
  const server = createServer(app);

  // CORS middleware - allow all Manus domains and localhost
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Allow all Manus domains (*.manus.computer, *.manus.space)
    // and localhost for development
    const isManusDomain = origin && (
      origin.includes(".manus.computer") ||
      origin.includes(".manus.space") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")
    );
    
    if (isManusDomain || !origin) {
      if (origin) {
        res.header("Access-Control-Allow-Origin", origin);
      } else {
        res.header("Access-Control-Allow-Origin", "*");
      }
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
      );
      res.header("Access-Control-Allow-Credentials", "true");
    }

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Parse JSON and URL-encoded request bodies
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Register OAuth routes
  registerOAuthRoutes(app);

  // Serve static files from uploads folder
  const uploadsDir = path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsDir));

  // Health check endpoint for monitoring
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  // Register tRPC API endpoint
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  // Find available port for server
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort && process.env.NODE_ENV !== 'production') {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[api] server listening on port ${port}`);
    }
  });
}

startServer().catch((err) => {
  console.error('[Server Error]', err);
  process.exit(1);
});
