import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { execSync } from "child_process";
import { initDocumentosLideresTable } from "../migrations/init-documentos-lideres";
import * as db from "../db";
import { runMigrations } from "../migrations";

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

async function runMigrations() {
  try {
    console.log("[Database] Running migrations...");
    await initDocumentosLideresTable();
    console.log("[Database] Migrations completed successfully");
  } catch (error) {
    console.warn("[Database] Migration failed (continuing anyway):", error);
  }
}

async function startServer() {
  // Run migrations before starting the server
  await runMigrations();

  const app = express();
  const server = createServer(app);

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerAuthRoutes(app);

  // Servir arquivos estáticos da pasta uploads
  const uploadsDir = path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsDir));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  // Endpoints REST para documentos-lideres
  
  // GET /api/documentos-lideres - Listar todos os documentos
  app.get("/api/documentos-lideres", async (req, res) => {
    try {
      const documentos = await db.getDocumentosLideres();
      res.json(documentos || []);
    } catch (error: any) {
      console.error("Erro ao listar documentos:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/documentos-lideres/:id - Obter documento por ID
  app.get("/api/documentos-lideres/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const documento = await db.getDocumentoLiderById(parseInt(id));
      if (!documento) {
        return res.status(404).json({ error: "Documento não encontrado" });
      }
      res.json(documento);
    } catch (error: any) {
      console.error("Erro ao obter documento:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/upload/documentos-lideres - Criar novo documento
  app.post("/api/upload/documentos-lideres", async (req, res) => {
    try {
      const { titulo, descricao, nomeArquivo, arquivoBase64, tipo, ativo } = req.body;
      
      if (!titulo || !nomeArquivo || !arquivoBase64 || !tipo) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const buffer = Buffer.from(arquivoBase64, "base64");
      const tamanhoArquivo = buffer.length;
      const arquivoUrl = `data:application/octet-stream;base64,${arquivoBase64}`;

      const resultado = await db.createDocumentoLider({
        titulo,
        descricao,
        arquivoUrl,
        nomeArquivo,
        tamanhoArquivo,
        tipo,
        ativo: ativo ?? 1,
        arquivoBase64,
      });

      res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/documentos-lideres/:id - Atualizar documento
  app.put("/api/documentos-lideres/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { titulo, descricao, tipo, ativo } = req.body;
      
      const resultado = await db.updateDocumentoLider(parseInt(id), {
        titulo,
        descricao,
        tipo,
        ativo,
      });
      
      res.json(resultado);
    } catch (error: any) {
      console.error("Erro ao atualizar documento:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/documentos-lideres/:id - Deletar documento
  app.delete("/api/documentos-lideres/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.deleteDocumentoLider(parseInt(id));
      res.json({ success: true });
    } catch (error: any) {
      console.error("Erro ao deletar documento:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}

startServer().catch(console.error);
