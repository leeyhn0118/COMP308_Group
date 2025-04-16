import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { parse } from "graphql";

import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";

import { createServer } from "http";
import { WebSocketServer } from "ws";
import { useServer } from "./ws/useServer.js";
import _ from "lodash";

import { config } from "./config/config.js";
import connectDB from "./config/mongoose.js";
import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";
import emergencyResolvers from "./graphql/alertResolver.js";

connectDB();

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3003",
      "http://localhost:3004",
      "http://localhost:3005",
      "http://localhost:4000",
      "https://studio.apollographql.com",
    ],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mergedResolvers = _.merge({}, resolvers, emergencyResolvers);

const schema = buildSubgraphSchema([
  { typeDefs: parse(typeDefs), resolvers: mergedResolvers },
]);

const httpServer = createServer(app);
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});

const server = new ApolloServer({ schema, introspection: true });

async function startServer() {
  await server.start();

  useServer(
    {
      schema,
      context: async (ctx, msg, args) => {
        const token = ctx.connectionParams?.authorization?.split(" ")[1];
        let user = null;

        if (token) {
          try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            user = {
              id: decoded.id,
              username: decoded.username,
              role: decoded.role,
              location: decoded.location,
            };
            console.log("✅ WS Connection user:", user);
          } catch (err) {
            console.error("WebSocket token error:", err);
          }
        }

        return { user };
      },
    },
    wsServer,
  );
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const token =
          req.headers.authorization?.split(" ")[1] || req.cookies?.token;

        let user = null;
        if (token) {
          try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            user = {
              _id: decoded.id,
              username: decoded.username,
              email: decoded.email,
              role: decoded.role,
              location: decoded.location,
            };
          } catch (e) {
            console.error("[Invalid token]", e.message);
          }
        }

        return { user, res };
      },
    }),
  );

  httpServer.listen(config.port, () => {
    console.log(`🚀 HTTP ready at http://localhost:${config.port}/graphql`);
    console.log(`📡 WebSocket ready at ws://localhost:${config.port}/graphql`);
  });
}

startServer();
