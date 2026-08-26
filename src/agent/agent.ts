import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { createInterface } from "node:readline";
import { z } from "zod";

const SCHEMA_DESCRIPTION = `
  The available table in the database is: 
  access_logs ( 
    id TEXT, 
    ip TEXT, 
    username TEXT, 
    first_name TEXT, 
    last_name TEXT, 
    email TEXT, 
    location TEXT, 
    job_area TEXT, 
    company TEXT, 
    job_title TEXT, 
    timestamp TEXT 
  ) 
`;

const BLOCKED_KEYWORDS = [
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
  "TRUNCATE",
  "REINDEX",
  "ANALYZE",
  "BEGIN",
  "COMMIT",
  "ROLLBACK",
  "SAVEPOINT",
  "RELEASE",
];

const sqlSuggestionSchema = z.object({
  sql: z.string(),
  explanation: z.string(),
});

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function validateSqlQuery(sql: string) {
  if (typeof sql !== "string" || !sql.trim()) {
    throw new Error("SQL query must be a non-empty string.");
  }

  const safeSQL = sql.trim().replace(/;\s*$/, "").trim();

  for (const keyword of BLOCKED_KEYWORDS) {
    if (new RegExp(`\\b${keyword}\\b`, "i").test(safeSQL)) {
      throw new Error(`The SQL query contains a blocked keyword: ${keyword}`);
    }
  }

  return safeSQL;
}

async function generateSqlObject() {
  rl.question(
    "\n Enter your question (or type 'exit' to quit): ",

    async (question) => {
      if (question.toLowerCase().trim() === "exit") {
        console.log("Closing the program...");
        rl.close();

        return;
      }

      const result = await generateText({
        model: google("gemini-3.5-flash-lite"),
        output: Output.object({
          schema: sqlSuggestionSchema,
        }),
        instructions: `
          You are an expert assistant specialized in SQLite. 
            
          You must transform the user's question into a valid SQL query. 
          
          ${SCHEMA_DESCRIPTION}
            
          Generate ONLY a valid SELECT query for SQLite. 
          
          Do not use Markdown blocks or any other type of formatting, including quotes around the whole block. Return ONLY the raw SQL query text.
          
          Write the entire answer in the language in which the question was asked.
          
          Do not use ${BLOCKED_KEYWORDS.join(", ")}.
        `,
        prompt: `User question: ${question}`,
      });

      const { sql, explanation } = result.output;

      validateSqlQuery(sql);

      console.log(`\n Generated SQL: ${sql}`);
      console.log(`\n Explanation: ${explanation}`);

      // rl.question(
      //   "Do you want to execute this SQL query? (y/n): ",

      //   async (answer) => {
      //     if (answer.toLowerCase() === "y") {
      //       try {
      //         const result = database.prepare(sql).all();

      //         console.log("Query approved! SQL query results:");
      //         console.table(result);
      //       } catch (error) {
      //         console.error(
      //           "Error executing the query in the database:",
      //           error,
      //         );
      //       }
      //     } else {
      //       console.log("Query canceled.");
      //     }

      //     generateSqlObject();
      //   },
      // );
    },
  );
}

generateSqlObject();
