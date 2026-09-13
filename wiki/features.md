# Features

## Sources / ingest

Create path always: insert `PENDING` → `enqueueSourceProcessing` (`source/created`).

| Type | Entry | Content |
|---|---|---|
| TEXT / MARKDOWN | `POST …/sources` | Body |
| PDF | `POST …/sources/upload` | Multer → Cloudinary (`chaibook/pdfs`). Inngest extracts with `unpdf` |
| WEBSITE | `import/website` | Firecrawl markdown |
| WEBSITE | `import/web-search` | Client already has title/content/url (chat “Save to library”) |
| YOUTUBE | `import/youtube` | `youtube-transcript` (watch / youtu.be / embed / shorts) |

Worker (`processSource`): mark processing → extract → delete old chunks → `chunkPages` or `chunkText` → embed batches of 50 → Pinecone upsert batches of 100 → `READY`. Failure stores `metadata.processingError`. If the process is killed mid-run, status stays `PROCESSING` (not `FAILED`); the source detail Reprocess action covers `FAILED`, `PENDING`, and `PROCESSING`.

Chunking (`server/src/lib/chunking.ts`): 1000 / 100. Pages never merge across page boundaries. Overlap is weak except the character fallback.

PDF: MIME `application/pdf` only, 10 MB max.

## Chat / RAG

Core: `streamWorkspaceChat` in `server/src/services/chat.service.ts`.

1. Ownership + model resolve
2. Last user text required
3. Resolve or create conversation
4. Persist USER message
5. Parallel: `retrieveWorkspaceContext` + `searchUserMemories`
6. System prompt: role, optional web-search rules, memories, rolling summary, numbered `[1]` chunks
7. If summary exists and client sent > 12 messages, only last 12 go to the model
8. `streamText` + optional Tavily `web_search` (`stopWhen` 3 steps)
9. Pipe UI message stream; header `X-Conversation-Id`
10. `onFinish`: save ASSISTANT + citations, touch conversation, title if missing, every 8 messages enqueue summarize, fire-and-forget Mem0 `learned`

Retrieval: embed query → Pinecone top 6 → drop score `< 0.35`. Citations `[1]`, `[2]`; web `[W1]`.

Streaming protocol is the **AI SDK UI message stream**, not raw token SSE.

Client: `features/chat/components/workspace-chat.tsx` + `useChat`. After `ready`, invalidate messages so citations persist.

## Memory

`server/src/lib/mem0.ts`. Optional (`MEM0_API_KEY`).

| Path | Behavior |
|---|---|
| Manual CRUD | `/api/memory` |
| Chat retrieve | `searchUserMemories` topK 8, threshold 0.1 |
| Learned | `addMemoriesFromMessages` on chat finish **and** on summarize (last 16 messages) — expect overlap |

`AppMemory.source`: `"manual" | "learned"` from metadata.

UI: `/settings/memory`, linked from dashboard header, not workspace sidebar.

PATCH/DELETE do not verify Mem0 id belongs to the session user.

## Learn / artifacts

Not RAG. Concatenates full READY `source.content`, cap 120k chars.

Create → PENDING → Inngest `artifact/generate` → `generateText` + structured Zod output (SUMMARY is free markdown).

UI viewers in `features/learn/components/viewers/`. Mind map uses `@xyflow/react`. “Ask in chat” navigates to `/workspace/:id?ask=…`.

## Conversation summaries

Every 8 messages: Inngest `conversation/summarize` → `summarizeConversationById`. Stored on `Conversation.summary`. Injected into later system prompts.
