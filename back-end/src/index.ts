import { preflightResponse, jsonResponse, toErrorResponse } from "./lib/http";
import {
  createAssetMutation,
  deleteAssetMutation,
  updateAssetMutation,
} from "./mutations/assets";
import { createTodoMutation, deleteTodoMutation, updateTodoMutation } from "./mutations/todo";
import { queryAsset, queryAssetContent, queryAssets } from "./queries/assets";
import { queryTodo, queryTodoImage, queryTodos } from "./queries/todos";
import type { Env } from "./types";

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return preflightResponse();
    }

    const segments = new URL(request.url).pathname.split("/").filter(Boolean);

    try {
      if (segments.length === 1 && segments[0] === "health") {
        return jsonResponse(200, {
          ok: true,
          service: "team10-backend-api",
        });
      }

      if (segments.length === 2 && segments[0] === "api" && segments[1] === "assets") {
        if (request.method === "GET") {
          return queryAssets(env);
        }

        if (request.method === "POST") {
          return createAssetMutation(request, env);
        }

        return jsonResponse(405, { error: "Method not allowed" });
      }

      if (segments.length === 2 && segments[0] === "api" && segments[1] === "todos") {
        if (request.method === "GET") {
          return queryTodos(env);
        }

        if (request.method === "POST") {
          return createTodoMutation(request, env);
        }

        return jsonResponse(405, { error: "Method not allowed" });
      }

      if (segments.length === 3 && segments[0] === "api" && segments[1] === "assets") {
        if (request.method === "GET") {
          return queryAsset(segments[2], env);
        }

        if (request.method === "PUT") {
          return updateAssetMutation(request, env, segments[2]);
        }

        if (request.method === "DELETE") {
          return deleteAssetMutation(segments[2], env);
        }

        return jsonResponse(405, { error: "Method not allowed" });
      }

      if (segments.length === 3 && segments[0] === "api" && segments[1] === "todos") {
        if (request.method === "GET") {
          return queryTodo(segments[2], env);
        }

        if (request.method === "PUT") {
          return updateTodoMutation(request, env, segments[2]);
        }

        if (request.method === "DELETE") {
          return deleteTodoMutation(segments[2], env);
        }

        return jsonResponse(405, { error: "Method not allowed" });
      }

      if (
        segments.length === 4 &&
        segments[0] === "api" &&
        segments[1] === "assets" &&
        segments[3] === "content"
      ) {
        if (request.method === "GET") {
          return queryAssetContent(segments[2], env);
        }

        return jsonResponse(405, { error: "Method not allowed" });
      }

      if (
        segments.length === 4 &&
        segments[0] === "api" &&
        segments[1] === "todos" &&
        segments[3] === "image"
      ) {
        if (request.method === "GET") {
          return queryTodoImage(segments[2], env);
        }

        return jsonResponse(405, { error: "Method not allowed" });
      }

      return jsonResponse(404, { error: "Route not found" });
    } catch (error) {
      return toErrorResponse(error);
    }
  },
};

export default worker;
