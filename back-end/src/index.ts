import { preflightResponse, jsonResponse, toErrorResponse } from "./lib/http";
import { handleAssetCollection, handleAssetItem } from "./routes/assets";
import { handleTodoCollection, handleTodoItem } from "./routes/todos";
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
        return handleAssetCollection(request, env);
      }

      if (segments.length === 2 && segments[0] === "api" && segments[1] === "todos") {
        return handleTodoCollection(request, env);
      }

      if (segments.length === 3 && segments[0] === "api" && segments[1] === "assets") {
        return handleAssetItem(request, env, segments[2], false);
      }

      if (segments.length === 3 && segments[0] === "api" && segments[1] === "todos") {
        return handleTodoItem(request, env, segments[2], false);
      }

      if (
        segments.length === 4 &&
        segments[0] === "api" &&
        segments[1] === "assets" &&
        segments[3] === "content"
      ) {
        return handleAssetItem(request, env, segments[2], true);
      }

      if (
        segments.length === 4 &&
        segments[0] === "api" &&
        segments[1] === "todos" &&
        segments[3] === "image"
      ) {
        return handleTodoItem(request, env, segments[2], true);
      }

      return jsonResponse(404, { error: "Route not found" });
    } catch (error) {
      return toErrorResponse(error);
    }
  },
};

export default worker;
