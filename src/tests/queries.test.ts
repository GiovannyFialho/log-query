import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { after, beforeEach, test } from "node:test";

import {
  getCompanies,
  getRecentAccessLogs,
  getTotalAccessLogs,
} from "../database/queries.ts";

let database: DatabaseSync;

beforeEach(() => {
  database = new DatabaseSync(":memory:");

  database.exec(`
    CREATE TABLE access_logs (
      id TEXT PRIMARY KEY,
      ip TEXT NOT NULL,
      username TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      location TEXT NOT NULL,
      job_area TEXT NOT NULL,
      company TEXT NOT NULL,
      job_title TEXT NOT NULL,
      timestamp TEXT NOT NULL
    )
  `);
});

after(() => {
  database.close();
});

test("should return the total number of access logs", () => {
  database.exec(`
    INSERT INTO access_logs (
      id,
      ip,
      username,
      first_name,
      last_name,
      email,
      location,
      job_area,
      company,
      job_title,
      timestamp
    )
    VALUES (
      '1',
      '192.168.0.1',
      'john',
      'John',
      'Doe',
      'john@example.com',
      'São Paulo',
      'Engineering',
      'TechSolutions',
      'Developer',
      '2026-08-19T10:00:00.000Z'
    )
  `);

  const result = getTotalAccessLogs(database);

  assert.equal(result?.total, 1);
});

test("should return distinct companies", () => {
  database.exec(`
    INSERT INTO access_logs (
      id,
      ip,
      username,
      first_name,
      last_name,
      email,
      location,
      job_area,
      company,
      job_title,
      timestamp
    )
    VALUES (
      '1',
      '192.168.0.1',
      'john',
      'John',
      'Doe',
      'john@example.com',
      'São Paulo',
      'Engineering',
      'TechSolutions',
      'Developer',
      '2026-08-19T10:00:00.000Z'
    );

    INSERT INTO access_logs (
      id,
      ip,
      username,
      first_name,
      last_name,
      email,
      location,
      job_area,
      company,
      job_title,
      timestamp
    )
    VALUES (
      '2',
      '192.168.0.2',
      'jane',
      'Jane',
      'Doe',
      'jane@example.com',
      'Campinas',
      'Marketing',
      'AlphaMedia',
      'Manager',
      '2026-08-19T11:00:00.000Z'
    );
  `);

  const result = getCompanies(database);

  assert.equal(result.length, 2);
});

test("should return recent access logs", () => {
  database.exec(`
    INSERT INTO access_logs (
      id,
      ip,
      username,
      first_name,
      last_name,
      email,
      location,
      job_area,
      company,
      job_title,
      timestamp
    )
    VALUES (
      '1',
      '192.168.0.1',
      'john',
      'John',
      'Doe',
      'john@example.com',
      'São Paulo',
      'Engineering',
      'TechSolutions',
      'Developer',
      '2026-08-19T10:00:00.000Z'
    );

    INSERT INTO access_logs (
      id,
      ip,
      username,
      first_name,
      last_name,
      email,
      location,
      job_area,
      company,
      job_title,
      timestamp
    )
    VALUES (
      '2',
      '192.168.0.2',
      'jane',
      'Jane',
      'Doe',
      'jane@example.com',
      'Campinas',
      'Marketing',
      'AlphaMedia',
      'Manager',
      '2026-08-19T11:00:00.000Z'
    );
  `);

  const result = getRecentAccessLogs(database);

  assert.equal(result.length, 2);
  assert.equal(result[0].id, "2");
  assert.equal(result[1].id, "1");
});
