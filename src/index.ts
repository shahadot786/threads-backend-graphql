import express from "express";
import { expressMiddleware } from "@as-integrations/express5";
import { createGraphqlServer } from "./graphql/server.js";


async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8000;

  app.get("/", (req, res) => {
    res.json({ message: "Hello, Threads App Backend!" });
  });

  app.use(express.json());

  app.use("/graphql", expressMiddleware(await createGraphqlServer()));

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
