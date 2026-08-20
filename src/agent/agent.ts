import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createInterface } from "node:readline";

import database from "../database/database.ts";
import { isSafeQuery } from "../database/validate-sql.ts";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function startPrompt() {
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
        prompt: `
          You are an expert assistant specialized in SQLite. 
            
          You must transform the user's question into a valid SQL query. 
          
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
            
          Generate ONLY a valid SELECT query for SQLite. 
          
          Do not use Markdown blocks or any other type of formatting, including quotes around the whole block. Return ONLY the raw SQL query text. 
          
          Do not use INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, REPLACE, PRAGMA, ATTACH, DETACH, or VACUUM.
          
          User question: ${question}
        `,
      });

      const sql = result.text
        .replace(/```sql/gi, "")
        .replace(/```/g, "")
        .trim();

      if (!isSafeQuery(sql)) {
        console.log("The generated SQL query is not safe. Please try again.");

        startPrompt();

        return;
      }

      console.log(`\n Generated SQL: ${sql}`);

      rl.question(
        "Do you want to execute this SQL query? (y/n): ",

        async (answer) => {
          if (answer.toLowerCase() === "y") {
            try {
              const result = database.prepare(sql).all();

              console.log("Query approved! SQL query results:");
              console.table(result);
            } catch (error) {
              console.error(
                "Error executing the query in the database:",
                error,
              );
            }
          } else {
            console.log("Query canceled.");
          }

          startPrompt();
        },
      );
    },
  );
}

startPrompt();
