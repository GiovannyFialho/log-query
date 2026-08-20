import { faker } from "@faker-js/faker";
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

const jobAreas = [
  "Engineering",
  "Marketing",
  "Sales",
  "Finance",
  "Human Resources",
  "Operations",
  "Customer Success",
];

for (let i = 1; i <= 500; i++) {
  if (i % 100 === 0) {
    stream.write("\n");

    continue;
  }

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  const user = {
    id: faker.string.uuid(),
    ip: faker.internet.ip(),
    username: faker.internet.username({
      firstName: firstName.toLocaleLowerCase(),
      lastName: lastName.toLocaleLowerCase(),
    }),
    first_name: firstName,
    last_name: lastName,
    email: faker.internet.email({
      firstName: firstName.toLocaleLowerCase(),
      lastName: lastName.toLocaleLowerCase(),
    }),
    location: faker.location.city(),
    job_area: faker.helpers.arrayElement(jobAreas),
    company: faker.helpers.arrayElement(companies),
    job_title: faker.person.jobTitle(),
    timestamp: faker.date.recent({ days: 30 }).toISOString(),
  };

  stream.write(JSON.stringify(user) + "\n");
}

stream.end(() => {
  console.log("Log file has been created and written to successfully.");
});
