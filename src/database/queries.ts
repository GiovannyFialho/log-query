import database from "./database.ts";

export function getTotalAccessLogs(db = database) {
  return db.prepare(`SELECT COUNT(*) AS total FROM access_logs`).get();
}

export function getCompanies(db = database) {
  return db.prepare(`SELECT DISTINCT company FROM access_logs`).all();
}

export function getRecentAccessLogs(db = database) {
  return db
    .prepare(`SELECT * FROM access_logs ORDER BY timestamp DESC LIMIT 10`)
    .all();
}
