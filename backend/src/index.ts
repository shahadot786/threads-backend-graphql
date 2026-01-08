import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { expressMiddleware } from "@as-integrations/express5";
import { createGraphqlServer } from "./graphql/server.js";
import { createContext } from "./graphql/context.js";
import { initializeSocket } from "./lib/socket.js";
import { uploadToSupabase } from "./lib/supabase.js";

import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Helper for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8000;

  // Create HTTP server for Socket.IO integration
  const httpServer = createServer(app);

  // Initialize Socket.IO
  initializeSocket(httpServer);

  // Check if Supabase is configured
  const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

  // Configure Multer - use memory storage for Supabase, disk for local
  let upload: multer.Multer;
  let uploadDir: string | undefined;

  if (useSupabase) {
    // Memory storage for Supabase uploads
    upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
          cb(null, true);
        } else {
          cb(new Error("Only images and videos are allowed"));
        }
      },
    });
    console.log("📦 Using Supabase Storage for file uploads");
  } else {
    // Disk storage for local development
    uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const diskStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir!);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      },
    });

    upload = multer({
      storage: diskStorage,
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
          cb(null, true);
        } else {
          cb(new Error("Only images and videos are allowed"));
        }
      },
    });

    // Serve static files from uploads directory (only for local)
    app.use("/uploads", express.static(uploadDir));
    console.log("💾 Using local disk storage for file uploads");
  }

  // Cookie parser
  app.use(cookieParser());
  // JSON body parser
  app.use(express.json());
  // CORS configuration
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    })
  );

  // File Upload Endpoint
  app.post("/api/upload", upload.array("files", 10), async (req, res) => {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const files = req.files as Express.Multer.File[];
      const fileUrls: string[] = [];

      // Validate individual file sizes
      for (const file of files) {
        if (file.mimetype.startsWith("image/") && !file.mimetype.includes("gif") && file.size > 2 * 1024 * 1024) {
          return res.status(400).json({ error: `Image ${file.originalname} exceeds 2MB limit` });
        }
        if (file.mimetype.startsWith("video/") && file.size > 10 * 1024 * 1024) {
          return res.status(400).json({ error: `Video ${file.originalname} exceeds 10MB limit` });
        }
      }

      if (useSupabase) {
        // Upload to Supabase Storage
        for (const file of files) {
          const result = await uploadToSupabase(file);
          fileUrls.push(result.url);
        }
      } else {
        // Use local URLs
        for (const file of files) {
          const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
          fileUrls.push(fileUrl);
        }
      }

      // Return response
      if (files.length === 1 && files[0]) {
        return res.json({ url: fileUrls[0], urls: fileUrls, type: files[0].mimetype });
      }

      res.json({ urls: fileUrls });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload file" });
    }
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ message: "Server is running!" });
  });

  app.use(
    "/graphql",
    expressMiddleware(await createGraphqlServer(), {
      context: async ({ req, res }) => {
        return createContext(req, res);
      },
    })
  );

  // Use httpServer.listen instead of app.listen for Socket.IO
  httpServer.listen(PORT, () => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Socket.IO enabled`);
    }
  });
}

startServer();
