# Data model

Schema: `server/prisma/schema.prisma`.  
URL: `server/prisma.config.ts` (`DATABASE_URL`).  
Client: generated to `server/src/generated/prisma` (gitignored).

## Graph

```
User 1──* Workspace
Workspace 1──* Source 1──* SourceChunk
Workspace 1──* Conversation 1──* Message
Workspace 1──* LearningArtifact
```

Auth tables (`user`, `session`, `account`, `verification`) are better-auth. Google only in this app.

There is **no UserMemory table**. Migration `20260730121000_remove_user_memory` moved memory to Mem0. Do not reintroduce it.

## Workspace

| Field | Notes |
|---|---|
| `id` | cuid |
| `userId` | owner |
| `title` | |
| `description?` | |
| `icon?` | emoji |
| `defaultModel` | default `"gpt-4o-mini"` |

Cascade deletes sources, conversations, artifacts. Delete also best-effort clears Pinecone namespace `workspaceId`.

## Source

Enums: `PDF | WEBSITE | YOUTUBE | TEXT | MARKDOWN`  
Status: `PENDING | PROCESSING | READY | FAILED`

| Field | Notes |
|---|---|
| `content?` | extracted / pasted text |
| `url?` | website, youtube, cloudinary file |
| `metadata` | Json: Cloudinary, pageCount, processingError, chunkCount, indexedAt, videoId |

## SourceChunk

Unique `(sourceId, index)`. `metadata.page` is 1-based when chunked from PDF pages. Pinecone vector id = chunk id.

## Conversation

`title?`, rolling `summary?`, `summaryMessageCount`, `summarizedAt?`.

## Message

`role`: `USER | ASSISTANT`. `citations` Json (RAG chunks and optional `WEB` Tavily cites).

## LearningArtifact

Types: `SUMMARY | TAKEAWAYS | FLASHCARDS | QUIZ | MINDMAP | REPORT`  
Status: same as sources.

`sourceIds` is `String[]` (not a foreign key). `content` Json:

| Type | Shape |
|---|---|
| SUMMARY | `{ markdown }` |
| TAKEAWAYS | `{ items: string[] }` |
| FLASHCARDS | `{ cards: { front, back }[] }` |
| QUIZ | `{ questions: { question, options, correctIndex, explanation }[] }` |
| MINDMAP | `{ nodes, edges }` |
| REPORT | `{ markdown, sections: { title, content }[] }` |

## Vectors (Pinecone)

- Index: `PINECONE_INDEX` or `chaibook`
- Auto-create / embeddings: 512 dims (must match the live `PINECONE_INDEX`; `sih-llm` is 512, not 1536)
- Namespace = `workspaceId`
- Metadata: workspaceId, sourceId, chunkId, chunkIndex, sourceTitle, sourceType, text (capped 35_000), optional page
