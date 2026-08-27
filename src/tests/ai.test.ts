import { equal } from "node:assert";
import { describe, it } from "node:test";

describe("Language model integration", () => {
  it("should generate a valid SQL query for a simple question", async (context) => {
    context.mock.module("ai", {
      exports: {
        generateText: async () => {
          return {
            output: {
              sql: "SELECT COUNT(*) FROM access_logs",
              explanation:
                "This query counts the total number of access log entries to determine how many people accessed the system.",
            },
          };
        },
        Output: {
          object: () => {},
        },
      },
    });

    const { generateSqlObject } = await import("../agent/index.ts");

    const question = "How many people access the system?";
    const { sql, explanation } = await generateSqlObject(question);

    equal(typeof sql, "string");
    equal(sql.trim().length > 0, true);
    equal(sql.trim().toUpperCase().startsWith("SELECT"), true);
  });
});
