import { randomUUID } from "node:crypto";
import { createWriteStream, mkdirSync } from "node:fs";

mkdirSync("./src/database", { recursive: true });

const stream = createWriteStream("./src/database/access.log");

const companies = [
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

for (let i = 1; i <= 20; i++) {
  if (i % 100 === 0) {
    stream.write("\n");

    continue;
  }

  const randomCompany = companies[Math.floor(Math.random() * companies.length)];

  stream.write(
    JSON.stringify({
      id: randomUUID(),
      ip: `192.168.0.${i}`,
      username: `username${i}`,
      first_name: `First Name ${i}`,
      last_name: `Last Name ${i}`,
      email: `user${i}@example.com`,
      location: `Location ${i}`,
      job_area: `Job Area ${i}`,
      company: randomCompany,
      job_title: `Job Title ${i}`,
      timestamp: new Date().toISOString(),
    }) + "\n",
  );
}

stream.end(() => {
  console.log("Log file has been created and written to successfully.");
});
