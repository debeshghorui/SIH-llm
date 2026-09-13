# API reference

Base: Express `:8080`. Browser reaches it via Next `/api` rewrites.

Auth: better-auth session cookie unless noted. Workspace routes inherit `requireAuth`.

## Infra

| Method | Path | Auth | Notes |
|---|---|---|---|
| ALL | `/api/auth/{*any}` | Public handler | better-auth. Express 5 wildcard. Before JSON parser. |
| GET | `/` | No | `{ message: "Hello from Chaibook API" }` |
| GET | `/health` | No | `{ status: "ok" }` |
| ALL | `/api/inngest` | Inngest signing | Workers |

## Workspaces `/api/workspaces`

| Method | Path | Status | Body / query |
|---|---|---|---|
| GET | `/api/workspaces` | 200 | User’s workspaces, `updatedAt` desc |
| POST | `/api/workspaces` | 201 | `title`, optional `description`, `icon`, `defaultModel` |
| GET | `/api/workspaces/:workspaceId` | 200 / 404 | Owner only |
| PATCH | `/api/workspaces/:workspaceId` | 200 | At least one field |
| DELETE | `/api/workspaces/:workspaceId` | 204 | Best-effort Pinecone `deleteAll`, then DB cascade |

## Sources `/api/workspaces/:workspaceId/sources`

| Method | Path | Status | Notes |
|---|---|---|---|
| GET | `…/sources` | 200 | Query: `q`, `type`, `status` |
| POST | `…/sources` | 201 | `TEXT` or `MARKDOWN` only |
| POST | `…/sources/upload` | 201 | Multipart `file` PDF ≤ 10 MB, optional `title` |
| POST | `…/sources/import/website` | 201 | Firecrawl scrape |
| POST | `…/sources/import/youtube` | 201 | Transcript |
| POST | `…/sources/import/web-search` | 201 | Client-supplied title/content/url as `WEBSITE` |
| POST | `…/sources/bulk-delete` | 204 | `{ sourceIds }` |
| POST | `…/sources/reprocess` | 200 | Requeue FAILED (optional id filter). `{ reprocessed }` |
| GET | `…/sources/:sourceId` | 200 | |
| GET | `…/sources/:sourceId/chunks` | 200 | `{ chunks, count }` |
| POST | `…/sources/:sourceId/reprocess` | 202 | `{ reprocessed: true }` |
| DELETE | `…/sources/:sourceId` | 204 | Pinecone + chunks + row |

All creates enqueue `source/created`.

## Conversations `/api/workspaces/:workspaceId/conversations`

| Method | Path | Status | Notes |
|---|---|---|---|
| GET | `…/conversations` | 200 | Sidebar list |
| POST | `…/conversations` | 201 | Optional `title`. Most chats skip this. |
| GET | `…/conversations/:conversationId/messages` | 200 | role, content, citations |
| DELETE | `…/conversations/:conversationId` | 204 | Cascade messages |

## Chat

| Method | Path | Notes |
|---|---|---|
| POST | `/api/workspaces/:workspaceId/chat` | AI SDK UI message stream |

Body: `messages`, optional `conversationId`, `model`, `webSearch`.

Response header: `X-Conversation-Id` (created on first message if omitted).

Allowed models: `gpt-4o-mini`, `gpt-4o`. Unknown → workspace `defaultModel` → `gpt-4o-mini`.

Web search runs only if `webSearch === true` **and** `TAVILY_API_KEY` is set.

## Artifacts `/api/workspaces/:workspaceId/artifacts`

| Method | Path | Status | Notes |
|---|---|---|---|
| GET | `…/artifacts` | 200 | |
| POST | `…/artifacts` | 201 | Needs READY sources. Enqueues `artifact/generate` |
| GET | `…/artifacts/:artifactId` | 200 | `content` when READY |
| DELETE | `…/artifacts/:artifactId` | 204 | |

Types: `SUMMARY`, `TAKEAWAYS`, `FLASHCARDS`, `QUIZ`, `MINDMAP`, `REPORT`.

## Memory `/api/memory` (user-global)

| Method | Path | Status | Notes |
|---|---|---|---|
| GET | `/api/memory` | 200 | Up to 100. `[]` if no Mem0 key |
| POST | `/api/memory` | 201 | Manual, `infer: false`, `source: "manual"` |
| PATCH | `/api/memory/:memoryId` | 200 | Text only. **No ownership check today** |
| DELETE | `/api/memory/:memoryId` | 204 | **No ownership check today** |

## Error shape

```json
{ "error": "string", "details": {} }
```

Zod → 400 `details` as field errors. Unauthorized → 401 `{ "error": "Unauthorized" }`.
