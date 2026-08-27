import { equal } from "node:assert";
import { describe, it } from "node:test";

import { createDb } from "../database/database.ts";
import { generateLogEntry, generateUser } from "../utils/index.ts";

describe("Database layer", () => {
  const db = createDb();

  it("should insert a record into the database", () => {
    const user = generateUser();
    const record = generateLogEntry(user);

    db.prepare(
      `
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      record.id,
      record.ip,
      record.username,
      record.first_name,
      record.last_name,
      record.email,
      record.location,
      record.job_area,
      record.company,
      record.job_title,
      record.timestamp,
    );

    const all = db.prepare("SELECT COUNT(*) FROM access_logs").all();

    equal(all[0]["COUNT(*)"], 1);
  });
});
