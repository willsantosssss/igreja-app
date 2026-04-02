/**
 * Centralized logging system for the server
 * All logs are timestamped and categorized for easier debugging
 */

export interface LogEntry {
  timestamp: string;
  level: "INFO" | "ERROR" | "WARN" | "DEBUG";
  category: string;
  message: string;
  data?: any;
  error?: string;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  log(level: "INFO" | "ERROR" | "WARN" | "DEBUG", category: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(entry);

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console
    const prefix = `[${level}] [${category}]`;
    switch (level) {
      case "ERROR":
        console.error(prefix, message, data);
        break;
      case "WARN":
        console.warn(prefix, message, data);
        break;
      case "DEBUG":
        console.debug(prefix, message, data);
        break;
      case "INFO":
      default:
        console.log(prefix, message, data);
    }
  }

  info(category: string, message: string, data?: any) {
    this.log("INFO", category, message, data);
  }

  error(category: string, message: string, error?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "ERROR",
      category,
      message,
      error: error?.message || String(error),
      stack: error?.stack,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    console.error(`[ERROR] [${category}]`, message, error);
  }

  warn(category: string, message: string, data?: any) {
    this.log("WARN", category, message, data);
  }

  debug(category: string, message: string, data?: any) {
    this.log("DEBUG", category, message, data);
  }

  getLogs(filter?: { category?: string; level?: string; limit?: number }): LogEntry[] {
    let filtered = [...this.logs];

    if (filter?.category) {
      filtered = filtered.filter((log) => log.category.includes(filter.category!));
    }

    if (filter?.level) {
      filtered = filtered.filter((log) => log.level === filter.level);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  clearLogs() {
    this.logs = [];
  }

  getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {
        INFO: this.logs.filter((l) => l.level === "INFO").length,
        ERROR: this.logs.filter((l) => l.level === "ERROR").length,
        WARN: this.logs.filter((l) => l.level === "WARN").length,
        DEBUG: this.logs.filter((l) => l.level === "DEBUG").length,
      },
      byCategory: {} as Record<string, number>,
    };

    this.logs.forEach((log) => {
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });

    return stats;
  }
}

export const logger = new Logger();
