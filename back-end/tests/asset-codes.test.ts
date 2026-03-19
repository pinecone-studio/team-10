import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAssetCode,
  createAssetPrefix,
  extractAssetCodeSequence,
  getAssetCodeYear,
} from "../lib/asset-codes.ts";

test("createAssetPrefix maps common inventory names to stable prefixes", () => {
  assert.equal(createAssetPrefix("MacBook Pro 16"), "MAC");
  assert.equal(createAssetPrefix("Office Monitor"), "MON");
  assert.equal(createAssetPrefix("Desk Dock"), "DOC");
  assert.equal(createAssetPrefix("X"), "X");
});

test("buildAssetCode formats prefix, year, and sequence", () => {
  assert.equal(buildAssetCode("MacBook Pro 16", "2026-06-01", 1), "MAC-2026-001");
  assert.equal(buildAssetCode("Router", "2026-06-01T10:00:00.000Z", 12), "ROU-2026-012");
});

test("asset code helpers recover year and sequence safely", () => {
  assert.equal(getAssetCodeYear("2026-06-01"), 2026);
  assert.equal(extractAssetCodeSequence("MAC-2026-015"), 15);
  assert.equal(extractAssetCodeSequence("broken"), 0);
});
