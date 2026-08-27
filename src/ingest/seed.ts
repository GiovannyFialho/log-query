import { faker } from "@faker-js/faker";
import { createWriteStream, mkdirSync, statSync } from "node:fs";

import type { User } from "../@types/intex.ts";
import { LOG_FILE, LOG_INTERVAL } from "../constants.ts";
import { generateLogEntry, generateUser } from "../utils/index.ts";

mkdirSync("./src/database", { recursive: true });

const maxRecords = Number(process.argv[2] || Infinity);

if (
  (!Number.isInteger(maxRecords) && Number.isFinite(maxRecords)) ||
  Number.isNaN(maxRecords) ||
  maxRecords <= 0
) {
  console.error("Invalid maxRecords value. Please provide a positive integer.");
  process.exit(1);
}

const stream = createWriteStream(`./src/database/${LOG_FILE}`);

function convertToGB(bytes: number): string {
  return (bytes / 1024 / 1024 / 1024).toFixed(4);
}

function writeRecord(line: string): Promise<void> {
  return new Promise((resolve) => {
    if (!stream.write(line)) {
      stream.once("drain", resolve);
    } else {
      resolve();
    }
  });
}

console.log(
  `🎲 Generating log file with fake data in ${LOG_FILE}... (Ctrl+C to stop)`,
);

console.log(`💿 Max records to generate: ${maxRecords.toLocaleString()}`);

const users: User[] = Array.from({ length: 5 }, generateUser);

let count = 0;

process.on("SIGINT", () => {
  stream.end(() => {
    const { size } = statSync(`./src/database/${LOG_FILE}`);

    console.log(
      `\n 🌱 Process interrupted. Generated ${count.toLocaleString()} records.`,
    );

    console.log(`Current file size: ${convertToGB(size)} GB ✅`);

    process.exit(0);
  });
});

while (count < maxRecords) {
  const user = faker.helpers.arrayElement(users);
  const record = generateLogEntry(user);

  await writeRecord(JSON.stringify(record) + "\n");

  count++;

  if (count % LOG_INTERVAL === 0) {
    const { size } = statSync(`./src/database/${LOG_FILE}`);

    console.log(
      `Generated ${count.toLocaleString()} records. Current file size: ${convertToGB(size)} GB ✅`,
    );
  }
}

stream.end(() => {
  const { size } = statSync(`./src/database/${LOG_FILE}`);

  console.log(`🌱 Finished generating ${count.toLocaleString()} records.`);
  console.log(`Final file size: ${convertToGB(size)} GB ✅`);
});
