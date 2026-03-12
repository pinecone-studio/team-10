import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parse } from "graphql";

const schema = await readFile(new URL("../graphql/generated/schema.graphql", import.meta.url), "utf8");
const document = parse(schema);
const printedSchema = JSON.stringify(document);

assert.match(printedSchema, /"Query"/);
assert.match(printedSchema, /"Mutation"/);
assert.match(printedSchema, /"Order"/);
assert.match(printedSchema, /"Receive"/);
assert.match(printedSchema, /"orders"/);
assert.match(printedSchema, /"receives"/);
assert.match(printedSchema, /"createOrder"/);
assert.match(printedSchema, /"createReceive"/);
assert.doesNotMatch(printedSchema, /"Todo"/);
assert.doesNotMatch(printedSchema, /"todos"/);
assert.doesNotMatch(printedSchema, /"createTodo"/);

console.log("Back-end smoke test passed.");
