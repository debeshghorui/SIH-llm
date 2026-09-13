# Conventions and gotchas

Follow these when writing code. Update this page if a convention changes.

## Do

- Match existing layering. New server endpoint = validator + route + controller + service + repository if it touches Prisma.
- Use `asyncHandler` on every Express handler.
- Use `getWorkspaceByIdForUser` for workspace ownership (404, not 403).
- Client: feature-sliced files, TanStack Query for server state, barrels for public exports.
- Use Base UI `render` + `nativeButton={false}` on `Link`.
- Await `params` / `headers()` / `cookies()` in Next 16.
- Keep source/artifact polling at 3s; reuse existing hooks.
- After a structural change, update `wiki/`.

## Don't

- Do not add `middleware.ts` in the client. Use `proxy.ts`.
- Do not call Express `:8080` from browser code.
- Do not write Prisma v6 (`prisma-client-js`, URL in schema, no adapter).
- Do not use CJS `require` or omit `.js` in server relative imports.
- Do not move better-auth behind `express.json()`.
- Do not add a Postgres memory table.
- Do not use Radix `asChild` or Tailwind `bg-gradient-to-*`.
- Do not invent chat models outside `gpt-4o-mini` / `gpt-4o` without updating `CHAT_MODELS` and the UI picker.

## Server gotchas

1. Express 5 auth path is `/api/auth/{*any}`, not `*`.
2. `ai-config` chunk constants are unused; real chunking is in `chunking.ts`.
3. Pinecone first use may auto-create an AWS `us-east-1` index. Embedding dims in `ai-config.ts` must match the existing index (live `sih-llm` is 512; upserting 1536 vectors fails).
4. Workspace delete continues if Pinecone `deleteAll` fails. Source reprocess also ignores Pinecone 404 / empty namespace on `deleteSourceVectors` so enqueue still runs.
5. Cloudinary preset falls back to a hardcoded default if env is missing.
6. Artifact jobs use full source text, not Pinecone chunks.
7. No automated tests in this tree. Behavior is defined by services + Inngest steps.
8. If Inngest Dev Server is down, `sendInngestEventOrRun` runs source/artifact/summarize jobs inline.
9. Insert source chunks with batched `createMany` (not a sequential `$transaction` of creates). Neon times out the default 5s interactive transaction on large PDFs.
10. A killed ingest job can leave `PROCESSING` forever. Source detail Reprocess includes that status. Pinecone vectors live in namespace = workspace id on index `sih-llm`, not the default namespace.

## Client gotchas

1. `/settings` (including memory) is in the `proxy.ts` matcher and `isProtectedRoute`.
2. RSC session and workspace fetches both go to `API_URL` (`shared/lib/server-api.ts`). Do not fetch `/api/auth/get-session` through the Next origin from `proxy.ts` — that self-request is slow.
3. Conversations are created by the chat stream, not `createConversation`.
4. Citations are not on the live stream; they appear after message refetch.
5. Mind map `ReactFlow` is hardcoded `colorMode="dark"`.

## File index

| Concern | File |
|---|---|
| Server bootstrap | `server/src/index.ts` |
| Route mount | `server/src/routes/index.ts` |
| Auth | `server/src/lib/auth.ts` |
| Prisma client | `server/src/lib/db.ts` |
| Chat | `server/src/services/chat.service.ts` |
| RAG | `server/src/lib/rag/retrieve.ts` |
| Ingest worker | `server/src/inngest/index.ts` |
| Chunking | `server/src/lib/chunking.ts` |
| Pinecone | `server/src/lib/pinecone.ts` |
| Mem0 | `server/src/lib/mem0.ts` |
| Rewrites | `client/next.config.ts` |
| Proxy | `client/proxy.ts` |
| API fetch | `client/shared/lib/api.ts` |
| Chat UI | `client/features/chat/components/workspace-chat.tsx` |
| Shell | `client/features/workspaces/components/workspace-shell.tsx` |
