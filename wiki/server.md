# Server

Path: `server/`. Package name `server`. ESM (`"type": "module"`). TypeScript `NodeNext`.

## Scripts

| Script | Command |
|---|---|
| `dev` | `prisma generate && tsx watch src/index.ts` |
| `build` | `tsc` |
| `start` | `node dist/index.js` |

## `src/` layout

```
src/
  index.ts                 Express bootstrap
  generated/prisma/        Prisma v7 client (gitignored; prisma generate)
  inngest/                 client + workers
  routes/                  Express routers
  controllers/
  services/
  repositories/
  validators/              Zod 4
  middleware/              requireAuth, errorHandler, multer PDF
  lib/                     SDKs, RAG, events
  types/app-error.ts
  utils/                   asyncHandler, chat-message helpers
```

`.agents/skills/` under `server/` is Prisma agent docs, not runtime.

## Bootstrap order (`src/index.ts`)

Order is load-bearing:

1. CORS (`CLIENT_URL`, `credentials: true`)
2. `app.all("/api/auth/{*any}", toNodeHandler(auth))` — **before** `express.json()`
3. `express.json()`
4. `/api/inngest`
5. `GET /`, `GET /health`
6. `registerRoutes`
7. `errorHandler`

Do not reorder auth vs JSON parser.

## Route mount (`src/routes/index.ts`)

```ts
workspaceRoutes.use("/:workspaceId/sources", sourceRoutes);
workspaceRoutes.use("/:workspaceId/conversations", conversationRoutes);
workspaceRoutes.use("/:workspaceId/chat", chatRoutes);
workspaceRoutes.use("/:workspaceId/artifacts", artifactRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/memory", memoryRoutes);
```

`workspaceRoutes` applies `requireAuth` before nested routers.

## Prisma v7 (hard constraint)

- Generator: `provider = "prisma-client"`, output `src/generated/prisma`
- Datasource URL is in `prisma.config.ts`, **not** `schema.prisma`
- Client must use a driver adapter:

```ts
new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString })) })
```

File: `src/lib/db.ts`. Dev singleton on `globalThis`.

Import Prisma types from `../generated/prisma/client.js`.

Relative imports always use `.js` suffixes.

## Auth

`src/lib/auth.ts` — better-auth + Prisma adapter + Google only.

`requireAuth` (`src/middleware/require-auth.middleware.ts`) uses `auth.api.getSession`. Sets `req.session`.

`BETTER_AUTH_URL` is the **client** origin (`http://localhost:3000`), not `:8080`.

## Errors

`AppError` subclasses → `{ error, details? }`.

`ZodError` → 400 with flattened field errors.

Multer / non-PDF → 400.

Unknown → 500 `"Internal server error"`.

Every route wraps with `asyncHandler`.

## Inngest

App id: `chaibook` (`src/inngest/client.ts`).

| Function | Event | Job |
|---|---|---|
| `processSource` | `source/created` | extract, chunk, embed, index (3 retries) |
| `generateArtifact` | `artifact/generate` | structured Learn content (2 retries) |
| `summarizeConversation` | `conversation/summarize` | rolling summary + Mem0 |

Enqueue via `src/lib/*-events.ts` (`sendInngestEventOrRun`). If the Dev Server is down, jobs run inline so sources and artifacts do not stay PENDING. Local: `INNGEST_DEV=1` and `npx inngest-cli@latest dev`.

`InngestEvents` currently only types `source/created`. Artifact and summarize events are untyped.

## Repositories

Named `find*`, `create*Record`, `update*Record`, `delete*Record`. Explicit `select` objects. No business logic.

## Env

See `server/.env.example`. Do not commit `.env`.
