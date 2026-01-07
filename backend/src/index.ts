import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { expressMiddleware } from "@as-integrations/express5";
import { createGraphqlServer } from "./graphql/server.js";
import { createContext } from "./graphql/context.js";

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

  // Ensure uploads directory exists
  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Configure Multer
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (max for video)
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
        cb(null, true);
      } else {
        cb(new Error("Only images and videos are allowed"));
      }
    },
  });

  // Serve static files from uploads directory
  app.use("/uploads", express.static(uploadDir));

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
  app.post("/api/upload", upload.array("files", 10), (req, res) => {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const fileUrls: string[] = [];
      const files = req.files as Express.Multer.File[];

      // Validate individual file sizes
      for (const file of files) {
        if (file.mimetype.startsWith("image/") && file.size > 2 * 1024 * 1024) {
           return res.status(400).json({ error: `Image ${file.originalname} exceeds 2MB limit` });
        }
        if (file.mimetype.startsWith("video/") && file.size > 10 * 1024 * 1024) {
           return res.status(400).json({ error: `Video ${file.originalname} exceeds 10MB limit` });
        }
        
        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
        fileUrls.push(fileUrl);
      }
      
      // Return single url if single file uploaded (for backward compatibility if needed) 
      // or standard format { urls: [] } or { url: ... } is tricky if client expects 1.
      // Current client ReportProblem uses .url. CreatePost will use .urls or .url
      
      if (files.length === 1 && files[0]) {
         return res.json({ url: fileUrls[0], urls: fileUrls, type: files[0].mimetype });
      }

      res.json({ urls: fileUrls });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload file" });
    }
  });

  //health check endpoint
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

  app.listen(PORT, () => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`Server is running on http://localhost:${PORT}`);
    }
  });
}

startServer();
