/**
 * Debug router for testing and diagnostics
 * Provides endpoints to check system health, view logs, and test API connectivity
 */

import { z } from "zod";
import { publicProcedure, router } from "./trpc";
import { logger } from "./logger";

export const debugRouter = router({
  // Get system health status
  health: publicProcedure.query(async () => {
    logger.info("debug", "Health check requested");

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL ? "***CONFIGURED***" : "NOT SET",
        JWT_SECRET: process.env.JWT_SECRET ? "***CONFIGURED***" : "NOT SET",
        CUSTOM_JWT_SECRET: process.env.CUSTOM_JWT_SECRET ? "***CONFIGURED***" : "NOT SET",
      },
    };
  }),

  // Get recent logs
  logs: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        level: z.enum(["INFO", "ERROR", "WARN", "DEBUG"]).optional(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(({ input }) => {
      logger.info("debug", "Logs requested", { category: input.category, level: input.level, limit: input.limit });

      const logs = logger.getLogs({
        category: input.category,
        level: input.level,
        limit: input.limit,
      });

      return {
        count: logs.length,
        logs,
        stats: logger.getStats(),
      };
    }),

  // Clear logs
  clearLogs: publicProcedure.mutation(() => {
    logger.info("debug", "Logs cleared by user");
    logger.clearLogs();
    return { success: true, message: "Logs cleared" };
  }),

  // Test database connection
  testDatabase: publicProcedure.query(async () => {
    logger.info("debug", "Testing database connection");

    try {
      const mysql = require("mysql2/promise");
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "igreja",
      });

      const [rows] = await connection.execute("SELECT 1 as test");
      await connection.end();

      logger.info("debug", "Database connection successful");
      return {
        status: "connected",
        message: "Database connection successful",
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error("debug", "Database connection failed", error);
      return {
        status: "error",
        message: error.message,
        error: error.code,
        timestamp: new Date().toISOString(),
      };
    }
  }),

  // Test authentication
  testAuth: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      logger.info("debug", "Testing authentication", { email: input.email });

      try {
        const { loginUser } = require("../auth-simple");
        const result = await loginUser(input.email, input.password);

        logger.info("debug", "Authentication test successful", { userId: result.userId });

        return {
          status: "success",
          message: "Authentication successful",
          userId: result.userId,
          email: result.email,
          name: result.name,
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        logger.error("debug", "Authentication test failed", error);
        return {
          status: "error",
          message: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    }),

  // Test API endpoint
  testEndpoint: publicProcedure
    .input(
      z.object({
        endpoint: z.string(),
        method: z.enum(["GET", "POST"]).default("GET"),
      }),
    )
    .mutation(async ({ input }) => {
      logger.info("debug", "Testing endpoint", { endpoint: input.endpoint, method: input.method });

      try {
        const response = await fetch(input.endpoint, {
          method: input.method,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.text();

        logger.info("debug", "Endpoint test successful", {
          endpoint: input.endpoint,
          status: response.status,
        });

        return {
          status: "success",
          endpoint: input.endpoint,
          httpStatus: response.status,
          responseLength: data.length,
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        logger.error("debug", "Endpoint test failed", error);
        return {
          status: "error",
          endpoint: input.endpoint,
          message: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    }),

  // Get system info
  systemInfo: publicProcedure.query(() => {
    logger.info("debug", "System info requested");

    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: {
        total: require("os").totalmem(),
        free: require("os").freemem(),
        used: require("os").totalmem() - require("os").freemem(),
      },
      cpus: require("os").cpus().length,
      timestamp: new Date().toISOString(),
    };
  }),

  // Get log statistics
  logStats: publicProcedure.query(() => {
    logger.info("debug", "Log stats requested");

    const stats = logger.getStats();

    return {
      stats,
      timestamp: new Date().toISOString(),
    };
  }),
});

export type DebugRouter = typeof debugRouter;
