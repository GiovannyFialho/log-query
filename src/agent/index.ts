import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import type { SQLOutputValue } from "node:sqlite";
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

export async function generateSqlObject(question: string) {
  const result = await generateText({
    model: google("gemini-3.5-flash-lite"),
    output: Output.object({
      schema: sqlSuggestionSchema,
    }),
    instructions: `
      You are an expert assistant specialized in SQLite.

      Your task is to transform the user's question into a valid SQL query.

      ${SCHEMA_DESCRIPTION}

      Generate only a valid SELECT query for SQLite.

      Do not use Markdown blocks or any other formatting.

      The "sql" field must contain only the raw SQL query.

      The "explanation" field must explain what the SQL query does in the same language as the user's question.

      Do not use ${BLOCKED_KEYWORDS.join(", ")}.
    `,
    prompt: `User question: ${question}`,
  });

  const { sql, explanation } = result.output;

  validateSqlQuery(sql);

  return { sql, explanation };
}

export type SqlRow = Record<string, SQLOutputValue>;

type GenerateTextAnswerParams = {
  question: string;
  sql: string;
  rows: SqlRow[];
};

export async function generateTextAnswer({
  question,
  sql,
  rows,
}: GenerateTextAnswerParams) {
  const result = await generateText({
    model: google("gemini-3.5-flash-lite"),
    instructions: `
      The final answer must be written in the same language as the user's question.

      Use only the response data to answer the user's question. Never invent, assume, or modify information.

      Present the information in a clear, natural, friendly, and human-readable way. The answer should be easy to understand for a person without technical knowledge.

      Whenever appropriate, format and translate technical or machine-readable data into a more natural and understandable representation, while preserving the original meaning and accuracy of the data.

      Adapt dates, times, numbers, names, field values, and other data to the conventions and language of the user's question whenever appropriate.

      Do not expose raw JSON, database field names, SQL queries, or other technical details unless the user explicitly asks for them.

      If the response contains no data, clearly and naturally inform the user that no results were found.

      Keep the answer concise, relevant, and focused on the user's question.
    `,
    prompt: `
      Original question: ${question}

      SQL executed: ${sql}

      Response in JSON: ${JSON.stringify(rows, null, 2)}

      Answer:
    `,
  });

  return result.text;
}
