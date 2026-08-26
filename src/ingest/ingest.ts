import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

import { createDb } from "../database/database.ts";

import { LOG_FILE, LOG_INTERVAL } from "../index.ts";

const db = createDb("./src/database/access_logs.db");
db.exec(`DELETE FROM access_logs`);

const stream = createReadStream(`./src/database/${LOG_FILE}`, {
  encoding: "utf-8",
});
const rl = createInterface({ input: stream, crlfDelay: Infinity });
let count = 0;

console.log("Reading file line by line...");
console.log("=============================");
console.time("Processing Logs");

for await (const line of rl) {
  if (!line.trim()) continue; // Skip empty lines

  let record;

  try {
    record = JSON.parse(line);
  } catch (_) {
    continue; // Skip this line and continue with the next one
  }

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

  count++;

  if (count % LOG_INTERVAL === 0) {
    console.log(`Processed ${count} records...`);
  }
}

console.timeEnd("Processing Logs");
console.log(`Total records processed: ${count}`);

db.close();
