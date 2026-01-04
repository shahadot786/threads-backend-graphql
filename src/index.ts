import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { typeDefs, resolvers } from "./graphql/index.js";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8000;

  //configure Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  app.get("/", (req, res) => {
    res.json({ message: "Hello, Threads App Backend!" });
  });

  app.use(express.json());

  app.use("/graphql", expressMiddleware(apolloServer));

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
