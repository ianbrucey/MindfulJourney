import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  let server = null;
  try {
    server = registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error: ${message}`);
      res.status(status).json({ message });
    });

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Try to start the server with retries
    const PORT = process.env.PORT || 5000;
    const maxRetries = 3;
    let currentPort = PORT;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await new Promise((resolve, reject) => {
          server!.listen(currentPort, "0.0.0.0", () => {
            log(`serving on port ${currentPort}`);
            resolve(null);
          }).on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
              currentPort++;
              log(`Port ${currentPort - 1} in use, trying ${currentPort}`);
            } else {
              reject(err);
            }
          });
        });
        break; // If we get here, the server started successfully
      } catch (err: any) {
        if (attempt === maxRetries - 1) {
          throw err; // Last attempt failed
        }
        log(`Failed to start server on port ${currentPort}, retrying...`);
        currentPort++;
      }
    }
  } catch (error) {
    log(`Fatal error starting server: ${error}`);
    if (server) {
      server.close();
    }
    process.exit(1);
  }
})();