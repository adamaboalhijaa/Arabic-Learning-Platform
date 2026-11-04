# أكاديمية التفوق

Arabic-first learning platform for Jordanian students, with lesson-specific quizzes, saved progress, and verified curriculum content.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the shared API server
- `pnpm --filter @workspace/tafaweq-learning run dev` — run the web app through its managed workflow
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/tafaweq-learning run build` — build the web app; artifact workflows provide `PORT` and `BASE_PATH`
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Artifact-managed workflows provide `PORT`, `BASE_PATH`, and the managed database connection.
- `INITIAL_ADMIN_EMAIL` identifies the verified Clerk account that receives the initial admin role.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web: React 19 + Vite, Wouter, TanStack Query, Clerk
- API: Express 5 + Clerk middleware
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: Vite for the web app, esbuild for the API

## Where things live

- `lib/api-spec/openapi.yaml` is the source of truth for API contracts.
- `lib/db/src/schema/` contains the curriculum, student, quiz-attempt, and achievement tables.
- `artifacts/api-server/src/routes/` contains public curriculum, student, and admin endpoints.
- `artifacts/tafaweq-learning/src/App.tsx` contains the Arabic RTL web experience; `src/index.css` holds its visual system.

## Architecture decisions

- Curriculum records start as drafts. Lessons and questions need source references before they can be marked verified.
- A lesson cannot be verified until it has at least one sourced, verified question; verified lesson quizzes cannot be edited until the lesson is returned to draft.
- Quiz answer keys are private until submission, and submissions are scored on the server against questions belonging to that lesson.
- Student roles come from Clerk sessions and database records; admin authorization is enforced by API middleware.
- XP is awarded per correct answer, with a one-time bonus for a passing lesson. Completion requires at least 70%.

## Product

- Students can browse grade → subject → unit → lesson, review objectives and explanations, take lesson-specific quizzes, and track XP, levels, streaks, progress, leaderboard position, and earned badges.
- Admins can manage curriculum records, question banks, and student access.
- No curriculum content is seeded. Content must be entered with a source and verified by an authorized admin before it is presented as verified.

## User preferences

- Keep the experience Arabic-first and RTL.
- Never present invented or unverified curriculum content as official Jordanian curriculum.

## Gotchas

- Run API codegen after changing `lib/api-spec/openapi.yaml`.
- Push DB changes only to the development database using the DB package command above; production schema changes require a separate migration plan.
- React and ReactDOM are pinned locally at 19.1.4 for Clerk peer compatibility. Do not change the workspace-wide React catalog, which is intentionally pinned for other artifacts.
- Vite's generated `.vite` dependency cache can retain an older ReactDOM version after changing React versions; clear that cache and restart the web workflow if a mismatch overlay appears.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
