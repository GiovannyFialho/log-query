import database from "./database.ts";

export function getTotalAccessLogs() {
  return database.prepare(`SELECT COUNT(*) AS total FROM access_logs`).get();
}

export function getCompanies() {
  return database.prepare(`SELECT DISTINCT company FROM access_logs`).all();
}

export function getRecentAccessLogs() {
  return database
    .prepare(`SELECT * FROM access_logs ORDER BY timestamp DESC LIMIT 10`)
    .all();
}
