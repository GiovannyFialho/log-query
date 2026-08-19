const forbiddenCommands = [
  "INSERT",
  "UPDATE",
  "DELETE",
  "DROP",
  "ALTER",
  "CREATE",
  "REPLACE",
  "PRAGMA",
  "ATTACH",
  "DETACH",
  "VACUUM",
];

export function isSafeQuery(sql: string) {
  const normalizedSql = sql.trim().toUpperCase();

  if (!normalizedSql.startsWith("SELECT")) {
    return false;
  }

  return !forbiddenCommands.some((command) => normalizedSql.includes(command));
}
