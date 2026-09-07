# Pustaka.id — Secure Book Management System

Aplikasi full-stack manajemen perpustakaan berbasis **Next.js 16 + TypeScript** dengan fokus pada **authentication, authorization (RBAC), session management, dan security fundamentals** — bukan sekadar CRUD. Dirancang sebagai portfolio modular monolith yang mensimulasikan aplikasi internal dengan multi-role, permission, audit logging, dan soft delete.

---

## Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Arsitektur](#arsitektur)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [Authorization Flow](#authorization-flow)
- [Security Features](#security-features)
- [Instalasi](#instalasi)
- [Environment Variables](#environment-variables)
- [Database Migration & Seed](#database-migration--seed)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Testing](#testing)
- [Struktur Proyek](#struktur-proyek)
- [Keputusan Arsitektur](#keputusan-arsitektur)
- [Keputusan Keamanan](#keputusan-keamanan)

---

## Fitur

### Core

- **Auth**: Register, Login, Logout (current + all sessions), Forgot/Reset Password
- **Session**: Daftar sesi aktif (device, IP, created/expires, current indicator), revoke spesifik & semua
- **Profile**: Lihat & ubah nama (hanya milik sendiri), Change Password (verify current, revoke sesi lain)
- **Book**: CRUD, soft delete (`deleted_at`), restore, search (title/ISBN/author), filter (category/author/year/status), sort (newest/oldest/title A-Z/Z-A), pagination DB-side, ISBN unique jika diisi
- **Author**: CRUD, search, sort, pagination
- **Category**: CRUD, search, unique name
- **User**: List pagination + search + filter role, update role (user.manage)
- **Role & Permission**: Role CRUD + assign permissions, Permission CRUD
- **Audit Log**: Semua event penting tercatat, viewer dengan filter (action/user/resource/search) + pagination, permission `audit.read`, immutable
- **Dashboard**: Stat buku/penulis/kategori/user + buku terbaru

### UI

- Landing (beranda), Login, Register, Dashboard (sidebar collapsible, topbar, stat grid) — konsisten dengan `docs/reference_ui/`
- Loading states (`useTransition` pending + disabled), error states (fieldError, serverError generic), empty states

---

## Tech Stack

| Layer      | Teknologi                                                                             |
| ---------- | ------------------------------------------------------------------------------------- |
| Framework  | Next.js 16.3.4 (App Router, Turbopack), React 19.2.8                                  |
| Bahasa     | TypeScript 5 (strict)                                                                 |
| Styling    | Tailwind CSS 4.3.3, Plus Jakarta Sans (`next/font`)                                   |
| Database   | PostgreSQL 18, Drizzle ORM 0.45.2, driver `postgres` 3.4.9, `drizzle-kit` 0.31.10     |
| Validasi   | Zod 4.5.4 + `@t3-oss/env-nextjs` 0.13.11                                              |
| Auth       | `argon2` 0.45.1 (Argon2id), `jose` 6.2.12 (JWT HS256), `postgres` session hash SHA256 |
| Rate Limit | `@upstash/ratelimit` 2.0.8 + `@upstash/redis` 1.38.4 (fallback in-memory)             |
| Testing    | Vitest 5.0 + Vite 8, Playwright 1.x                                                   |
| Lint       | ESLint 9 + `eslint-config-next`                                                       |

---

## Arsitektur

**Modular Monolith** — satu Next.js app, tapi domain dipisah dengan boundary jelas (anti `page.tsx` god object).

```
src/
├── app/
│   ├── page.tsx                 # Beranda (landing)
│   ├── (auth)/login,register    # Auth pages (client forms + server actions)
│   ├── dashboard/               # Dashboard + shell (sidebar/topbar)
│   ├── books, authors, categories, users, audit-logs, profile, sessions
│   ├── error.tsx, global-error.tsx
│   └── proxy.ts                 # Auth proxy (Next 16) — redirect protected/public
├── modules/
│   ├── auth/services/           # password, jwt, session, cookie, current-user, require-auth
│   ├── auth/actions/            # register, login, logout, sessions, password-reset
│   ├── books/repositories,services,actions
│   ├── authors, categories, users, roles, permissions, audit
│   └── .../README.md            # module convention
├── shared/
│   ├── database/connection, schema/ (9 tables), seed.ts
│   ├── validation/ (auth, book, author, category, query, helpers)
│   ├── errors/app-error.ts      # AppError + toErrorResponse (sanitasi)
│   ├── constants/ (roles, permissions, app)
│   ├── utils/ (pagination, response, hash, audit-meta)
│   ├── ratelimit/limiter.ts
│   └── proxy.ts / middleware
└── types/common.ts
```

**Layer**:

```
UI (React) → Server Action / Route Handler → Service (business + authz + audit) → Repository (Drizzle) → PostgreSQL
```

Cross-cutting: Validation (Zod) → Auth → Authorization (`can()`) → Service → DB → Audit.

Prinsip: `Simple → Readable → Maintainable → Testable → Scalable when needed`, SOLID pragmatis, composition over inheritance, no `any` tanpa alasan.

---

## Database Schema

ERD (simplified):

```
roles 1──∞ users
roles ∞──∞ permissions (via role_permissions)
authors 1──∞ books
categories 1──∞ books
users 1──∞ sessions
users 1──∞ audit_logs
users 1──∞ password_reset_tokens
```

Tabel (PK `BIGINT GENERATED BY DEFAULT AS IDENTITY`, bukan UUID):

- `roles(id, name unique, description, created_at, updated_at)`, index `name`
- `permissions(id, name unique, description, created_at, updated_at)`, index `name`
- `role_permissions(role_id FK cascade, permission_id FK cascade, PK composite)`
- `users(id, name, email unique, password_hash, role_id FK restrict, email_verified_at, created_at, updated_at)`, indexes `email, role_id`
- `authors(id, name, biography, created_at, updated_at)`, index `name`
- `categories(id, name unique, description, created_at, updated_at)`, index `name`
- `books(id, title, isbn unique nullable, description, published_year, author_id FK restrict, category_id FK restrict, created_at, updated_at, deleted_at)`, indexes `title, isbn, author_id, category_id, published_year, deleted_at`
- `sessions(id, user_id FK cascade, token_hash, user_agent, ip_address, expires_at, created_at, updated_at)`, indexes `user_id, token_hash, expires_at`
- `audit_logs(id, user_id FK set null, action, resource, resource_id, metadata jsonb, ip_address, user_agent, created_at)`, indexes `user_id, action, resource, created_at`
- `password_reset_tokens(id, user_id FK cascade, token_hash unique, expires_at, used_at, created_at)`, indexes `user_id, token_hash, expires_at`

Constraints menjaga integritas DB sebagai lapisan kedua setelah validasi app.

---

## Authentication Flow

```
Register: Validate (Zod) → Check email unik → Hash Argon2id → Assign role USER → Insert users → Audit USER_REGISTERED → success (tidak auto-login)
Login: Validate → Find user by email → Verify Argon2id (timing-safe, generic "Email atau password tidak valid") → Fetch role → Create session (token_hash = sha256(refreshToken), expires 7d, userAgent/ip) → Generate JWT access (15m, sub=email/role) + refresh (7d, jti=sessionId, sha256) → Set HttpOnly Secure SameSite cookies → Audit USER_LOGIN → return user
Logout: Hash refreshToken → DELETE sessions WHERE tokenHash → clear cookies → Audit USER_LOGOUT
Session: getCurrentUserId() → verifyAccessToken(JWT_SECRET) → check users exists → return AuthUser
Middleware: proxy.ts cek auth_token via jose jwtVerify, redirect /dashboard,/books,... → /login?next=, /login,/register jika sudah auth → /dashboard
Guard: requireAuth() + requirePermission() di setiap Server Action sebelum business logic (middleware bukan satu-satunya layer)
```

JWT: `iat, exp, sub (userId), email, role, roleId` — tidak ada password/hash. Secret dari `env`, `exp` terbatas.

Cookie: `auth_token` (15m) + `refresh_token` (7d), `httpOnly:true, secure:production, sameSite:lax, path:/`.

---

## Authorization Flow

**RBAC** 3 role, 17 permissions:

- `ADMIN`: semua (`book.*, author.*, category.*, user.read/manage, role.manage, permission.manage, audit.read`)
- `STAFF`: `book.*, author.*, category.*`
- `USER`: `book.read` saja

**Mekanisme**:

```ts
// Jangan if (user.role === "ADMIN") di seluruh app
// Gunakan:
await requireAuth(); // 401 jika tidak ada token/user
await requirePermission(user, "book.create"); // 403 jika tidak punya
await requireOwnership(currentUser, ownerId); // resource-level: Authenticated != Authorized
// Helper reusable:
can(user, "book.create"); // → hasPermission(userId) via join users→role_permissions→permissions
requirePermissionGuard(permission); // → requireAuth + requirePermission
```

**Resource-level** untuk `profile, sessions, user detail`: cek `currentUser.id === resourceOwnerId` sebelum allow, cegah ganti ID di URL.

**User Management guards** (`src/modules/users/services/user.service.ts`):

- `user.read` untuk list, `user.manage` untuk update role
- Cegah `admin terakhir` (countAdmins ≤1 → conflict)
- Cegah `self-change` (currentUser.id === target → 403)
- Cegah `privilege escalation` (non-ADMIN assign ADMIN → 403)

---

## Security Features

- **Password**: Argon2id (`argon2` hash, verify, salt unik, tidak plaintext, tidak di log/response)
- **JWT**: HS256 via `jose`, `exp` 15m/7d, `iat`, tidak ada sensitive data, secret dari env
- **Cookie**: `HttpOnly, Secure (prod), SameSite=lax` — kurangi XSS/CSRF
- **Session**: `token_hash` SHA256 di DB (bukan plaintext), `expires_at`, userAgent/ip, revoke spesifik (`tokenHash`), revoke all, `getActiveSessions` filter `expiresAt > now`
- **Validation**: Semua mutation `parseOrThrow(Zod)` server-side, frontend hanya UX — `email, password min 8, book title/isbn, category/author` dll
- **Rate Limit**: `login 5/15m, register 5/1h, forgot 3/1h, reset 5/1h` via `@upstash/ratelimit` slidingWindow (Redis) + in-memory fallback, `429 RATE_LIMITED` generic, logic terpisah `src/shared/ratelimit`
- **Headers**: `next.config.ts` → `X-Content-Type-Options nosniff, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy camera/mic/geolocation=(), CSP (allow self + unsafe-inline/eval untuk Next, fonts googleapis/gstatic)`
- **Error**: `AppError` 7 codes + `toErrorResponse` generic `Terjadi kesalahan pada server.` untuk unknown, sanitasi `password/token/secret → [REDACTED]`, `23505 → CONFLICT Data sudah terdaftar`, `ZodError → VALIDATION_ERROR`, log server saja, `error.tsx` generic UI
- **Soft Delete**: `books.deleted_at` — query default `isNull(deletedAt)`, restore `deletedAt=null`, audit `BOOK_DELETED/RESTORED`
- **Audit Logging**: `logAuditEvent()` insert `audit_logs` (userId/action/resource/resourceId/metadata/ip/ua), dipakai di auth/book/user/role/permission/author/category/session/password, viewer `audit.read` dengan filter/pagination, immutable (no update/delete)

---

## Instalasi

**Prasyarat**: Node 20+, PostgreSQL 14+ (atau Docker), npm.

```bash
git clone <repo>
cd nextbook-management
npm install
# atau jika peer conflict:
npm install --legacy-peer-deps
```

---

## Environment Variables

Buat `.env` dari `.env.example`:

```bash
cp .env.example .env
```

Isi `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nextbook
JWT_SECRET=dev-jwt-secret-min-32-characters-long-change-in-production
JWT_REFRESH_SECRET=dev-jwt-refresh-secret-min-32-chars-long-change-prod
APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@pustaka.id
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Administrator
# Opsional (untuk rate limit multi-instance)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

- `.env` sudah di `.gitignore`, `.env.example` tanpa secret asli.
- Validasi via `@t3-oss/env-nextjs` di `src/env.ts` (`zod` min 32 char untuk JWT, url untuk APP_URL) — fail-fast saat boot (`import "./src/env.ts"` di `next.config.ts`).

---

## Database Migration & Seed

```bash
# Generate migration dari schema (jika ada perubahan schema)
npm run db:generate

# Push schema ke DB (untuk dev, tanpa migration file)
npm run db:push

# Atau migrate via file (untuk prod)
npm run db:migrate

# Seed roles, permissions, role_permissions, admin
npm run db:seed
# Admin default: admin@pustaka.id / Admin123! (atau dari env ADMIN_*)
```

Schema ada di `src/shared/database/schema/` (9 tabel + `password_reset_tokens`). Seed ada di `src/shared/database/seed.ts` (Argon2id untuk admin, idempotent `onConflictDoUpdate`).

Verifikasi tabel:

```sql
SELECT table_name FROM information_schema.tables WHERE table_schema='public';
```

---

## Menjalankan Aplikasi

```bash
npm run dev     # http://localhost:3000
npm run build   # production build (Turbopack)
npm start       # start prod
```

**Route**:

- `/` (beranda, public)
- `/login`, `/register` (public, redirect ke /dashboard jika sudah auth)
- `/dashboard`, `/books`, `/authors`, `/categories`, `/users`, `/audit-logs`, `/profile`, `/sessions` (protected via `src/proxy.ts` + `requireAuth`)

**Akun default** setelah seed:

- Admin: `admin@pustaka.id` / `Admin123!` (role ADMIN)
- Daftar baru → role USER (hanya `book.read`)

---

## Testing

```bash
npm run test              # vitest semua (unit + integration)
npm run test:unit         # unit saja
npm run test:integration  # integration (butuh DB)
npm run test:e2e          # playwright (butuh dev server + browsers)
npx playwright install    # install browsers pertama kali
```

**Unit** (`tests/unit/*`, 5 suites 39 tests):

- `password.test.ts` (Argon2id hash/verify/salt)
- `jwt.test.ts` (jose generate/verify/exp, tidak ada password)
- `validation.test.ts` (Zod register/login/book/author/category/query)
- `permission.test.ts` (17 perms, ADMIN/STAFF/USER)
- `errors.test.ts` (AppError codes + sanitasi)

**Integration** (`tests/integration/auth.integration.test.ts`, 8 tests):

- register, duplicate, login+session, wrong password generic, permission, book pagination/softDelete, session revoke (butuh DB, `process.loadEnvFile` di vitest config)

**E2E** (`tests/e2e/critical.test.ts`, skeleton 3 tests, `test.skip` untuk full flow menunggu UI):

- `Register → Login → Dashboard → Book Create/Update → Logout → Protected redirect` — akan diaktifkan setelah `src/app/(dashboard)` UI selesai
- `npx playwright test --list` → 3 tests

---

## Struktur Proyek

```
.
├── src/
│   ├── app/ (App Router)
│   │   ├── page.tsx (beranda)
│   │   ├── (auth)/login, register
│   │   ├── dashboard/ (layout + shell + page)
│   │   ├── books/, authors/, categories/, users/, audit-logs/, profile/, sessions/
│   │   └── proxy.ts
│   ├── modules/
│   │   ├── auth/ (password, jwt, session, cookie, current-user, require-auth, authorization, resource-guard)
│   │   ├── books, authors, categories, users, roles, permissions, audit
│   │   └── shared/...
│   ├── shared/
│   │   ├── database/ (connection, schema, seed)
│   │   ├── validation/ (helpers, auth, book, author, category, query)
│   │   ├── errors/ (app-error, sanitasi)
│   │   ├── constants/ (roles, permissions, app)
│   │   ├── utils/ (pagination, response, hash, audit-meta)
│   │   └── ratelimit/
│   └── env.ts
├── tests/ (unit, integration, e2e)
├── drizzle/ (migrations)
└── vitest.config.ts, drizzle.config.ts, next.config.ts
```

---

## Keputusan Arsitektur

### Modular Monolith (bukan Microservices)

- **Mengapa**: Project portfolio single team, traffic belum butuh scale horizontal. Monolith lebih sederhana (1 repo, 1 DB, 1 deploy), tapi modular (boundary `modules/*`) menghindari god object dan memudahkan extract ke service nanti jika perlu. `docs/PRD.md:1419` → `Simple → Maintainable`.
- **Alternatif**: Microservices akan over-engineering (network overhead, distributed transactions) untuk CRUD buku.

### PostgreSQL

- **Mengapa**: Relasional kuat untuk `FK, unique, join` (book→author/category, user→role→permissions), support `jsonb` untuk `audit_logs.metadata`, `identity` PK, dan ekosistem Drizzle mature. Dibanding SQLite (tidak untuk prod multi-user) atau Mongo (kehilangan FK constraints).
- **Trade-off**: Butuh hosting DB, tapi untuk portfolio lokal `postgresql-x64-18` cukup.

### Auto-increment BIGINT IDENTITY (bukan UUID)

- **Mengapa**: `docs/PRD.md:525` — `BIGINT GENERATED BY DEFAULT AS IDENTITY` lebih ramah untuk `foreign key` (tipe konsisten), index lebih kecil, sorting natural, dan tidak butuh extension `pgcrypto`. UUID lebih baik untuk distributed ID, tapi tidak perlu di monolith.
- **Implementasi**: `bigint({mode:"number"}).primaryKey().generatedByDefaultAsIdentity()` di Drizzle.

### Custom Authentication (bukan Auth.js/Clerk)

- **Mengapa**: `docs/TASK.md:117` melarang Auth.js — tujuan portfolio menunjukkan pemahaman `hash, JWT, session, cookie` secara end-to-end. Custom memungkinkan kontrol `audit logging, rate limiting, RBAC` yang presisi.
- **Trade-off**: Lebih banyak kode, tapi sesuai `docs/PRD.md:31` (portfolio).

### Argon2id (bukan bcrypt)

- **Mengapa**: `docs/PRD.md:206` — Argon2id pemenang PHC, memory-hard, lebih tahan GPU/ASIC dibanding bcrypt. `argon2` 0.45.1 support `type: argon2id`, fallback bcrypt jika kompatibilitas.

### JWT + Database Session

- **Mengapa**: `docs/PRD.md:215` + `docs/PRD.md:258` — JWT stateless untuk `exp/iat` dan `middleware` cepat (`jose jwtVerify`), tapi session di DB untuk `revoke` (logout spesifik, logout all, session list) dan `audit`. Hybrid: `accessToken` 15m (di cookie `HttpOnly`) + `refreshToken` 7d (hash SHA256 di `sessions.token_hash`), jadi tidak ada token plaintext di DB dan bisa dicabut. Pure JWT tanpa DB tidak bisa revoke; pure session tanpa JWT butuh lookup tiap request.

---

## Keputusan Keamanan

### Password Hashing

- `argon2.hash(password, {type: argon2id})`, `verify`, salt otomatis, tidak pernah `password` di response/log. Test `password.test.ts` verifikasi `hash ≠ plaintext` dan `salt` unik.

### Secure Cookie

- `httpOnly:true` (hindari XSS via JS), `secure: production` (HTTPS only di prod, false di dev agar `localhost` http tetap kirim), `sameSite:lax` (CSRF), `path:/`, `maxAge` 15m/7d. Set via `next/headers` `cookies().set`, clear via `delete`.

### Session Management

- `sessions(token_hash sha256(refreshToken), user_id FK cascade, user_agent, ip_address, expires_at 7d)` — tidak simpan token plaintext. `getActiveSessions` filter `expiresAt > now`, `revokeSession` cek `session.userId === currentUser.id` (resource-level), `revokeAll` delete semua. Audit `SESSION_REVOKED`.

### Authorization

- **RBAC**: `roles → permissions` via `role_permissions`, `getUserPermissions(userId)` join, `can(user, perm)`/`requirePermission` reusable. Tidak `if (role==="ADMIN")` — via DB.
- **Permission guard**: `requirePermissionGuard(permission)` → `requireAuth + requirePermission` sebelum service.
- **Resource-level**: `requireOwnership(currentUser, ownerId)` untuk `profile, sessions` — cegah `?id=999` milik orang lain. `user.service` `updateRole` juga cek `last admin`, `self-change`, `privilege escalation`.

### Rate Limiting

- `login 5/15m, register 5/1h, forgot 3/1h, reset 5/1h` — via `src/shared/ratelimit/limiter.ts` yang coba `Upstash Redis` (`Ratelimit.slidingWindow`) dulu, fallback `memoryStore Map` fixed window. `429 RATE_LIMITED` generic. Logic terpisah, dipanggil di `loginAction/registerAction/forgot/reset` sebelum business logic.

### Input Validation

- Semua mutation `parseOrThrow(Zod)` server-side (`src/shared/validation/*`), frontend hanya UX. `helpers.ts` → `validationError 400` dengan `details fieldErrors` sanitasi. Schema: `email, password min 8, book title/isbn, category name unique` dll. DB constraints sebagai backup.

### Soft Delete

- `books.deleted_at` — `findBookList` default `isNull(deletedAt)`, `softDelete` set `now()`, `restore` set `null`, `findById` tanpa `includeDeleted` → `null` untuk deleted. Audit `BOOK_DELETED/RESTORED`.

### Audit Logging

- `audit_logs(user_id FK set null, action, resource, resource_id, metadata jsonb, ip, ua, created_at)` — `logAuditEvent()` dipanggil di `register/login/logout, book/author/category/role/permission, user role, session, password`. Viewer `audit.read` dengan filter `action/userId/resource/search` + pagination, `leftJoin users`, immutable (no update/delete API).

---

## Screenshots

### Landing Page

![Pustaka.id Landing Page](public/screenshots/pustaka.id_home.png)

### Login

![Pustaka.id Login](public/screenshots/pustaka.id_login.png)

### Register

![Pustaka.id Register](public/screenshots/pustaka.id_register.png)

### Dashboard

![Pustaka.id Dashboard](public/screenshots/pustaka.id_dashboard.png)

### Book Management

![Pustaka.id Book Management](public/screenshots/pustaka.id_books.png)

### Author Management

![Pustaka.id Book Management](public/screenshots/pustaka.id_author.png)

### Category Management

![Pustaka.id Book Management](public/screenshots/pustaka.id_category.png)

### User Management

![Pustaka.id Book Management](public/screenshots/pustaka.id_users.png)

### Audit Logs

![Pustaka.id Audit Logs](public/screenshots/pustaka.id_audit-logs.png)

---

## Lisensi

Portfolio pribadi — tidak ada lisensi khusus.

---

<p align="center">
  Created by <strong><a href="https://github.com/dimzzxcode">dimzzxcode</a></strong>
</p>
