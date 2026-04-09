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
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";

const execAsync = promisify(exec);

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
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsDir));

  // Setup multer for file uploads
  const upload = multer({ dest: uploadsDir });

  // File upload endpoint
  app.post("/api/upload", (req, res, next) => {
    upload.single("file")(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message || "Upload failed" });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const filePath = req.file.path;
      const fileName = req.file.originalname;

      console.log(`[Upload] Processing file: ${fileName}`);

      // Salvar arquivo localmente em vez de usar CDN
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Gerar nome único para o arquivo
      const fileExt = path.extname(fileName);
      const fileNameWithoutExt = path.basename(fileName, fileExt);
      const uniqueFileName = `${fileNameWithoutExt}-${Date.now()}${fileExt}`;
      const finalPath = path.join(uploadsDir, uniqueFileName);

      // Mover arquivo para pasta de uploads
      fs.renameSync(filePath, finalPath);

      // Retornar URL local que será servida por /api/files/:filename
      const url = `/api/files/${uniqueFileName}`;

      console.log(`[Upload] File saved locally: ${finalPath}`);

      res.json({ url, fileName, localPath: finalPath });
    } catch (error: any) {
      console.error("[Upload Error]", error.message);
      // Clean up file on error
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      res.status(500).json({ error: error.message || "Upload failed" });
    }
  });

  // Serve uploaded files locally
  app.get("/api/files/:filename", (req, res) => {
    try {
      const filename = req.params.filename;
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadsDir, filename);

      // Validar que o arquivo está dentro da pasta uploads (evitar path traversal)
      if (!filePath.startsWith(uploadsDir)) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Verificar se arquivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      // Servir arquivo com headers apropriados
      const fileExt = path.extname(filename).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.txt': 'text/plain',
      };

      const mimeType = mimeTypes[fileExt] || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error: any) {
      console.error("[File Download Error]", error.message);
      res.status(500).json({ error: error.message || "Download failed" });
    }
  });

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
