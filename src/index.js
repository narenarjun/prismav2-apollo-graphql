import "@babel/polyfill/noConflict";

import { ApolloServer } from "apollo-server-express";
import { PrismaClient } from "@prisma/client";
import express from "express";

import schemawithtypedefresolver from "./schema/schema";

const Port = process.env.PORT || 6000;
const Path = process.env.GRAPHQLPATH
  ? `/${process.env.GRAPHQLPATH}`
  : "/graphql";

const prisma = new PrismaClient();

// ! swapping applymiddleware of express implementation with server.listen to specify the path we want to listen.
const app = express();

const server = new ApolloServer({
  schema: schemawithtypedefresolver,
  context: ({ req, connection }) => {
    const request = { req, connection };
    return {
      prisma,
      request,
    };
  },
  // if the NODE_ENV=PRODUCTION, introspection and playground are set to false, this will override them.
  introspection: true,
  playground: true,
  // this healthcheck is very useful in liveness & readiness probes in the k8s or any cloud enviroments.
  onHealthCheck: () => {
    return new Promise((resolve, reject) => {
      // Replace the `true` in this conditional with more specific checks!
      if (true) {
        resolve();
      } else {
        reject();
      }
    });
  },
});

server.applyMiddleware({ app, path: Path });

const wonderServer = app.listen({ port: Port }, () => {
  console.log(
    `Server is running at http://localhost:${Port}${server.graphqlPath} 🚀🚀🚀 `
  );
  console.log(
    `Health check is at: http://localhost:${Port}/.well-known/apollo/server-health 🏥✅🏥✅`
  );
});

//*  graceful shutdown
const sigs = ["SIGINT", "SIGTERM", "SIGQUIT"];
sigs.forEach((sig) => {
  process.on(sig, () => {
    console.log("SIGTERM signal received: closing HTTP server");
    console.log("Closing http server.");
    // ! shutting down apollo-server.
    wonderServer.close(async () => {
      console.log("HTTP server closed");

      // * shutting and closing connection with prisma and database.
      await prisma.$disconnect(() => {
        console.log("prisma database connection closed");
      });
      process.exit(0);
    });
  });
});
