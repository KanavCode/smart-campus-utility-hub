# Contributing to Smart Campus Utility Hub

Welcome, and thank you for your interest in contributing to **Smart Campus Utility Hub**! 🎉  
This project is part of **Nexus Spring of Code (NSoC) 2026** and we want to make the contribution experience as smooth as possible for everyone — from first-timers to seasoned open-source veterans.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Fork – Branch – PR Workflow](#fork--branch--pr-workflow)
4. [Commit Message Standards](#commit-message-standards)
5. [Coding Style](#coding-style)
6. [Running Tests](#running-tests)
7. [Submitting a Pull Request](#submitting-a-pull-request)
8. [NSoC 2026 Rules](#nsoc-2026-rules)
9. [Issue Labels](#issue-labels)
10. [Getting Help](#getting-help)

---

## Code of Conduct

By participating, you agree to maintain a respectful and inclusive environment. Harassment, hate speech, or any form of discrimination will not be tolerated. Please treat every contributor with kindness.

---

## Getting Started

### Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Node.js | 18.x |
| npm | 9.x |
| PostgreSQL | 13.x |
| Git | 2.x |

### Local Setup

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/smart-campus-utility-hub.git
cd smart-campus-utility-hub

# 2. Add the upstream remote so you can stay in sync
git remote add upstream https://github.com/KanavCode/smart-campus-utility-hub.git

# 3. Set up the backend
cd smart-campus-backend
cp .env.example .env          # fill in your local values
npm install
npm run dev                   # runs on http://localhost:5000

# 4. Set up the frontend (new terminal)
cd ../smart-campus-frontend
cp .env.example .env          # fill in VITE_API_BASE_URL
npm install
npm run dev                   # runs on http://localhost:5173
```

---

## Fork – Branch – PR Workflow

We follow a **fork-and-pull** model.

```
upstream/main  ◄─────────────────── your fork/main (kept in sync)
                                           │
                                  feature branch
                                    (your changes)
                                           │
                                     Pull Request
```

### Step-by-step

```bash
# 1. Sync your fork with upstream before starting new work
git fetch upstream
git checkout main
git merge upstream/main
git push origin main

# 2. Create a dedicated branch for your change
#    Use the naming convention described below
git checkout -b feat/timetable-export-ical

# 3. Make your changes, stage, and commit
git add .
git commit -m "feat(timetable): add iCal export endpoint"

# 4. Keep your branch up to date while you work
git fetch upstream
git rebase upstream/main

# 5. Push and open a Pull Request
git push origin feat/timetable-export-ical
# Then open a PR on GitHub against `main`
```

### Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<short-description>` | `feat/event-rsvp-notifications` |
| Bug Fix | `fix/<short-description>` | `fix/login-redirect-loop` |
| Documentation | `docs/<short-description>` | `docs/update-api-endpoints` |
| Refactor | `refactor/<short-description>` | `refactor/elective-service` |
| Chore / Config | `chore/<short-description>` | `chore/add-eslint-rules` |
| Tests | `test/<short-description>` | `test/auth-middleware-coverage` |

---

## Commit Message Standards

We follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification.

### Format

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semicolons, etc. (no logic change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `chore` | Build process, CI, tooling changes |
| `revert` | Reverts a previous commit |

### Scopes (optional but encouraged)

`auth`, `timetable`, `electives`, `events`, `clubs`, `ui`, `db`, `api`, `ci`, `docs`

### Examples

```bash
# Good commit messages ✅
git commit -m "feat(auth): add refresh token rotation"
git commit -m "fix(electives): prevent duplicate preference submission"
git commit -m "docs: add Docker setup instructions to README"
git commit -m "refactor(timetable): extract conflict-detection into utility module"
git commit -m "test(events): add RSVP endpoint integration tests"
git commit -m "chore(ci): add frontend type-check step to lint workflow"

# Bad commit messages ❌
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "changes"
```

> **Breaking changes:** Add `!` after the type and include `BREAKING CHANGE:` in the footer.  
> Example: `feat(auth)!: drop support for legacy session tokens`

---

## Coding Style

### Backend (Node.js / Express)

- **Linter:** ESLint with `eslint:recommended` (see `.eslintrc.json`)
- **Run:** `npm run lint` inside `smart-campus-backend/`
- **Auto-fix:** `npm run lint:fix` inside `smart-campus-backend/`
- Use `const`/`let`; avoid `var`
- Single quotes for strings: `'hello'`
- Always end statements with semicolons
- Use `async/await` over raw Promises/callbacks
- Add JSDoc comments to all exported functions

```javascript
/**
 * Retrieve all active elective subjects.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const getElectives = async (req, res, next) => {
  // ...
};
```

### Frontend (TypeScript / React)

- **Linter:** ESLint with `typescript-eslint` (see `eslint.config.js`)
- **Run:** `npm run lint` inside `smart-campus-frontend/`
- **Type-check:** `npm run typecheck`
- **Unit tests:** `npm run test`
- Use functional components with TypeScript types/interfaces
- Prefer named exports over default exports for components
- Co-locate component-specific styles with the component file
- Avoid `any`; use proper TypeScript types

```typescript
interface ElectiveCardProps {
  id: string;
  name: string;
  seats: number;
  onSelect: (id: string) => void;
}

export const ElectiveCard = ({ id, name, seats, onSelect }: ElectiveCardProps) => {
  // ...
};
```

### General Rules

- Keep functions small and single-purpose (< 50 lines is a good target)
- Write self-documenting code; add comments only when the *why* is not obvious
- Avoid magic numbers — define named constants
- Do not leave debugging `console.log` statements in production code
- Write or update tests for every non-trivial change

---

## Running Tests

### Backend

```bash
cd smart-campus-backend
npm test                   # run all tests once
npm run test:watch         # watch mode (re-runs on file change)
npm run test:coverage      # generate coverage report
```

### Frontend

```bash
cd smart-campus-frontend
npm run build              # TypeScript compilation + Vite build
npm run typecheck          # type-check only (no output files)
npm run test               # run unit tests (Vitest)
```

---

## Submitting a Pull Request

1. Ensure all linting and tests pass locally before pushing.
2. Use a clear PR description (summary, testing done, and related issue).
3. Keep your PR **focused** — one feature or fix per PR.
4. Reference the related issue with `Closes #<issue-number>` in the PR description and ensure the issue is assigned to you before opening the PR.
5. For NSoC contributions, include `#NSoC2026` in the PR description.
6. Request a review from a maintainer. Do not merge your own PR.
7. Be responsive to review comments; address them within **7 days** or the PR may be closed.

### PR Size Guidelines

| Size | Lines Changed | Notes |
|------|---------------|-------|
| XS | < 10 | Config tweaks, typos |
| S | 10 – 100 | Bug fixes, small features |
| M | 100 – 300 | New features, refactors |
| L | 300 – 500 | Large features; consider splitting |
| XL | > 500 | Please split into smaller PRs |

---

## NSoC 2026 Rules

### Assignment and PR Validity

1. Always get an issue assigned before starting work for NSoC.
2. PRs opened without prior issue assignment are invalid for NSoC tracking and will be closed.
3. The PR author should match one of the assignees on the linked issue.
4. PRs without a linked issue reference (`Closes #<issue-number>`) are invalid for NSoC tracking.

### Inactivity Handling

- If a contributor is inactive for **7 days** after assignment, maintainers will unassign the issue.
- PRs with no contributor response for **7 days** will be closed after a maintainer reminder.

### Communication Expectations

- Maintainers should acknowledge contributor queries promptly and provide actionable feedback.
- Avoid unnecessary review delays; if blocked, clearly communicate what is needed next.
- Keep review comments specific, respectful, and decision-oriented.

### Quality Gate (Maintainers)

Do not merge low-quality PRs. Before merging, verify:

- The solution works and actually resolves the issue.
- Relevant tests and lint checks pass.
- Documentation is updated when behavior or setup changes.
- The PR description is clear and links the correct issue.

### Fair Usage and Anti-Abuse

- Fake, spam, or very low-effort PRs are not accepted.
- Project admins/maintainers must not create issues and resolve them themselves for NSoC points in their own repository.
- Project admins/maintainers must not self-assign issues to claim NSoC points from their own repository.
- Merging fake/spam/very low-quality contributions can lead to NSoC point deductions and stricter penalties.
- Extended Project Kernel inactivity (7+ days without valid reason) can lead to NSoC point deductions as per program policy.
- Repeated abuse can lead to PR rejection, disqualification from NSoC tracking, or stricter repository moderation.

---

## Issue Labels

See [`docs/LABELS.md`](docs/LABELS.md) for the full list of labels and their meanings.

Quick guide for contributors:

| Label | Meaning |
|-------|---------|
| `good first issue` | Great for newcomers |
| `help wanted` | Maintainers need community help |
| `level1` | NSoC issue worth 3 points |
| `level2` | NSoC issue worth 5 points |
| `level3` | NSoC issue worth 10 points |
| `bug` | Something is broken |
| `enhancement` | New feature or improvement |
| `documentation` | Docs-only change |
| `nsoc-2026` | Counts towards NSoC contribution |

For NSoC, each issue should include `nsoc-2026` and exactly one of `level1`, `level2`, `level3`.

---

## Getting Help

- **GitHub Discussions** — Questions, ideas, show & tell: [Discussions](https://github.com/KanavCode/smart-campus-utility-hub/discussions)
- **GitHub Issues** — Bug reports and feature requests: [Issues](https://github.com/KanavCode/smart-campus-utility-hub/issues)

We're happy to help! Don't hesitate to ask. 😊
