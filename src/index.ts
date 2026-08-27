import { createInterface } from "node:readline";
import { styleText } from "node:util";

import {
  generateSqlObject,
  generateTextAnswer,
  type SqlRow,
} from "./agent/index.ts";
import { DB_NAME } from "./constants.ts";
import { createDb } from "./database/database.ts";

const db = createDb(`./src/database/${DB_NAME}`);
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

function prompt(text: string): Promise<string> {
  return new Promise((resolve) => rl.question(text, resolve));
}

rl.on("close", () => {
  db.close();
  console.log(styleText("gray", "\n\nClosing the agent. See you soon! 👋🏻"));

  process.exit(0);
});

console.log(
  styleText(
    ["bold", "cyan"],
    "🙋🏻‍♂️ Welcome to SQL Terminal Agent! Press CTRL+C to exit",
  ),
);

while (true) {
  const question = await prompt(styleText(["bold", "magenta"], "Question: "));

  if (!question.trim()) continue;

  try {
    const { sql, explanation } = await generateSqlObject(question);

    console.log(styleText("cyan", "\n 👨🏻‍💻 Generated SQL:"));
    console.log(styleText("red", sql));

    console.log(styleText("cyan", "\n 📚 Explanation:"));
    console.log(styleText("yellow", explanation));

    const confirm = await prompt(
      styleText(["bold", "green"], "\n ⚠️  Do you wish to execute? (y/n): "),
    );

    if (confirm.toLowerCase() === "y") {
      const result: SqlRow[] = db
        .prepare(sql)
        .all()
        .map((row) => ({ ...row }));

      const answer = await generateTextAnswer({
        question,
        sql,
        rows: result,
      });

      console.log(styleText("green", "\n 🎲 Result: "));
      console.log(answer);
    } else {
      console.log(styleText("yellow", "🚫 SQL execution canceled."));
    }
  } catch (error) {
    console.error(
      styleText("red", "❌ An error occurred while processing the request."),
      error,
    );
  }
}
