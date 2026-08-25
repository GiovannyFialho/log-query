import { createDb } from "./database/database.ts";

const db = createDb("access_logs.db");

db.exec(`DELETE FROM access_logs`);

export const insertAccessLog = db.prepare(`
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
`);

console.log("Database seeded successfully. 💿");
