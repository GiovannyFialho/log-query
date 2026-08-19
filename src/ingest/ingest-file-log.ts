import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

import database, { insertAccessLog } from "../database/database.ts";

const stream = createReadStream("./src/database/access.log", {
  encoding: "utf-8",
});
const rl = createInterface({ input: stream });

let dataLogs = {
  empty: 0,
  valid: 0,
  invalid: 0,
};

console.log("Reading file line by line...");
console.log("=============================");

for await (const line of rl) {
  if (line.trim() === "") {
    dataLogs.empty++;
    continue;
  }

  try {
    const data = JSON.parse(line);

    insertAccessLog.run(
      data.id,
      data.ip,
      data.username,
      data.first_name,
      data.last_name,
      data.email,
      data.location,
      data.job_area,
      data.company,
      data.job_title,
      data.timestamp,
    );

    dataLogs.valid++;
  } catch (error) {
    dataLogs.invalid++;
  }
}

const result = database
  .prepare(`SELECT COUNT(*) AS total FROM access_logs`)
  .get();

console.log(`Processed lines from the log file:`);
console.log(`Empty: ${dataLogs.empty}`);
console.log(`Valid: ${dataLogs.valid}`);
console.log(`Invalid: ${dataLogs.invalid}`);
console.log(`Total records in the database: ${result?.total}`);
