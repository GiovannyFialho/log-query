import database from "./database/database.ts";

database.exec(`DELETE FROM access_logs`);

console.log("Database initialized!", database.isOpen);
