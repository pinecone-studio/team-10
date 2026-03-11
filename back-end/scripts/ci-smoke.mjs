import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "graphql";

const schema = await readFile(new URL("../graphql/generated/schema.graphql", import.meta.url), "utf8");
const document = parse(schema);
const printedSchema = JSON.stringify(document);

assert.match(printedSchema, /"Query"/);
assert.match(printedSchema, /"Mutation"/);
assert.match(printedSchema, /"Todo"/);
assert.match(printedSchema, /"todos"/);
assert.match(printedSchema, /"createTodo"/);

console.log("Back-end smoke test passed.");
