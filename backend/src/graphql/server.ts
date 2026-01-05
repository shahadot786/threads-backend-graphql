import { ApolloServer } from "@apollo/server";
import { typeDefs, resolvers } from "./index.js";

export const createGraphqlServer = async () => {

    //configure Apollo Server
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
    });

    await apolloServer.start();

    return apolloServer;
}