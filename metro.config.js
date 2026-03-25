const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const http = require("http");

const config = getDefaultConfig(__dirname);

// Add middleware to proxy API requests to the local server
config.server = config.server || {};
config.server.middleware = config.server.middleware || [];

// Insert proxy middleware at the beginning
const originalMiddleware = config.server.middleware;
config.server.middleware = [
  (req, res, next) => {
    // Proxy /api/* requests to localhost:3000
    if (req.url.startsWith("/api/")) {
      const proxyUrl = `http://localhost:3000${req.url}`;
      console.log(`[Metro Proxy] ${req.method} ${req.url} -> ${proxyUrl}`);

      const proxyReq = http.request(proxyUrl, {
        method: req.method,
        headers: {
          ...req.headers,
          host: "localhost:3000",
        },
      }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on("error", (err) => {
        console.error(`[Metro Proxy] Error: ${err.message}`);
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Bad Gateway", message: err.message }));
      });

      req.pipe(proxyReq);
    } else {
      next();
    }
  },
  ...originalMiddleware,
];

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});
