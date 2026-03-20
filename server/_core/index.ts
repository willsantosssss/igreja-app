import "dotenv/config";
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
  const app = express();
  const server = createServer(app);

  // CORS whitelist - only allow requests from authorized origins
  // Update this list with your production domains
  const ALLOWED_ORIGINS = [
    "https://igrejaapp-clukbfbs.manus.space",
  ];
  
  // Allow localhost only in development
  if (process.env.NODE_ENV === "development") {
    ALLOWED_ORIGINS.push(
      "http://localhost:3000",
      "http://localhost:8081",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:8081"
    );
  }

  // CORS middleware - check origin against whitelist
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
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
