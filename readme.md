# Log Query

Aplicação de terminal desenvolvida em Node.js para processamento, ingestão e consulta inteligente de arquivos de logs.

O projeto gera logs fictícios de acesso, processa e ingere esses registros em formato JSON Lines utilizando streams para alta performance, armazena tudo em um banco de dados SQLite e utiliza Inteligência Artificial (Google Gemini via AI SDK) para transformar perguntas em linguagem natural diretamente em consultas SQL seguras através do terminal.

---

## 🛠️ Tecnologias e Dependências

- **Runtime:** Node.js (v20+ recomendado com suporte nativo a `--env-file`)
- **Linguagem:** TypeScript
- **Banco de Dados:** SQLite
- **Orquestração de IA:** [Vercel AI SDK](https://sdk.vercel.ai/) & `@ai-sdk/google`
- **Geração de Dados:** [@faker-js/faker](https://fakerjs.dev/)

---

## 🚀 Instalação e Configuração

1. Instale as dependências do projeto:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env.local` na raiz do projeto com base no arquivo `env.local-example` e adicione a sua chave de API da Google:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_api_aqui
   ```

---

## 🖥️ Scripts Disponíveis e Fluxo de Execução

O projeto possui comandos mapeados no `package.json` para cobrir todo o ciclo de vida dos dados, desde a criação até a consulta. Execute-os na ordem abaixo:

### 1. Criar o Arquivo de Log

Gera um arquivo de logs fictícios estruturados com dados realistas (como IP, usuário, empresa, etc.) usando a biblioteca Faker.

```bash
npm run create-file-log
```

### 2. Ingerir o Arquivo de Log

Lê o arquivo JSON Lines gerado e faz o processamento via streams de forma eficiente, populando o banco de dados SQLite local.

```bash
npm run ingest-file-log
```

### 3. Iniciar o Agente de Consulta (IA)

Inicia a aplicação interativa de terminal. O agente carrega as variáveis de ambiente e aguarda suas perguntas em português para convertê-las em queries SQL automáticas.

```bash
npm run agent
```

---

## 🧠 Como Funciona o Agente SQL

Quando você executa o comando `npm run agent`, o terminal entra em um loop interativo contínuo:

1. **Pergunta:** Você digita o que quer saber (ex: _"Quantos usuários únicos acessaram da empresa Google?"_).
2. **Tratamento por IA:** O modelo `gemini-3.5-flash-lite` interpreta a estrutura da tabela `access_logs` e formula a query SELECT ideal.
3. **Camada de Segurança:** O código valida se a query gerada é estritamente de leitura (bloqueando comandos como `DROP`, `DELETE` ou `INSERT`).
4. **Confirmação:** O sistema exibe o SQL gerado na tela e pergunta se você deseja executá-lo `(s/n)`.
5. **Resultado:** Se aprovado, exibe os dados formatados em formato de tabela (`console.table`) e reinicia o prompt para uma nova pergunta sem derrubar o processo.
6. **Encerramento:** Para sair do loop, basta digitar `sair` a qualquer momento no prompt de perguntas.
