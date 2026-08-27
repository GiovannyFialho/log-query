import { faker } from "@faker-js/faker";

import type { LogEntry, User } from "../@types/intex.ts";

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

export function generateUser(): User {
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

export function generateLogEntry(user: User): LogEntry {
  return {
    ...user,
    id: faker.string.uuid(),
    timestamp: faker.date.recent({ days: 30 }).toISOString(),
  };
}
