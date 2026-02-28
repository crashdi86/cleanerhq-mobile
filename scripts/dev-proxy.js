/**
 * Dev-only CORS proxy for web preview.
 *
 * Proxies /api/v1/mobile/* requests from the Expo web app (port 8081)
 * to the backend (port 3000), adding CORS headers.
 *
 * Usage: node scripts/dev-proxy.js
 * Then set API_BASE_URL to http://localhost:3001/api/v1/mobile
 */
const http = require("http");
const httpProxy = require("http-proxy");

const PROXY_PORT = parseInt(process.env.PORT, 10) || 3001;
const TARGET = "http://localhost:3000";

const proxy = httpProxy.createProxyServer({ target: TARGET, changeOrigin: true });

proxy.on("error", (err, _req, res) => {
  console.error("Proxy error:", err.message);
  if (res.writeHead) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: { code: "PROXY_ERROR", message: err.message } }));
  }
});

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  proxy.web(req, res);
});

server.listen(PROXY_PORT, () => {
  console.log(`CORS proxy running on http://localhost:${PROXY_PORT} → ${TARGET}`);
});
