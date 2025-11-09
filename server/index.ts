import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeAdminUser } from "./admin-init";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/uploads', express.static('public/uploads'));

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
  try {
    // Validate critical environment variables for production
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      const requiredSecrets = ['DATABASE_URL', 'CLERK_SECRET_KEY', 'PAYSTACK_SECRET_KEY'];
      const missing = requiredSecrets.filter(key => !process.env[key]);
      
      if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(', ')}`);
        console.error('Please configure these in your deployment secrets.');
      }
      
      // Warn about optional but recommended secrets
      if (!process.env.RESEND_API_KEY) {
        console.warn('Warning: RESEND_API_KEY not set. Email functionality will be limited.');
      }
      if (!process.env.GROQ_API_KEY) {
        console.warn('Warning: GROQ_API_KEY not set. AI features will be disabled.');
      }
    }

    const server = await registerRoutes(app);

    // Initialize admin user from environment variables
    await initializeAdminUser(storage);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      // Log error in production for debugging
      console.error(`Error ${status}: ${message}`);
      if (err.stack) {
        console.error(err.stack);
      }

      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
      if (isProduction) {
        log('Running in PRODUCTION mode');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
