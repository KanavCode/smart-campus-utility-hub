# NSoC 2026 — Pre-Written GitHub Issues

This document contains 20 ready-to-create GitHub issues for **Nexus Spring of Code 2026**.  
Copy each block into the GitHub Issues UI (or use the GitHub CLI) to create them.

> **CLI shortcut:**  
> `gh issue create --title "..." --body "..." --label "..."`

---

## 🌱 Beginner Issues (Good First Issue) — 8 Issues

---

### Issue 1 — Add Root `.gitignore`

**Title:** `chore: add root-level .gitignore`

**Labels:** `good first issue`, `chore`, `nsoc-2026`

**Description:**

The repository currently has individual `.gitignore` files inside `smart-campus-backend/` and `smart-campus-frontend/`, but there is no root-level `.gitignore` to cover repository-wide artefacts.

**Expected Outcome:**

A `.gitignore` file at the repository root that:
- Ignores `node_modules/`, `dist/`, `build/`, `coverage/` in all sub-directories
- Ignores `.env` files (secrets must never be committed)
- Ignores common OS files (`.DS_Store`, `Thumbs.db`)
- Ignores common editor files (`.vscode/`, `.idea/`)

**Files to Edit:**
- Create `/.gitignore`

**Helpful Resources:**
- [gitignore.io](https://www.toptal.com/developers/gitignore) — generate `.gitignore` for Node, React, macOS, Windows

---

### Issue 2 — Create `.env.example` Files

**Title:** `chore: add .env.example files for backend and frontend`

**Labels:** `good first issue`, `chore`, `documentation`, `nsoc-2026`

**Description:**

New contributors cannot easily set up the project locally because there is no template for required environment variables. We need `.env.example` files in both sub-projects documenting every variable the application reads.

**Expected Outcome:**

- `smart-campus-backend/.env.example` listing all variables from `src/config/db.js` and `src/app.js` (e.g., `DB_HOST`, `DB_PASSWORD`, `JWT_SECRET`, `PORT`)
- `smart-campus-frontend/.env.example` listing `VITE_API_BASE_URL`
- The actual `.env` files must **not** be committed (add them to `.gitignore`)

**Files to Edit:**
- Create `smart-campus-backend/.env.example`
- Create `smart-campus-frontend/.env.example`

---

### Issue 3 — Fix Broken Links in `README.md`

**Title:** `docs: fix broken documentation links in README`

**Labels:** `good first issue`, `documentation`, `bug`, `nsoc-2026`

**Description:**

The root `README.md` references `FinalFrontend/INTEGRATION_GUIDE.md` which does not exist in the current directory structure. It also references `FinalFrontend/` as a valid frontend path while the actual frontend is at `smart-campus-frontend/`.

**Expected Outcome:**
- All links in `README.md` resolve correctly
- References to `FinalFrontend/` are updated to `smart-campus-frontend/`
- The Installation Guide section reflects the correct folder names

**Files to Edit:**
- `README.md`

---

### Issue 4 — Add Missing Alt Text to UI Images

**Title:** `fix(frontend): add missing alt text to all images for accessibility`

**Labels:** `good first issue`, `bug`, `area: frontend`, `nsoc-2026`

**Description:**

Several `<img>` tags in the frontend components are missing `alt` attributes. This is an accessibility (a11y) violation and will also cause ESLint warnings with the `jsx-a11y` plugin.

**Expected Outcome:**
- Every `<img>` tag has a meaningful `alt` attribute
- Decorative images use `alt=""`
- No `jsx-a11y/alt-text` ESLint warnings

**Files to Edit:**
- `smart-campus-frontend/src/components/` — audit all component files

---

### Issue 5 — Add `CODE_OF_CONDUCT.md`

**Title:** `docs: add CODE_OF_CONDUCT.md`

**Labels:** `good first issue`, `documentation`, `nsoc-2026`

**Description:**

The project is missing a Code of Conduct, which is a standard open-source requirement. Without it, contributors do not know what behaviour is expected.

**Expected Outcome:**

A `CODE_OF_CONDUCT.md` at the repository root using the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) template, customised with the project's contact email.

**Files to Create:**
- `CODE_OF_CONDUCT.md`

**Helpful Resources:**
- https://www.contributor-covenant.org/

---

### Issue 6 — Fix Inconsistent Button Styles on the Landing Page

**Title:** `fix(ui): standardise button variants on landing page`

**Labels:** `good first issue`, `bug`, `area: frontend`, `nsoc-2026`

**Description:**

The landing page (`src/pages/Landing.tsx`) uses a mix of inline Tailwind classes and the `<Button>` component from shadcn/ui for actions that should look the same (e.g., "Get Started" and "Learn More" CTAs). This creates visual inconsistency.

**Expected Outcome:**
- All primary CTAs use `<Button variant="default">`
- All secondary CTAs use `<Button variant="outline">`
- No inline style overrides that conflict with the design system

**Files to Edit:**
- `smart-campus-frontend/src/pages/Landing.tsx`

---

### Issue 7 — Add a `SECURITY.md` File

**Title:** `docs: add SECURITY.md with vulnerability reporting policy`

**Labels:** `good first issue`, `documentation`, `security`, `nsoc-2026`

**Description:**

There is no `SECURITY.md` to guide users on how to responsibly disclose security vulnerabilities. This is a GitHub best practice and is shown in the repository's "Security" tab.

**Expected Outcome:**

A `SECURITY.md` file at the repository root that:
- States supported versions
- Explains how to report a vulnerability privately (e.g., via GitHub Private Security Advisory)
- Sets expectations for response time

**Files to Create:**
- `SECURITY.md`

---

### Issue 8 — Improve the 404 Not Found Page

**Title:** `feat(ui): improve 404 Not Found page design`

**Labels:** `good first issue`, `enhancement`, `area: frontend`, `nsoc-2026`

**Description:**

The current `NotFound.tsx` page is a plain, unstyled page that doesn't match the rest of the application's design.

**Expected Outcome:**
- A visually consistent 404 page matching the app's design system
- A clear "Go Home" button that navigates to `/`
- An illustrative icon or animation (a Lottie animation is available in the codebase)

**Files to Edit:**
- `smart-campus-frontend/src/pages/NotFound.tsx`

---

## 🔧 Intermediate Issues — 7 Issues

---

### Issue 9 — Standardise API Error Response Shape

**Title:** `refactor(backend): standardise API error response format`

**Labels:** `intermediate`, `refactor`, `area: backend`, `nsoc-2026`

**Description:**

API endpoints across the application return errors in different shapes (some use `{ message }`, others use `{ error }`, others use `{ success: false, error }`). This makes client-side error handling inconsistent and fragile.

**Expected Outcome:**
- All error responses follow the shape: `{ success: false, error: { code, message, details? } }`
- All success responses follow: `{ success: true, data: {...}, meta?: {...} }`
- The `errorHandler.js` middleware is updated to enforce this
- Existing tests are updated to match the new shape

**Files to Edit:**
- `smart-campus-backend/src/middleware/errorHandler.js`
- All route handlers in `smart-campus-backend/src/components/`

---

### Issue 10 — Add Joi Validation to Elective Selection Endpoint

**Title:** `feat(backend): add Joi input validation to elective selection endpoints`

**Labels:** `intermediate`, `enhancement`, `area: backend`, `area: electives`, `nsoc-2026`

**Description:**

The `POST /api/electives/select` and `POST /api/electives/allocate` endpoints do not validate request bodies, making them susceptible to invalid data causing database errors.

**Expected Outcome:**
- Joi schemas defined for all elective request bodies
- Invalid requests return a `400 Bad Request` with descriptive messages
- Tests added to verify validation behaviour

**Files to Edit:**
- `smart-campus-backend/src/components/electives/`
- `smart-campus-backend/__tests__/timetable-electives.test.js`

---

### Issue 11 — Implement Axios Interceptors for Global API Error Handling

**Title:** `feat(frontend): implement Axios interceptors for global error handling`

**Labels:** `intermediate`, `enhancement`, `area: frontend`, `nsoc-2026`

**Description:**

Each component currently handles API errors individually. A global Axios interceptor would centralise error handling (e.g., auto-redirect on 401, show a toast on 500) and reduce code duplication.

**Expected Outcome:**
- `smart-campus-frontend/src/lib/axios.ts` (or equivalent) has request and response interceptors
- 401 responses automatically clear auth state and redirect to `/auth`
- 5xx responses trigger a toast notification via `sonner`
- Token refresh is handled transparently

**Files to Edit:**
- `smart-campus-frontend/src/lib/axios.ts`
- `smart-campus-frontend/src/contexts/` (auth context)

---

### Issue 12 — Add Pagination to Events List Endpoint

**Title:** `feat(backend): add cursor-based pagination to GET /api/events`

**Labels:** `intermediate`, `enhancement`, `area: backend`, `area: events`, `nsoc-2026`

**Description:**

`GET /api/events` returns all events without pagination. As the number of events grows, this will cause performance issues and slow page loads.

**Expected Outcome:**
- Endpoint accepts `page` (number) and `limit` (number, max 50) query parameters
- Response includes `{ data: [], meta: { total, page, limit, totalPages } }`
- Default: `page=1`, `limit=20`
- Frontend events list updates to use the paginated response

**Files to Edit:**
- `smart-campus-backend/src/components/campus-events/events.routes.js`
- `smart-campus-frontend/src/pages/student/` (events page)

---

### Issue 13 — Refactor Timetable Generation into a Service Layer

**Title:** `refactor(timetable): extract business logic into a service layer`

**Labels:** `intermediate`, `refactor`, `area: backend`, `area: timetable`, `nsoc-2026`

**Description:**

The timetable route handler currently contains business logic (backtracking algorithm, conflict detection) mixed with HTTP-layer code. This makes it impossible to unit-test the algorithm independently.

**Expected Outcome:**
- A new `timetable.service.js` file contains all pure business logic
- Route handlers only handle HTTP concerns (parsing, response)
- Existing tests are refactored to test the service directly
- Overall test coverage for the timetable module increases

**Files to Edit / Create:**
- `smart-campus-backend/src/components/timetable/timetable.service.js` (new)
- `smart-campus-backend/src/components/timetable/timetable.routes.js`
- `smart-campus-backend/__tests__/timetable-generation.test.js`

---

### Issue 14 — Replace Hardcoded API URLs in Frontend

**Title:** `fix(frontend): replace all hardcoded API URLs with VITE_API_BASE_URL`

**Labels:** `intermediate`, `bug`, `area: frontend`, `nsoc-2026`

**Description:**

Some service files in the frontend contain hardcoded `http://localhost:5000` URLs instead of using the `VITE_API_BASE_URL` environment variable. This means the app cannot be deployed to a different environment without modifying source code.

**Expected Outcome:**
- All HTTP requests use a centralised Axios instance configured with `import.meta.env.VITE_API_BASE_URL`
- No `localhost` hardcoded strings remain in `src/services/`
- A warning is logged if `VITE_API_BASE_URL` is not set

**Files to Edit:**
- `smart-campus-frontend/src/services/` — all service files
- `smart-campus-frontend/src/lib/axios.ts`

---

### Issue 15 — Add JWT Expiry Error Differentiation in Backend

**Title:** `fix(auth): differentiate between expired and invalid JWT errors`

**Labels:** `intermediate`, `bug`, `area: auth`, `area: backend`, `nsoc-2026`

**Description:**

The auth middleware currently returns a generic `401 Unauthorized` for both expired tokens and completely invalid tokens. The frontend needs to know whether to silently refresh the token (expired) or log the user out (invalid).

**Expected Outcome:**
- Expired tokens return `401` with `{ error: { code: "TOKEN_EXPIRED" } }`
- Invalid tokens return `401` with `{ error: { code: "TOKEN_INVALID" } }`
- Frontend Axios interceptor handles `TOKEN_EXPIRED` by attempting a refresh

**Files to Edit:**
- `smart-campus-backend/src/middleware/auth.middleware.js`
- `smart-campus-backend/__tests__/auth.test.js`

---

## 🚀 Advanced Issues — 5 Issues

---

### Issue 16 — Implement Refresh Token Rotation

**Title:** `feat(auth): implement JWT refresh token rotation`

**Labels:** `advanced`, `enhancement`, `area: auth`, `nsoc-2026`

**Description:**

Currently, users must log in again when their JWT expires. Implementing refresh token rotation would allow seamless re-authentication without disrupting the user experience, while maintaining security through single-use refresh tokens.

**Expected Outcome:**
- `POST /api/auth/refresh` endpoint accepts a refresh token (stored in an `httpOnly` cookie) and returns a new access token + a new refresh token
- Old refresh token is invalidated after use (rotation)
- Refresh tokens are stored in the database with expiry and revocation status
- Frontend transparently refreshes on 401 and retries the failed request

**Files to Edit / Create:**
- `smart-campus-backend/sql/schema.sql` (add `refresh_tokens` table)
- `smart-campus-backend/src/components/users/user.routes.js`
- `smart-campus-backend/src/middleware/auth.middleware.js`
- `smart-campus-frontend/src/lib/axios.ts`

---

### Issue 17 — Add Database Indexes for Performance

**Title:** `perf(db): add database indexes for frequently queried columns`

**Labels:** `advanced`, `performance`, `area: database`, `nsoc-2026`

**Description:**

As the platform scales, queries on un-indexed columns (`user_id`, `event_date`, `cgpa`, `semester`) will cause full table scans and slow response times. We need to identify and add appropriate indexes.

**Expected Outcome:**
- `EXPLAIN ANALYZE` output documented for the 5 slowest queries (as a comment in the PR)
- Indexes added for: `users(email)`, `events(event_date)`, `elective_allocations(user_id, subject_id)`, `timetable_entries(semester, department)`
- A migration script adds the indexes without data loss
- `schema.sql` updated to include the indexes

**Files to Edit:**
- `smart-campus-backend/sql/schema.sql`
- `smart-campus-backend/sql/migrate.js`

---

### Issue 18 — Implement Role-Based Access Control (RBAC) Middleware

**Title:** `feat(auth): implement RBAC middleware for admin-only endpoints`

**Labels:** `advanced`, `enhancement`, `area: auth`, `area: backend`, `security`, `nsoc-2026`

**Description:**

Currently, any authenticated user can hit admin endpoints (e.g., `POST /api/timetable/generate`, `POST /api/electives/allocate`). Role-based access control must be enforced at the middleware level.

**Expected Outcome:**
- A reusable `requireRole(...roles)` middleware
- All admin endpoints protected with `requireRole('admin')`
- Attempting access without the correct role returns `403 Forbidden`
- Tests added for each protected endpoint

**Files to Create / Edit:**
- `smart-campus-backend/src/middleware/rbac.middleware.js` (new)
- All route files in `smart-campus-backend/src/components/`
- `smart-campus-backend/__tests__/middleware.test.js`

---

### Issue 19 — Add Redis Caching for Timetable Generation

**Title:** `feat(timetable): add Redis caching for generated timetables`

**Labels:** `advanced`, `enhancement`, `area: timetable`, `performance`, `nsoc-2026`

**Description:**

Timetable generation uses a backtracking algorithm that can be computationally expensive. Adding a Redis cache for generated timetables would reduce database load and improve API response times for repeated requests.

**Expected Outcome:**
- `GET /api/timetable/:semester/:department` checks Redis before querying PostgreSQL
- Cache is invalidated when an admin triggers `POST /api/timetable/generate`
- Cache TTL is configurable via `REDIS_CACHE_TTL_SECONDS` env variable
- `docker-compose.yml` includes a Redis service
- The feature degrades gracefully if Redis is unavailable (falls back to DB)

**Files to Edit / Create:**
- `smart-campus-backend/src/config/redis.js` (new)
- `smart-campus-backend/src/components/timetable/timetable.routes.js`
- `docker-compose.yml`
- `smart-campus-backend/.env.example` (add `REDIS_URL`)

---

### Issue 20 — Security Audit: Fix OWASP Top 10 Vulnerabilities

**Title:** `security: audit and fix OWASP Top 10 vulnerabilities`

**Labels:** `advanced`, `security`, `nsoc-2026`

**Description:**

Before the platform can be deployed for real students, it must be audited against the OWASP Top 10 web application security risks.

**Expected Outcome:**

A PR that:
1. Runs `npm audit --audit-level=high` and fixes all HIGH/CRITICAL findings
2. Verifies SQL injection protection (parameterised queries everywhere)
3. Adds account lockout after 5 failed login attempts
4. Tightens the Content-Security-Policy header (remove `unsafe-inline` where possible)
5. Confirms `bcryptjs` work factor is ≥ 12
6. Includes a brief security report (what was found and fixed) in the PR description

**Files to Review:**
- `smart-campus-backend/src/components/users/` — authentication logic
- `smart-campus-backend/src/app.js` — CSP headers
- All SQL query files — parameterised query validation

**Helpful Resources:**
- https://owasp.org/www-project-top-ten/
- https://docs.npmjs.com/cli/v10/commands/npm-audit

---

*Generated for NSoC 2026 — Smart Campus Utility Hub*
