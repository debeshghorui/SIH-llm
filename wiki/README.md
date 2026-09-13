# Chaibook wiki

Persistent project context for humans and agents. Read this index first, then only the pages that match the task.

When you change architecture, APIs, data models, or conventions, **update the matching wiki page in the same change**.

## Start here

| Task | Read |
|---|---|
| Any new session | [overview](overview.md) |
| Cross-cutting change | [architecture](architecture.md) |
| Backend / Prisma / Inngest / RAG | [server](server.md), [api](api.md), [data-model](data-model.md) |
| Next.js UI / features | [client](client.md) |
| Chat, sources, memory, Learn | [features](features.md) |
| How to write code here | [conventions](conventions.md) |

## Repo map

```
chaibook-llm-master/
  client/     Next.js 16 app (UI)
  server/     Express 5 API (auth, RAG, jobs)
  wiki/       This knowledge base
  docker-compose.yml   Postgres + pgvector on :5434
```

There is no root `package.json`. Run `client` and `server` as separate apps.

## Local ports

| Service | Port |
|---|---|
| Client | `3000` |
| API | `8080` |
| Postgres | `5434` (host) → `5432` (container) |
| Inngest Dev Server | `8288` (typical) |

## Agent rules

- Do not invent endpoints, models, or env vars. Check [api](api.md) and [data-model](data-model.md).
- Client never calls `:8080` from the browser. It uses same-origin `/api/*` rewrites.
- Prisma is **v7** (generated client + pg driver adapter). Do not write v6-style Prisma.
- Next.js is **16**. Use `proxy.ts`, not `middleware.ts`. `params` are Promises.
- Memory lives in **Mem0**, not Postgres. Do not add a `UserMemory` table.
