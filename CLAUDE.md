# CLAUDE.md

## Project

Service marketplace built with:

- Next.js 16 (App Router)
- TypeScript
- PostgreSQL
- Prisma
- JWT Authentication
- MinIO
- Firebase Cloud Messaging
- OpenTelemetry

---

## Architecture

```
Route
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma
```

Responsibilities:

- **Routes**: Export HTTP handlers only.
- **Controllers**: Parse requests, validate input, call services, return responses.
- **Services**: Business logic, authorization, transactions.
- **Repositories**: Database access only.
- **Prisma**: Accessed only through repositories.

---

## Repository Rules

Always call `getPrisma()` inside each repository function.

```ts
export async function findUser(id: string) {
    const prisma = getPrisma();

    return prisma.user.findUnique({
        where: { id },
    });
}
```

Never create Prisma at module scope.

---

## Validation

- Validate external input with Zod.
- Validation belongs in controllers.
- Services assume validated input.

---

## Error Handling

Expected failures must throw `AppError` subclasses.

Use:

- ValidationError
- AuthenticationError
- AuthorizationError
- ConflictError
- NotFoundError

Frontend relies on:

- HTTP status
- `ErrorCode`

Never expose internal error messages.

---

## Logging

Use the shared logger.

```ts
logger.info(...)
logger.warn(...)
logger.error(...)
```

Never use `console.log()`.

Never log passwords, tokens, secrets, or OTPs.

---

## Tracing

Wrap major business operations using:

```ts
withSpan(...)
```

Include repository calls and external services.

---

## Coding Conventions

- Use async/await.
- Prefer named exports.
- Use absolute imports (`@/...`).
- Avoid `any`.
- Prefer early returns.
- Keep functions focused.
- Reuse existing code before creating new code.
- Do not duplicate business logic.
- Follow existing formatting.

---

## Dependency Rules

Allowed:

```
Route
↓
Controller
↓
Service
↓
Repository
↓
Prisma
```

Not allowed:

- Controller → Prisma
- Route → Repository
- Repository → Service
- Service → Next.js APIs

---

## AI Instructions

When generating code:

- Preserve the existing architecture.
- Keep changes minimal.
- Reuse repositories and services before creating new ones.
- Place business logic in services.
- Place database queries in repositories.
- Throw `AppError` subclasses for expected failures.
- Use `ErrorCode` constants.
- Use `logger` instead of `console`.
- Instrument major operations with `withSpan()`.
- Do not add dependencies unless requested.