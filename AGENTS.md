# AGENTS.md

This repository is the canonical web template used for Next.js applications.

## Source of truth

Before implementing non-trivial changes, read the relevant sections of `README.md`.

The README defines the project's architecture, folder structure, API layer, domains, authentication, permissions, TanStack Query conventions, forms, UI components, hooks, utilities, and code conventions.

When this file and generic framework conventions conflict, follow this repository's established architecture.

Existing code is also a source of truth. Before creating a new pattern, search for the closest existing implementation.

---

## Core principles

Preserve the architecture defined by this template.

Do not introduce alternative architectural patterns when an established solution already exists.

Prefer:

1. existing project abstractions
2. existing project conventions
3. existing dependencies
4. framework-native solutions

before introducing something new.

Do not perform unrelated refactors while implementing a feature.

---

## Stack

The application uses:

- Next.js with App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui / Radix UI
- TanStack Query
- NextAuth
- React Hook Form
- Zod
- Sonner
- date-fns
- Lucide React

Check `package.json` for exact installed versions before relying on version-specific behavior.

Use `pnpm`.

Do not introduce another package manager.

---

## Project structure

Follow the existing folder structure.

Business entities belong in:

`src/domains/[domain]/`

Route-specific UI belongs near its route under:

`src/app/.../components/`

Reusable components without domain-specific business logic belong in:

`src/components/`

Generic hooks belong in:

`src/hooks/`

Generic utilities belong in:

`src/utils/`

Libraries and infrastructure integrations belong in:

`src/lib/`

Do not create new top-level architectural folders without a clear reason.

---

## Domains

Before creating a new domain, inspect existing domains.

A domain may contain:

- `types.ts`
- `enums.ts`
- `client.ts`
- `server.ts`
- `actions.ts`

Follow existing domain conventions instead of creating repositories, services, API folders, or alternative abstractions without need.

Keep domain-specific types and behavior inside their domain whenever possible.

---

## API communication

Never call the external backend API using raw `fetch` directly from pages or components.

Use:

- `fetchClient` for client-side requests
- `fetchServer` for server-side requests and Server Actions

Keep API functions inside the appropriate domain.

Client-side reads belong in:

`domains/[domain]/client.ts`

Server-side reads belong in:

`domains/[domain]/server.ts`

Mutations belong in:

`domains/[domain]/actions.ts`

Do not create additional HTTP clients unless explicitly required.

---

## Server and Client Components

Prefer Server Components by default.

Add `"use client"` only when client-side behavior is actually required.

Do not convert an entire page to a Client Component only because a small child component requires client behavior.

Keep the client boundary as small as reasonably possible.

Server-side API reads should use the project's server API layer.

Client-side API reads should follow the project's TanStack Query conventions.

---

## Server Actions

Mutations should follow the existing Server Action architecture.

When appropriate:

- create/update/delete functions belong in `domains/[domain]/actions.ts`
- use the existing `useServerAction` abstraction from client components
- reuse the project's API response/error types
- invalidate/refetch queries using the project's TanStack Query utilities

Do not introduce a second mutation pattern without a technical reason.

---

## TanStack Query

Treat TanStack Query as server-state management.

Query keys must use the centralized query-key architecture.

Do not create arbitrary string query keys inside components.

Reuse the existing helpers for:

- query keys
- query refetch/invalidation
- paginated lists

Use `usePaginatedList` when the feature matches its intended pagination behavior.

Do not duplicate server data into local state unnecessarily.

---

## React state

Prefer derived state over duplicated state.

Avoid `useEffect` for state synchronization when the value can be:

- calculated during render
- handled through an event
- obtained from TanStack Query
- handled by React Hook Form
- represented by URL state

Do not introduce global state for local component concerns.

---

## Forms

Forms should use React Hook Form.

Reuse controllers from:

`src/components/form/controllers/`

before creating new form inputs.

Reuse existing form containers when applicable.

Use Zod when schema validation is needed and consistent with the existing feature.

Do not build a parallel form abstraction.

---

## UI

Reuse existing UI components.

Components inside:

`src/components/ui/`

are base shadcn/ui components.

Do not modify base shadcn components directly merely to satisfy one feature.

Prefer composition or wrapper components for application-specific behavior.

Reuse existing design tokens from `globals.css`.

Do not hardcode colors or spacing when an appropriate design token already exists.

Use Lucide for icons unless the project already contains a specific alternative for the required asset.

---

## Permissions

Use the project's permission architecture.

Use:

- `CanServer` in Server Components
- `CanClient` in Client Components

When adding routes/features requiring permissions, inspect the existing permission map and enums.

Do not implement ad-hoc role or permission checks inside UI components when the existing permission system can represent them.

Remember that frontend permission checks are for UI/access behavior and do not replace backend authorization.

---

## Authentication

Use the project's NextAuth abstraction.

For server-side session access, use the internal project wrapper.

Do not import authentication APIs directly from NextAuth when the project provides an abstraction for the same operation.

When changing session/token fields, check the project's NextAuth type augmentation.

---

## Routing

Respect the distinction between:

- `(public)`
- `(private)`

Follow the existing route structure when creating list, detail, create, and update pages.

Before adding authentication routing logic, inspect the existing proxy/middleware implementation.

---

## TypeScript

Use strict TypeScript.

Avoid `any`.

Avoid unsafe type assertions whose only purpose is suppressing TypeScript errors.

Reuse existing domain and API types where possible.

Do not create duplicate representations of the same entity unless they represent meaningfully different concepts.

Keep API input, API output, and UI/form types distinct when their structures actually differ.

---

## Naming

Use English for code identifiers.

Use:

- PascalCase for React components and types
- camelCase for variables and functions
- kebab-case for file names

Follow existing naming conventions before introducing new ones.

Use the `@/` alias for internal absolute imports.

Avoid long relative imports such as:

`../../../`

---

## Dates

Use the project's date utilities before implementing date formatting or timezone handling manually.

Do not fix timezone problems by manually adding or subtracting hours.

Be explicit about whether a value represents:

- an instant
- a date without time
- local time
- UTC

---

## Dependencies

Before installing a dependency:

1. check whether the project already has a solution
2. check whether the browser/platform API can solve it cleanly
3. verify compatibility with the installed stack

Do not add a package for trivial functionality.

Do not replace an existing library simply because another library is more familiar.

---

## Implementation workflow

Before coding:

1. understand the requested behavior
2. inspect relevant files
3. search for the closest existing feature
4. understand the existing pattern
5. implement using that pattern

When implementing CRUD behavior, inspect an existing complete domain and route before creating the new feature.

Prefer:

"Implement this following the existing X implementation"

over designing a new architecture.

---

## Verification

After changing code, run the relevant project checks.

Prefer:

```bash
pnpm lint
pnpm format
```

Run:

```bash
pnpm build
```

when the change affects compilation, routing, configuration, Server Components, Server Actions, or framework boundaries.

Fix issues introduced by your changes.

Do not modify unrelated code merely to eliminate pre-existing warnings.

---

## Git and scope

Never discard unrelated user changes.

Do not reset files outside the requested scope.

Keep the diff focused.

Before finishing, review the diff for:

- accidental modifications
- duplicated logic
- unused imports
- dead code
- debug logs
- temporary code
- unrelated formatting changes

---

## Final response

For non-trivial changes, summarize:

- what changed
- relevant architecture decisions
- validations executed
- any important remaining consideration

Do not provide a line-by-line explanation unless requested.
