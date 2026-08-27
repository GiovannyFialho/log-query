# Log Query

Aplicação de terminal desenvolvida em Node.js para processamento, ingestão e consulta inteligente de arquivos de logs.

O projeto gera logs fictícios de acesso, processa e ingere esses registros em formato JSON Lines utilizando streams para alta performance, armazena os dados em um banco de dados SQLite e utiliza Inteligência Artificial (Google Gemini via AI SDK) para transformar perguntas em linguagem natural em consultas SQL seguras através do terminal.

---

## 🛠️ Tecnologias e Dependências

- **Runtime:** Node.js (v20+ recomendado, com suporte nativo a `--env-file`)
- **Linguagem:** TypeScript
- **Banco de Dados:** SQLite
- **Orquestração de IA:** [Vercel AI SDK](https://ai-sdk.dev/) & `@ai-sdk/google`
- **Validação de dados:** Zod
- **Geração de dados:** [@faker-js/faker](https://fakerjs.dev/)

---

## 🚀 Instalação e Configuração

### 1. Instalar as dependências e configurar o ambiente

Após clonar o projeto, execute:

```bash
npm run setup
```

Esse comando instala todas as dependências do projeto e cria automaticamente o arquivo `.env.local` a partir do `.env.example`.

Depois, abra o arquivo `.env.local` e adicione sua chave de API do Google:

```env
GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_api_aqui
```

> O arquivo `.env.local` é utilizado pelo agente para acessar o modelo do Google Gemini.

---

## 🖥️ Scripts Disponíveis

### `npm run setup`

Instala as dependências do projeto e configura o arquivo `.env.local`.

```bash
npm run setup
```

Esse comando executa a instalação das dependências e, em seguida, utiliza o script `env:setup` para criar o arquivo `.env.local` a partir do `.env.example`.

---

### `npm start`

Inicia a aplicação de terminal e o agente de consultas SQL.

```bash
npm start
```

O agente permite fazer perguntas em linguagem natural, gerar consultas SQL com auxílio da IA, revisar a query antes da execução e visualizar os resultados.

Este é o comando principal para utilizar a aplicação.

---

### `npm run dev`

Inicia a aplicação em modo de desenvolvimento utilizando o `--watch` do Node.js.

```bash
npm run dev
```

Sempre que um arquivo for alterado, a aplicação é reiniciada automaticamente.

Esse comando é útil durante o desenvolvimento e para realizar ajustes no projeto.

---

### `npm run seed`

Gera o arquivo de logs fictícios utilizado pelo projeto.

```bash
npm run seed
```

Os registros são gerados em formato JSON Lines (`.jsonl`) e contêm dados fictícios de acesso, como IP, usuário, empresa, cargo, localização e data de acesso.

---

### `npm run ingest`

Processa o arquivo de logs e insere os registros no banco de dados SQLite.

```bash
npm run ingest
```

A ingestão utiliza streams para processar os registros de forma eficiente, evitando a necessidade de carregar todo o arquivo em memória.

---

### `npm test`

Executa os testes utilizando o test runner nativo do Node.js.

```bash
npm test
```

Os testes utilizam `node:test` e `node:assert`, além do suporte experimental de mocks de módulos nativos do Node.js.

Os testes são executados a partir dos arquivos localizados em:

```text
src/tests/*.test.ts
```

Os testes cobrem principalmente:

- Regras de validação das consultas SQL.
- Consultas realizadas no banco SQLite.
- Contagem de registros.
- Empresas distintas.
- Ordenação dos acessos mais recentes.
- Integração com o modelo de linguagem.
- Comportamentos esperados das queries.

---

### `npm run test:watch`

Executa os testes em modo de observação utilizando o `--watch` do Node.js.

```bash
npm run test:watch
```

Sempre que um arquivo relacionado aos testes for alterado, os testes são executados novamente automaticamente.

Esse comando é útil durante o desenvolvimento e criação de novos testes.

---

### `npm run env:setup`

Cria o arquivo `.env.local` automaticamente a partir do `.env.example`.

```bash
npm run env:setup
```

Esse comando também é executado automaticamente pelo `npm run setup`.

Pode ser utilizado separadamente caso seja necessário recriar o arquivo `.env.local`.

---

## 🔄 Fluxo do Projeto

Depois de clonar o projeto, execute:

```bash
npm run setup
```

Configure a variável `GOOGLE_GENERATIVE_AI_API_KEY` no arquivo `.env.local`.

Em seguida, prepare os dados:

```bash
npm run seed
```

```bash
npm run ingest
```

Depois disso, inicie o agente:

```bash
npm start
```

O fluxo completo fica:

```text
Setup
  ↓
Dependências + .env.local
  ↓
Seed
  ↓
Arquivo JSON Lines
  ↓
Ingest
  ↓
SQLite
  ↓
Start
  ↓
Pergunta em linguagem natural
  ↓
Google Gemini
  ↓
SQL
  ↓
Validação
  ↓
Confirmação do usuário
  ↓
SQLite
  ↓
Resultado
  ↓
Resposta em linguagem natural
```

---

## 🧠 Como Funciona o Agente SQL

Quando você executa:

```bash
npm start
```

o terminal entra em um loop interativo contínuo.

### 1. Pergunta

Você digita o que deseja saber sobre os dados.

Por exemplo:

```text
Quantos usuários únicos acessaram da empresa Google?
```

### 2. Tratamento por IA

O modelo `gemini-3.5-flash-lite` recebe a pergunta e o schema disponível da tabela `access_logs`.

A IA gera uma consulta SQL utilizando apenas operações de leitura.

Além da consulta, o modelo fornece uma explicação sobre o que a query faz.

### 3. Validação

Antes de executar a consulta, o código valida a SQL gerada.

Comandos que podem modificar ou manipular o banco, como `DROP`, `DELETE`, `INSERT`, `UPDATE` e outros comandos bloqueados, são rejeitados.

### 4. Confirmação

A aplicação exibe a SQL gerada e sua explicação e solicita uma confirmação antes de executar a consulta.

```text
Generated SQL:

SELECT COUNT(*) FROM access_logs

Explanation:

Calculates the total number of records in the access_logs table.

Do you want to execute? (y/n):
```

### 5. Execução

Se a consulta for aprovada, ela é executada no SQLite.

Os dados retornados são então enviados novamente ao modelo de linguagem para gerar uma resposta amigável e compreensível.

A resposta é apresentada no mesmo idioma utilizado na pergunta.

### 6. Novo ciclo

Depois de apresentar o resultado, o agente volta a aguardar uma nova pergunta.

Para encerrar a aplicação, pressione `CTRL+C`.

---

## 🔐 Segurança

Como a consulta SQL é gerada por Inteligência Artificial, o projeto possui uma camada de validação antes da execução.

A aplicação:

- Permite apenas consultas de leitura.
- Bloqueia comandos que podem modificar a estrutura ou os dados do banco.
- Valida a SQL gerada antes de enviá-la ao SQLite.
- Solicita confirmação do usuário antes da execução.
- Não executa automaticamente uma query gerada pela IA.

Essa camada existe como parte do projeto de estudo e não deve ser considerada uma solução completa de segurança para aplicações em produção.

---

## 🧪 Testes

Os testes utilizam as ferramentas nativas de testes do Node.js, incluindo:

- `node:test`
- `node:assert`
- `--experimental-test-module-mocks`

Os testes podem ser executados normalmente:

```bash
npm test
```

Ou em modo de desenvolvimento:

```bash
npm run test:watch
```

O suporte a mocks de módulos permite testar a integração com o modelo de linguagem sem realizar chamadas reais à API durante os testes.

---

## 📚 Objetivo do Projeto

Este projeto faz parte dos estudos do curso **Fundamentos do Node.js**, da Rocketseat.

O objetivo principal é praticar conceitos fundamentais do Node.js, incluindo:

- Streams.
- Leitura e escrita de arquivos.
- Processamento de grandes volumes de dados.
- CLI e interação com o terminal.
- SQLite.
- Queries SQL.
- Variáveis de ambiente.
- Testes com ferramentas nativas do Node.js.
- Mocks de módulos.
- Integração com modelos de Inteligência Artificial.
- Validação e processamento de dados com TypeScript e Zod.
