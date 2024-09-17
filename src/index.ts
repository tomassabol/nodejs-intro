import { createServer } from "node:http";
import * as mongoose from "mongoose";
import { userModel } from "./model/user-model";
import { userSchema } from "./schema/user-schema";
import { env } from "./common/env";
import { logger } from "./common/logger";
import { ApiError } from "./common/api-error";
import { todoModel } from "./model/todo-model";
import { todoSchema } from "./schema/todo-schema";

const _db = await mongoose.connect(env("MONGO_URL"));
const User = mongoose.model("User", userModel);
const Todo = mongoose.model("todo", todoModel);

const headers = {
  "Access-Control-Allow-Origin": "*", // Fixed the typo here
  "Access-Control-Allow-Methods": "OPTIONS, POST, GET, DELETE",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": 2592000, // 30 days
} as const;

const server = createServer(async (req, res) => {
  logger.incomingMessage(req);

  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }

  const method = req.method;
  const url = req.url;

  // Handle OPTIONS requests
  if (method === "OPTIONS") {
    res.writeHead(204, headers);
    return res.end();
  }

  if (!url) {
    res.writeHead(404, {
      "Content-Type": "application/json",
    });
    return res.end(JSON.stringify({ message: "Not Found" }));
  }
  if (!method) {
    res.writeHead(405, {
      "Content-Type": "application/json",
    });
    return res.end(JSON.stringify({ message: "Method Not Allowed" }));
  }

  if (url === "/") {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    return res.end(JSON.stringify({ message: "Hello World!" }));
  }

  if (url === "/users" && method === "GET") {
    try {
      const users = await User.find();

      res.writeHead(200, {
        "Content-Type": "application/json",
      });
      logger.info("API response", "GET /users", { users });
      return res.end(JSON.stringify(users));
    } catch (error) {
      logger.error("Error occurred", "GET /users", { error });

      if (error instanceof Error) {
        throw new ApiError(500, error.message, res);
      }

      throw new ApiError(500, "Internal server error", res);
    }
  }

  if (url === "/users" && method === "POST") {
    await new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (data) => (body += data));

      req.on("end", async () => {
        try {
          const user = JSON.parse(body);
          const validatedUser = userSchema.parse(user);
          const newUser = new User(validatedUser);
          const createdUser = await newUser.save();

          res.writeHead(201, {
            "Content-Type": "application/json",
          });
          logger.info("API response", "POST /users", { user: createdUser });
          resolve(
            res.end(
              JSON.stringify({
                message: "User created successfully!",
                user: createdUser,
              })
            )
          );
          return res.end(JSON.stringify(newUser));
        } catch (error) {
          logger.error("Error occurred", "POST /users", { error });

          res.writeHead(500, {
            "Content-Type": "application/json",
          });
          console.log(error);
          if (error instanceof Error) {
            throw new ApiError(500, error.message, res);
          }

          throw new ApiError(500, "Internal server error", res);
        }
      });
    });
  }

  if (method === "GET" && url.startsWith("/users/")) {
    const urlSplit = url.split("/");
    if (urlSplit.length > 3) {
      res.writeHead(404, {
        "Content-Type": "application/json",
      });
      return res.end(JSON.stringify({ message: "Not found" }));
    }

    const id = urlSplit[2];
    if (!id) {
      res.writeHead(404, {
        "Content-Type": "application/json",
      });
      return res.end(JSON.stringify({ message: "User ID is required" }));
    }

    try {
      const user = await User.findById(id);
      if (!user) {
        logger.error("User not found", "GET /users/:id", { id });
        throw new ApiError(404, "User not found", res);
      }

      res.writeHead(200, {
        "Content-Type": "application/json",
      });
      logger.info("API response", "GET /users/:id", { user });
      return res.end(JSON.stringify(user));
    } catch (error) {
      logger.error("Error occurred", "GET /users/:id", { error });

      res.writeHead(500, {
        "Content-Type": "application/json",
      });
      if (error instanceof Error) {
        throw new ApiError(500, error.message, res);
      }

      throw new ApiError(500, "Internal server error", res);
    }
  }

  if (method === "POST" && url === "/todo") {
    await new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (data) => (body += data));

      req.on("end", async () => {
        try {
          const todo = JSON.parse(body);
          const validatedTodo = todoSchema.parse(todo);
          const newTodo = new Todo({
            message: validatedTodo.message,
          });
          const createdTodo = await newTodo.save();

          res.writeHead(201, { "Content-Type": "application/json" });
          logger.info("API response", "POST /todo", { todo: createdTodo });

          resolve(
            res.end(
              JSON.stringify({
                message: "OK",
                todo: createdTodo,
              })
            )
          );
          return res.end(JSON.stringify(newTodo));
        } catch (error) {
          logger.error("Error occurred", "POST /todo", { error });

          res.writeHead(500, { "Content-Type": "application/json" });
          if (error instanceof Error) {
            throw new ApiError(500, error.message, res);
          }

          throw new ApiError(500, "Internal server error", res);
        }
      });
    });
  }

  if (method === "DELETE" && url.startsWith("/todo/")) {
    const urlSplit = url.split("/");
    if (urlSplit.length > 3) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Not found" }));
    }

    const id = urlSplit[2];
    if (!id) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Todo ID is required" }));
    }

    try {
      const todo = await Todo.findByIdAndDelete(id);
      if (!todo) {
        logger.error("Todo not found", "DELETE /todo/:id", { id });
        throw new ApiError(404, "Todo not found", res);
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      logger.info("API response", "DELETE /todo/:id", { todo });
      return res.end(JSON.stringify(todo));
    } catch (error) {
      logger.error("Error occurred", "DELETE /todo/:id", { error });

      res.writeHead(500, { "Content-Type": "application/json" });
      if (error instanceof Error) {
        throw new ApiError(500, error.message, res);
      }

      throw new ApiError(500, "Internal server error", res);
    }
  }

  if (method === "GET" && url === "/todo") {
    try {
      const todos = await Todo.find();

      res.writeHead(200, { "Content-Type": "application/json" });
      logger.info("API response", "GET /todo", { todos });

      return res.end(JSON.stringify(todos));
    } catch (error) {
      logger.error("Error occurred", "GET /todo", { error });

      if (error instanceof Error) {
        throw new ApiError(500, error.message, res);
      }

      throw new ApiError(500, "Internal server error", res);
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  return res.end(JSON.stringify({ message: "Not Found" }));
});

server.listen(3000, "127.0.0.1", () =>
  logger.info("Server is running on http://127.0.0.1:3000")
);
