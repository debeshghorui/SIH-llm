# Chaibook — agent instructions

This repo is a split app: `client/` (Next.js 16) and `server/` (Express 5 + Prisma 7). There is no root package.

## Before you change code

1. Read [wiki/README.md](wiki/README.md).
2. Open only the wiki pages that match the task.
3. After a structural change (routes, models, conventions, env), update the matching wiki page in the same edit.

## Wiki map

| Page | Use when |
|---|---|
| [wiki/overview.md](wiki/overview.md) | Product, run locally, services |
| [wiki/architecture.md](wiki/architecture.md) | How client, API, Inngest, and stores connect |
| [wiki/server.md](wiki/server.md) | Express, Prisma v7, Inngest, layering |
| [wiki/client.md](wiki/client.md) | Next 16, features, proxy, UI kit |
| [wiki/api.md](wiki/api.md) | Endpoints |
| [wiki/data-model.md](wiki/data-model.md) | Prisma + Pinecone + Mem0 |
| [wiki/features.md](wiki/features.md) | RAG, ingest, memory, artifacts |
| [wiki/conventions.md](wiki/conventions.md) | Do / don't / gotchas |

## Hard rules

- Browser talks to `/api/*` (Next rewrite). Do not call `:8080` from client components.
- Prisma v7: generated client + pg adapter. URL is in `server/prisma.config.ts`.
- Next 16: `proxy.ts` not `middleware.ts`. Await `params`.
- Auth is Google via better-auth. Mount stays **before** `express.json()`.
- Memory is Mem0. Do not add a `UserMemory` table.
- shadcn is Base UI: `render`, not `asChild`.
- Next.js docs for this version live under `client/node_modules/next/dist/docs/` — do not assume Next 13/14 APIs.
