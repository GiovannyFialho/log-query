import { DatabaseSync } from "node:sqlite";

const database = new DatabaseSync("./src/database/logs.db");

database.exec(`
  CREATE TABLE IF NOT EXISTS access_logs (
    id TEXT PRIMARY KEY,
    ip TEXT NOT NULL,
    username TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    location TEXT NOT NULL,
    job_area TEXT NOT NULL,
    company TEXT NOT NULL,
    job_title TEXT NOT NULL,
    timestamp TEXT NOT NULL
  )
`);

export default database;
