import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { config } from "../config/config.js";
import { GraphQLError } from "graphql";
import mongoose from "mongoose";

const resolvers = {
  Query: {
    currentUser: async (_, __, context) => {
      const loggedInUser = context.user;
      if (!loggedInUser?.id) {
        return null;
      }
      try {
        const user = await User.findById(loggedInUser.id).select("-password");
        if (!user) {
          return null;
        }
        return user;
      } catch (error) {
        console.error("Error fetching currentUser:", error);
        return null;
      }
    },
  },
  Mutation: {
    login: async (_, { email, password }, { res }) => {
      console.log("Login request received for email:", email);
      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found for email:", email);
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Password mismatch for email:", email);
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          location: user.location,
        },
        config.JWT_SECRET,
        { expiresIn: "1d" },
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });

      console.log("Cookie set for user:", user.username);

      return {
        token,
        user,
      };
    },
    register: async (_, { username, email, password, role, location }) => {
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        if (existingUser.email === email) {
          throw new GraphQLError("Email already exists", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        } else {
          throw new GraphQLError("Username already taken", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      const user = new User({ username, email, password, role, location });
      try {
        await user.save();
        console.log(`User registered: ${username} with role ${role}`);

        const token = jwt.sign(
          {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            location: user.location,
          },
          config.JWT_SECRET,
          { expiresIn: "1d" },
        );

        return {
          token,
          user,
        };
      } catch (error) {
        console.error("Error during user registration:", error);
        if (error.name === "ValidationError") {
          throw new GraphQLError(
            `Registration validation failed: ${error.message}`,
            { extensions: { code: "BAD_USER_INPUT" } },
          );
        }
        throw new GraphQLError("Failed to register user", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    logout: (_, __, { res }) => {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        path: "/",
      });
      console.log("User logged out, cookie cleared.");
      return true;
    },
  },

  User: {
    __resolveReference: async (reference) => {
      console.log("Resolving reference for User ID:", reference.id);
      if (!mongoose.Types.ObjectId.isValid(reference.id)) {
        console.error("Invalid reference ID for User:", reference.id);
        throw new GraphQLError("Invalid User ID format in reference", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      try {
        const user = await User.findById(reference.id).select("-password");
        if (!user) {
          console.warn(`User not found for reference ID: ${reference.id}`);
          return null;
        }
        return user;
      } catch (error) {
        console.error("Error resolving reference for User:", error);
        throw new GraphQLError("Could not resolve user reference", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};

export default resolvers;

