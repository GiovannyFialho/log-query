import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createInterface } from "node:readline";

import database from "../database/database.ts";
import { isSafeQuery } from "../database/validate-sql.ts";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function iniciarPrompt() {
  rl.question(
    "\nDigite sua pergunta (ou 'sair' para encerrar): ",

    async (question) => {
      if (question.toLowerCase().trim() === "sair") {
        console.log("Encerrando o programa...");
        rl.close();

        return;
      }

      const result = await generateText({
        model: google("gemini-3.5-flash-lite"),
        prompt: `
        Você é um assistente especializado em SQLite. 
        
        Você precisa transformar a pergunta do usuário em uma consulta SQL. 
        
        A tabela disponível no banco é: 
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
          
        Gere apenas uma consulta SELECT válida para SQLite. 
        
        Não use blocos Markdown ou qualquer outro tipo de formatação, inclusive usando aspas. 
        
        Retorne somente a consulta SQL em texto puro. 
        
        Não use INSERT, UPDATE,  DELETE, 
        DROP, ALTER, CREATE, REPLACE, PRAGMA, 
        ATTACH, DETACH ou VACUUM.
        
        Pergunta do usuário: ${question}
      `,
      });

      const sql = result.text
        .replace(/```sql/gi, "")
        .replace(/```/g, "")
        .trim();

      if (!isSafeQuery(sql)) {
        console.log(
          "A consulta SQL gerada não é segura. Por favor, tente novamente.",
        );

        iniciarPrompt();

        return;
      }

      console.log(`\nSQL Gerada: ${sql}`);

      rl.question("Deseja executar a consulta SQL? (s/n): ", async (answer) => {
        if (answer.toLowerCase() === "s") {
          try {
            console.log("Consulta aprovada!");
            const result = database.prepare(sql).all();
            console.log("Resultado da consulta SQL:");
            console.table(result);
          } catch (error) {
            console.error("Erro ao executar a consulta no banco:", error);
          }
        } else {
          console.log("Consulta cancelada.");
        }

        iniciarPrompt();
      });
    },
  );
}

iniciarPrompt();
