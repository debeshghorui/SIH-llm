# Chaibook

Chat with your books. Users create workspaces, add sources (PDF, website, YouTube, text), ask questions with citations, keep long-term memory, and generate study artifacts.

This repo is two apps:

- [`client/`](client/) — Next.js 16 UI
- [`server/`](server/) — Express 5 API, Prisma, Inngest, RAG

## Docs for agents

Project context lives in [`wiki/`](wiki/README.md) so new sessions do not start from zero. [`AGENTS.md`](AGENTS.md) is the short entry point.

## Run locally

```bash
docker compose up -d

# server
cd server
cp .env.example .env   # fill API keys
npm install
npx prisma migrate dev
npx inngest-cli@latest dev   # other terminal
npm run dev                  # http://localhost:8080

# client
cd client
npm install
npm run dev                  # http://localhost:3000
```

Postgres is published on **5434**. Default URL: `postgresql://postgres:postgres@localhost:5434/chaibook`.

See [wiki/overview.md](wiki/overview.md) for env vars and services.
