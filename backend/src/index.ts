import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { expressMiddleware } from "@as-integrations/express5";
import { createGraphqlServer } from "./graphql/server.js";
import { createContext } from "./graphql/context.js";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8000;

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
