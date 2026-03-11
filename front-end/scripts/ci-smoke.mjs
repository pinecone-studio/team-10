import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "graphql";

const query = await readFile(new URL("../app/todo/_graphql/todo.graphql", import.meta.url), "utf8");
const document = parse(query);
const operationNames = document.definitions
  .filter((definition) => definition.kind === "OperationDefinition")
  .map((definition) => definition.name?.value)
  .filter(Boolean);

assert.deepEqual(operationNames.sort(), ["CreateTodo", "DeleteTodo", "GetTodo", "GetTodos", "UpdateTodo"]);

console.log("Front-end smoke test passed.");
