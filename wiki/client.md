# Client

Path: `client/`. Next.js **16.2.12**, React **19.2.4**, Tailwind **4**.

This is not Next 13/14. Before writing Next-specific code, read `client/AGENTS.md` and `node_modules/next/dist/docs/` when needed.

## Scripts

`dev`, `build`, `start`, `lint` (eslint — `next lint` is gone).

## Layout

```
client/
  proxy.ts                 request interceptor (NOT middleware.ts)
  next.config.ts           /api rewrites to Express
  app/                     routes, layout, globals.css
  features/                auth, chat, workspaces, sources, learn, memory
  components/ui/           shadcn / Base UI primitives
  shared/                  api client, providers, hooks
  lib/utils.ts             cn()
```

There is **no** `app/(protected)/layout.tsx`. Workspace chrome is `WorkspaceShell`.

## Feature slice

```
features/<name>/
  index.ts
  components/
  hooks/
  lib/          api.ts, types.ts, routes.ts, constants.ts
  stores/       zustand (chat preferences only)
```

Import from barrels when adding public exports.

## Routes

| URL | Page | Notes |
|---|---|---|
| `/` | Landing | Redirects to dashboard if signed in |
| `/login` | Google login | `unauth()` |
| `/dashboard` | Workspace grid | `requireAuth()` |
| `/workspace/:id` | Chat | `?ask=` auto-sends |
| `/workspace/:id/sources` | Source library | |
| `/workspace/:id/sources/:sourceId` | Source detail | |
| `/workspace/:id/learn` | Learn hub | |
| `/workspace/:id/learn/:artifactId` | Artifact detail | |
| `/workspace/:id/settings` | Workspace settings | |
| `/settings/memory` | Mem0 settings | Proxy + page `requireAuth` |

`params` are Promises:

```ts
const { id } = await params;
```

Every workspace page: `requireAuth()` → `getWorkspaceOrNull(id)` → `notFound()` if missing → `WorkspaceShell`.

## Auth

- Client: `createAuthClient()` in `features/auth/lib/auth-client.ts`. Same-origin `/api/auth/*`.
- Login: `signIn.social({ provider: "google" })`.
- Server session: `getSession()` in `features/auth/lib/auth-server.ts`.
- `requireAuth()` / `unauth()` redirect.

`proxy.ts` exports **`proxy`**, not `middleware`. Matcher: `/dashboard/:path*`, `/workspace/:path*`, `/settings/:path*`, `/login`. Session check hits Express `API_URL` directly. Runs on Node, not Edge. Do not add `middleware.ts`.

## API client

`shared/lib/api.ts` — `apiFetch<T>`, `credentials: "include"`, JSON unless `FormData`. Errors become `ApiError`.

PDF upload uses raw `fetch` + `FormData`.

Rewrites live in `next.config.ts` (`/api/auth`, `/api/workspaces`, `/api/memory`, `/api/inngest`). Browser never targets `:8080` directly. Inngest Dev Server must be able to reach Express; the `/api/inngest` rewrite covers probes against `:3000`.

## State

| Tool | Use |
|---|---|
| TanStack Query | All server data. `*Keys` + hooks. Invalidate on mutation success. |
| Zustand | Only `useChatPreferences` (model + webSearch, persisted) |
| Local React state | Dialogs, conversation id, filters, composer |

Sources/artifacts: `refetchInterval: 3000` while `PENDING` / `PROCESSING`.

Do not retry queries on `ApiError` 404 (`useWorkspace`, `useSource`).

## UI conventions

shadcn style **base-rhea** + **Base UI**. Use `render`, not Radix `asChild`:

```tsx
<Button nativeButton={false} render={<Link href={...} />} />
```

Tailwind v4: `@theme` in `globals.css`, `bg-linear-to-br` (not `bg-gradient-to-br`). No `tailwind.config.js`.

Markdown: `Streamdown` / `StreamdownContent`.

Theme: `next-themes`, class strategy.

## Chat UI notes

- New chat does **not** POST a conversation. First `POST .../chat` creates it.
- `useCreateConversation` is unused for create (only `isPending` exists in UI).
- Citations land after history refetch, not from the live stream.
- `useChat` uses AI SDK `UIMessage` parts; stored messages are `{ role, content, citations }`. Mapping is in `WorkspaceChat`.
- Model picker is in `WorkspaceHeaderActions`, not the composer.

## Dead / unused (do not "fix" unless asked)

- `WorkspaceList` is unused; dashboard uses `DashboardHome`.
- `getSourceChunks` has no UI caller.
- Artifact dialog does not send `sourceIds` (server uses all READY sources).
