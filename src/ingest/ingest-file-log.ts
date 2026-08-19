import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

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

    dataLogs.valid++;
  } catch (error) {
    dataLogs.invalid++;
  }
}

console.log(`Processed lines from the log file:`);
console.log(`Empty: ${dataLogs.empty}`);
console.log(`Valid: ${dataLogs.valid}`);
console.log(`Invalid: ${dataLogs.invalid}`);
