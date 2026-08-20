import assert from "node:assert/strict";
import { test } from "node:test";

import { isSafeQuery } from "../database/validate-sql.ts";

test("should accept a SELECT query", () => {
  const result = isSafeQuery("SELECT * FROM access_logs");

  assert.equal(result, true);
});

test("should reject an INSERT query", () => {
  const result = isSafeQuery("INSERT INTO access_logs (id) VALUES ('123')");

  assert.equal(result, false);
});

test("should reject an UPDATE query", () => {
  const result = isSafeQuery("UPDATE access_logs SET company = 'Google'");

  assert.equal(result, false);
});

test("should reject a DELETE query", () => {
  const result = isSafeQuery("DELETE FROM access_logs WHERE id = '123'");

  assert.equal(result, false);
});

test("should reject a DROP query", () => {
  const result = isSafeQuery("DROP TABLE access_logs");

  assert.equal(result, false);
});

test("should reject a query that is not SELECT", () => {
  const result = isSafeQuery("hello world");

  assert.equal(result, false);
});
