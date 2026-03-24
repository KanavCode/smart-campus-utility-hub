# Optimization Baseline (Phase 0)

Date: 2026-03-24
Goal: lock current behavior before maintainability refactors.

## Repository State
- Working baseline branch: `main`
- Baseline captured before refactor edits: clean state with all previous work pushed.

## Baseline Quality Gates

### Backend
- Command: `npm test` (from smart-campus-backend)
- Result: PASS
- Test suites: 5/5
- Tests: 74/74
- Snapshots: 0

### Frontend
- Command: `npm run build` (from smart-campus-frontend)
- Result: PASS
- Build time: ~7s
- Largest chunks:
  - `3d-stack`: 670.67 kB (173.54 kB gzip)
  - `react-core`: 384.79 kB (124.47 kB gzip)
  - `vendor`: 115.37 kB (40.33 kB gzip)

## API Contract Snapshot (Key Endpoints)

### Auth and Users
Source: `smart-campus-backend/src/components/users/user.controller.js`
- `POST /api/auth/register`
  - Status: 201
  - Shape: `{ success, message, data: { user, token } }`
- `POST /api/auth/login`
  - Status: 200
  - Shape: `{ success, message, data: { user, token } }`
- `GET /api/auth/profile`
  - Status: 200
  - Shape: `{ success, data: { user } }`
- `PUT /api/users/:id`
  - Status: 200
  - Shape: `{ success, message, data: { user } }`

### Timetable
Source: `smart-campus-backend/src/components/timetable/timetable.controller.js`
- `GET /api/timetable/teachers`
  - Status: 200
  - Shape: `{ success, data: { teachers, count } }`
- `GET /api/timetable/subjects`
  - Status: 200
  - Shape: `{ success, data: { subjects, count } }`
- `GET /api/timetable/group/:groupId`
  - Status: 200
  - Shape: `{ success, data: { timetable, group_id, count } }`
- `POST /api/timetable/teachers`
  - Status: 201
  - Shape: `{ success, message, data: { teacher } }`

### Electives
Source: `smart-campus-backend/src/components/electives/elective.controller.js`
- `GET /api/electives`
  - Status: 200
  - Shape: `{ success, data: { electives, count } }`
- `POST /api/electives/choices`
  - Status: 200
  - Shape: `{ success, message }`
- `GET /api/electives/my/choices`
  - Status: 200
  - Shape: `{ success, data: { choices } }`
- `GET /api/electives/my/allocation`
  - Status: 200
  - Shape: `{ success, message?, data: { allocation } }`

## No-Behavior-Change Checklist
Every optimization phase must keep all items true:
1. Route paths and HTTP methods remain unchanged.
2. Response envelope keys remain unchanged.
3. Status code behavior remains unchanged for successful and tested error paths.
4. Role restrictions remain unchanged.
5. Existing test suites continue to pass fully.
6. Frontend build remains successful.

## Phase 1 Scope Started
- File touched: `smart-campus-backend/src/components/timetable/timetable.controller.js`
- Change type: internal duplication reduction only.
- Refactor details:
  - Added shared SQL day-order constant reused by group/teacher timetable queries.
  - Added shared helper to build active-entity list queries for teachers/subjects/rooms/groups.
- Expected behavior: unchanged API outputs and filtering semantics.
