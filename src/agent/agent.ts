import { createInterface } from "node:readline";

import { getTotalAccessLogs } from "../database/queries.ts";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Faça uma pergunta: ", (question) => {
  console.log(`Você perguntou: ${question}`);

  const result = getTotalAccessLogs();
  console.log(result?.total);

  rl.close();
});
