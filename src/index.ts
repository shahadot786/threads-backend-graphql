import "dotenv/config";
import express from "express";
import { expressMiddleware } from "@as-integrations/express5";
import { createGraphqlServer } from "./graphql/server.js";
import { createContext } from "./graphql/context.js";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8000;

  app.get("/", (req, res) => {
    res.json({ message: "Hello, Threads App Backend!" });
  });

  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware(await createGraphqlServer(), {
      context: async ({ req }) => {
        // Extract token from Authorization header (Bearer token)
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ")
          ? authHeader.slice(7)
          : undefined;

        return createContext(token);
      },
    })
  );

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
