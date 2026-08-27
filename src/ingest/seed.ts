import { faker } from "@faker-js/faker";
import { createWriteStream, mkdirSync, statSync } from "node:fs";

import { LOG_FILE, LOG_INTERVAL } from "../constants.ts";

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

const companies: string[] = [
  "TechSolutions",
  "InnovaCorp",
  "AlphaMedia",
  "QuantumLabs",
  "DeltaFinance",
  "NexusLogistics",
  "ApexHealth",
  "EcoEnergy",
  "StellarRetail",
  "VortexConsulting",
];

const jobAreas: string[] = [
  "Engineering",
  "Marketing",
  "Sales",
  "Finance",
  "Human Resources",
  "Operations",
  "Customer Success",
];

type User = {
  ip: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  location: string;
  job_area: string;
  company: string;
  job_title: string;
};

type LogEntry = User & {
  id: string;
  timestamp: string;
};

function convertToGB(bytes: number): string {
  return (bytes / 1024 / 1024 / 1024).toFixed(4);
}

function generateUser(): User {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    ip: faker.internet.ip(),
    username: faker.internet.username({
      firstName: firstName.toLowerCase(),
      lastName: lastName.toLowerCase(),
    }),
    first_name: firstName,
    last_name: lastName,
    email: faker.internet.email({
      firstName: firstName.toLowerCase(),
      lastName: lastName.toLowerCase(),
    }),
    location: faker.location.city(),
    job_area: faker.helpers.arrayElement(jobAreas),
    company: faker.helpers.arrayElement(companies),
    job_title: faker.person.jobTitle(),
  };
}

function generateLogEntry(user: User): LogEntry {
  return {
    ...user,
    id: faker.string.uuid(),
    timestamp: faker.date.recent({ days: 30 }).toISOString(),
  };
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
