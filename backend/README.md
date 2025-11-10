# Backend (Auth Focus)

This backend is an Express + TypeScript scaffold focusing on authentication. The frontend isn't wired yet; endpoints are ready for later integration.

## Tech
- Express
- TypeScript
- Zod (validation)
- bcryptjs (password hashing)
- JSON Web Tokens

## Endpoints
| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | /health | Health check |
| POST | /auth/register | Register with email or username + password |
| POST | /auth/login | Login with email or username + password |
| GET | /auth/google | Placeholder (501) OAuth start |
| GET | /auth/google/callback | Placeholder (501) OAuth callback |

## Request Shapes
Register:
```jsonc
{
  "identifierType": "email" | "username",
  "identifier": "you@example.com" | "johndoe",
  "password": "AtLeast8Chars"
}
```

Login:
```jsonc
{
  "identifier": "you@example.com" | "johndoe",
  "password": "AtLeast8Chars"
}
```

Response (register/login):
```jsonc
{
  "user": { "id": "uuid", "provider": "local", "email": "...", "username": "..." },
  "token": "<jwt>"
}
```

## Environment
Copy `.env.example` to `.env` and adjust:
```
PORT=4000
NODE_ENV=development
JWT_SECRET=change_me
```

## Scripts
```bash
pnpm dev       # start dev server (tsx watch)
pnpm typecheck # run TypeScript without emitting
pnpm build     # build to dist
pnpm start     # run built server
```

## Google OAuth (Planned)
When implementing Google OAuth, create users with:
- provider = 'google'
- providerId = Google profile `sub`
- email (verified one)
- passwordHash omitted

Local login must reject accounts where `provider !== 'local'` or `passwordHash` is missing.

## Next Steps
1. Replace in-memory repo with a real database (PostgreSQL, Prisma, etc.).
2. Implement refresh tokens & logout.
3. Add rate limiting.
4. Integrate Google OAuth using passport or custom implementation.
