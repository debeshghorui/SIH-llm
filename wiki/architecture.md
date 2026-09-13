# Architecture

```
Browser (:3000)
  └─ Next.js App Router
       ├─ RSC pages (auth + workspace fetch)
       ├─ /api/*  ──rewrite──►  Express (:8080)
       └─ proxy.ts  (session gate for /dashboard, /workspace, /login)

Express
  ├─ /api/auth/*     better-auth (BEFORE express.json)
  ├─ /api/inngest    Inngest serve
  ├─ /api/workspaces CRUD + nested sources / chat / conversations / artifacts
  └─ /api/memory     Mem0 CRUD (user-global)

Inngest workers
  ├─ source/created          extract → chunk → embed → Pinecone
  ├─ artifact/generate       full source text → structured artifact
  └─ conversation/summarize  rolling summary + Mem0 ingest

Stores
  ├─ Postgres        users, workspaces, sources, chunks, chats, artifacts
  ├─ Pinecone        vectors, namespace = workspaceId, id = chunkId
  └─ Mem0            long-term user memories (no Prisma table)
```

## Request paths

**Browser JSON / FormData**

`fetch("/api/...", { credentials: "include" })` → Next rewrite → Express.

**Chat stream**

`DefaultChatTransport` → `POST /api/workspaces/:id/chat` → AI SDK UI message stream. Conversation id comes back on `X-Conversation-Id`.

**RSC session and workspace**

`getSession()` and `getWorkspaceOrNull` both call Express at `API_URL` with forwarded cookies. `proxy.ts` does the same for the session gate. Do not fetch `/api/auth/get-session` through the Next origin from the proxy — that self-request is slow. Browser JSON still uses same-origin `/api` rewrites.

## Ownership

Almost every workspace operation goes through `getWorkspaceByIdForUser`. Missing or other-user ids return **404**, not 403.

Memory is user-scoped (Mem0 `user_id`), not workspace-scoped.

## Layering (server)

```
route → controller (Zod parse) → service → repository | lib
```

- Routes mount paths and `requireAuth`.
- Controllers stay thin.
- Services own orchestration, ownership, Inngest enqueue.
- Repositories are Prisma only.
- `lib/` is SDKs, chunking, prompts, event senders.

## Layering (client)

```
app/ page (auth + compose)
  └─ features/<domain>/  components, hooks, lib, stores
```

Pages stay thin. Feature barrels (`features/*/index.ts`) are the public API.

## Status polling

Sources and artifacts go `PENDING → PROCESSING → READY | FAILED`. The UI polls every **3s** while pending/processing. Do not add a second aggressive refetch loop.

## Key constants

| Constant | Value | Where |
|---|---|---|
| Chat models | `gpt-4o-mini`, `gpt-4o` | `server/src/lib/ai-config.ts` |
| Embeddings | `text-embedding-3-small`, 1536 dims | `server/src/lib/openai.ts` |
| RAG topK / min score | 6 / 0.35 | `server/src/lib/rag/retrieve.ts` |
| Chunk size / overlap | 1000 / 100 | `server/src/lib/chunking.ts` (duplicated, unused copy in `ai-config.ts`) |
| Recent message window | 12 | chat service |
| Summary every N messages | 8 | chat service |
| Artifact context cap | 120_000 chars | artifact generation |
| PDF max | 10 MB | upload middleware |
