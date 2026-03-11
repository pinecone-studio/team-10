import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";

const dashboardEntries = await readdir(new URL("../app/(dashboard)", import.meta.url), {
  withFileTypes: true,
});
const dashboardNames = dashboardEntries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

assert.deepEqual(dashboardNames, [
  "_components",
  "_features",
  "_graphql",
  "admin",
  "assets",
  "assignment-requests",
  "dashboard",
  "disposals",
  "distributions",
  "orders",
  "receiving",
  "storage",
]);

const sharedNotifications = await Promise.all([
  readdir(new URL("../app/(dashboard)/_components", import.meta.url), {
    withFileTypes: true,
  }),
  readdir(new URL("../app/(dashboard)/_features", import.meta.url), {
    withFileTypes: true,
  }),
  readdir(new URL("../app/(dashboard)/_graphql", import.meta.url), {
    withFileTypes: true,
  }),
]);

assert.ok(
  sharedNotifications.every((entries) =>
    entries.some((entry) => entry.isDirectory() && entry.name === "notifications"),
  ),
);

console.log("Front-end smoke test passed.");
