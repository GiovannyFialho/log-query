import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

import { insertAccessLog } from "../database/database.ts";
import {
  getCompanies,
  getRecentAccessLogs,
  getTotalAccessLogs,
} from "../database/queries.ts";

const stream = createReadStream("./src/database/access.log", {
  encoding: "utf-8",
});
const rl = createInterface({ input: stream });

console.log("Reading file line by line...");
console.log("=============================");

for await (const line of rl) {
  if (line.trim() === "") {
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
  } catch (error) {
    console.error(`Error parsing line: ${line}`);
  }
}

const result = getTotalAccessLogs();

console.log(`Total records in the database: ${result?.total}`);
console.log(
  `Companies: ${getCompanies()
    .map((company) => company.company)
    .join(", ")}`,
);
console.log("\nRecent access logs:");
console.log(getRecentAccessLogs());
