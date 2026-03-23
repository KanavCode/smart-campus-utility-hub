# GitHub Labels Strategy — Smart Campus Utility Hub

This document lists all labels to create in the GitHub repository UI for effective issue and PR management during **NSoC 2026** and beyond.

---

## How to Create Labels

Go to **https://github.com/KanavCode/smart-campus-utility-hub/labels** and click **"New label"** for each entry below.

---

## 🌱 Contributor Level

These labels help contributors quickly find work suited to their skill level.

| Label | Color | Description |
|-------|-------|-------------|
| `good first issue` | `#7057ff` | Well-scoped tasks for first-time contributors |
| `help wanted` | `#008672` | Maintainers want community input or a PR |
| `intermediate` | `#e4e669` | Requires some knowledge of the codebase |
| `advanced` | `#e11d48` | Complex changes requiring deep system knowledge |

---

## 🗂️ Type

| Label | Color | Description |
|-------|-------|-------------|
| `bug` | `#d73a4a` | Something isn't working |
| `enhancement` | `#a2eeef` | New feature or improvement |
| `documentation` | `#0075ca` | Improvements or additions to docs |
| `refactor` | `#f9d0c4` | Code restructure with no behaviour change |
| `performance` | `#fef2c0` | Improvements to speed or efficiency |
| `security` | `#b60205` | Security vulnerability or hardening |
| `test` | `#bfd4f2` | Missing or additional tests |
| `chore` | `#e4e4e4` | Tooling, CI, config, dependencies |
| `question` | `#d876e3` | Further information requested |
| `duplicate` | `#cfd3d7` | This issue or PR already exists |
| `invalid` | `#e4e4e4` | This doesn't seem right |
| `wontfix` | `#ffffff` | This will not be worked on |

---

## 🧩 Area / Module

| Label | Color | Description |
|-------|-------|-------------|
| `area: frontend` | `#1d76db` | Relates to the React / TypeScript frontend |
| `area: backend` | `#0e8a16` | Relates to the Node.js / Express API |
| `area: database` | `#5319e7` | Relates to PostgreSQL schema or queries |
| `area: auth` | `#fbca04` | Authentication and authorisation |
| `area: timetable` | `#c2e0c6` | Timetable generation and management |
| `area: electives` | `#fad8c7` | Elective selection system |
| `area: events` | `#bfe5bf` | Campus events and clubs |
| `area: ci/cd` | `#ededed` | GitHub Actions and CI workflows |

---

## 🏷️ Status

| Label | Color | Description |
|-------|-------|-------------|
| `needs-triage` | `#e4e4e4` | New issue that hasn't been reviewed yet |
| `in-progress` | `#0052cc` | Someone is actively working on this |
| `needs-review` | `#006b75` | PR or issue awaiting a maintainer review |
| `blocked` | `#b60205` | Progress is blocked by another issue or PR |
| `stale` | `#ededed` | No activity for 30+ days — may be closed |

---

## 🎉 Program

| Label | Color | Description |
|-------|-------|-------------|
| `nsoc-2026` | `#ff6b35` | Counts towards Nexus Spring of Code 2026 contribution |
| `hacktoberfest` | `#ff7518` | Valid Hacktoberfest contribution |

---

## Usage Guidelines

1. **Every issue must have** at least one *Type* label and one *Area* label.
2. New issues automatically get `needs-triage` — remove it once reviewed.
3. All NSoC tasks get `nsoc-2026`.
4. Beginner tasks get both `good first issue` and `help wanted`.
5. Security-related issues get `security` and should **not** include details that could be exploited — use the private security reporting feature for vulnerabilities.
