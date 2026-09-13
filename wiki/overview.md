# Overview

Chaibook is a notebook-style RAG study app: **chat with your books**.

A signed-in user creates a **workspace** (notebook), adds **sources** (PDF, website, YouTube, text, markdown), chats over those sources with citations, stores long-term facts in **Mem0**, and generates **Learn artifacts** (summary, quiz, flashcards, mind map, report).

## Product surfaces

| Surface | What it is |
|---|---|
| Dashboard `/dashboard` | Workspace grid |
| Chat `/workspace/:id` | Streaming RAG chat + citations |
| Sources `/workspace/:id/sources` | Library, add/import, status polling |
| Learn `/workspace/:id/learn` | Background artifact generation |
| Settings `/workspace/:id/settings` | Workspace title, model, delete |
| Memory `/settings/memory` | User-global Mem0 facts |

## Auth

Google OAuth only, via **better-auth**. Session cookies. No email/password provider.

## Split

| App | Role | Stack |
|---|---|---|
| `client/` | UI only. No Next API routes. | Next 16, React 19, Tailwind 4, shadcn Base UI, TanStack Query, Zustand |
| `server/` | REST + AI SDK stream + Inngest workers | Express 5, Prisma 7, OpenAI, Pinecone, Mem0, Firecrawl, Tavily, Cloudinary |

## External services

| Service | Required? | Used for |
|---|---|---|
| PostgreSQL (pgvector image) | Yes | Relational data |
| Google OAuth | Yes | Login |
| OpenAI | Yes | Chat, embeddings, artifacts, summaries |
| Pinecone | Yes (for RAG) | Workspace-namespaced chunk vectors |
| Inngest | Yes (local CLI in dev) | Source ingest, artifacts, conversation summarize |
| Cloudinary | For PDFs | Upload + re-download |
| Firecrawl | For website import | URL → markdown |
| Mem0 | Optional | Long-term user memory |
| Tavily | Optional | Chat web search |

## How to run

```bash
# 1. Postgres
docker compose up -d

# 2. Server (from server/)
cp .env.example .env   # fill keys
npm install
npx prisma migrate dev
npx inngest-cli@latest dev   # separate terminal
npm run dev                  # :8080

# 3. Client (from client/)
npm install
npm run dev                  # :3000
```

Default DB URL: `postgresql://postgres:postgres@localhost:5434/chaibook`.

Env template: `server/.env.example`. Client uses `API_URL` (server-only, default `http://localhost:8080`) and `NEXT_PUBLIC_APP_URL` (default `http://localhost:3000`).
