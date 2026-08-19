import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

import { insertAccessLog } from "../database/database.ts";

const stream = createReadStream("./src/database/access.log", {
  encoding: "utf-8",
});
const rl = createInterface({ input: stream });

console.log("Reading file line by line...");
console.log("=============================");
console.time("Processing Logs");

for await (const line of rl) {
  if (line.trim() === "") {
    continue;
  }

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
}

console.timeEnd("Processing Logs");
