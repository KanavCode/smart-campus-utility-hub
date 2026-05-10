# Roadmap — Smart Campus Utility Hub

> **Version:** 1.0 · **Updated:** March 2026  
> This roadmap outlines the planned evolution of Smart Campus Utility Hub from a 5th-semester academic project to a production-ready, community-driven platform for NSoC 2026 and beyond.

---

## Overview

```
Phase 1 (Stability)  ──►  Phase 2 (New Features)  ──►  Phase 3 (Scaling)
   Q2 2026                     Q3 2026                    Q4 2026+
```

---

## Phase 1 — Stability & Open-Source Readiness 🏗️
**Target: April – May 2026**

The goal of Phase 1 is to harden the existing codebase, reduce tech debt, and make the project fully contributor-friendly for NSoC 2026.

### Repository & DevEx

- [x] Add root `.gitignore`
- [x] Create `.env.example` for backend and frontend
- [x] Add `CONTRIBUTING.md` with Conventional Commits guide
- [x] Add `ROADMAP.md`
- [x] Add issue templates
- [x] Set up GitHub Actions lint workflow (ESLint + TypeScript check + Jest)
- [x] Add `docker-compose.yml` for one-command local setup
- [x] Add `CODE_OF_CONDUCT.md`
- [x] Add `SECURITY.md` with responsible disclosure policy

### Backend Hardening

- [ ] Add input validation with Joi to all remaining API endpoints
- [ ] Standardise API error responses (consistent `{ success, error, data }` shape)
- [ ] Add request logging middleware (already using Winston — ensure coverage)
- [ ] Improve JWT error messages (distinguish expired vs. invalid tokens)
- [ ] Add integration tests for all route handlers (target ≥ 70 % coverage)
- [x] Document all endpoints in `smart-campus-backend/API_DOCUMENTATION.md`
- [x] Fix ESLint warnings in backend source files

### Frontend Hardening

- [x] Fix all TypeScript `any` usages in existing components
- [x] Fix ESLint warnings across the frontend
- [ ] Add loading and error states to all data-fetching hooks
- [ ] Replace hardcoded API URLs with `VITE_API_BASE_URL` environment variable
- [ ] Improve 404 page design
- [ ] Add form validation feedback (inline error messages)

### Database

- [ ] Add database indexes for frequently queried columns (`user_id`, `event_date`, `cgpa`)
- [ ] Ensure all foreign key constraints are defined in `schema.sql`
- [x] Write a seed script (`sql/seed.js`) with sample data for development

---

## Phase 2 — New Features & Enhanced UX ✨
**Target: June – August 2026**

Phase 2 adds high-demand features requested by students and faculty.

### Timetable Module

- [ ] **iCal / Google Calendar Export** — students can sync their timetable
- [ ] **Conflict Visualisation** — highlight conflicting time slots in the UI
- [ ] **Drag-and-Drop Editor** — admin can rearrange slots visually
- [ ] **PDF/CSV Download** — export timetable in multiple formats
- [ ] **Push Notifications** — alert students when their timetable changes

### Elective Selection

- [ ] **Waitlist System** — auto-enrol students from waitlist when seats open
- [ ] **Analytics Dashboard (Admin)** — see per-elective demand and allocation stats
- [ ] **Preference Locking** — prevent editing after the selection window closes
- [ ] **Email Notifications** — confirm allocation results via email

### Events & Clubs

- [ ] **Event Discovery Feed** — filterable, searchable event listing with pagination
- [ ] **Club Profile Pages** — rich profiles with member lists and past events
- [ ] **RSVP Reminders** — email/in-app reminder 24 hours before an event
- [ ] **Event Image Upload** — allow organisers to add a cover image

### Authentication & User Management

- [ ] **Refresh Token Rotation** — silent re-authentication without re-login
- [ ] **OAuth Login** — Google / Microsoft SSO for institutional accounts
- [x] **Profile Page** — students and faculty can update their profile and photo
- [x] **Admin User Management** — promote/demote roles from the admin panel

---

## Phase 3 — Scaling & Production Readiness 🚀
**Target: September 2026+**

Phase 3 prepares the platform for real institutional deployment.

### Infrastructure

- [x] **Containerisation** — complete multi-service `docker-compose.yml` with Nginx reverse proxy
- [ ] **CI/CD Pipeline** — auto-deploy to staging on merge to `develop`; production on release tag
- [ ] **Environment-Based Config** — distinct configs for `development`, `staging`, `production`
- [ ] **Database Migrations** — adopt a proper migration tool (e.g., `db-migrate` or `Flyway`)
- [ ] **Health Monitoring** — integrate uptime monitoring and alerting (e.g., Better Uptime)

### Performance

- [ ] **Redis Caching** — cache timetable generation results and elective seat counts
- [ ] **Pagination on all list endpoints** — prevent large payload responses
- [ ] **Database Query Optimisation** — add `EXPLAIN ANALYZE` reports for slow queries
- [ ] **Frontend Code Splitting** — lazy-load route-level bundles

### Security

- [ ] **Security Audit** — run OWASP ZAP / `npm audit` and resolve HIGH/CRITICAL findings
- [ ] **CSP Header Tightening** — remove `unsafe-inline` where possible
- [ ] **Brute-Force Protection** — account lockout after N failed login attempts
- [ ] **Secrets Rotation Guide** — document JWT secret rotation procedure

### Community

- [ ] **NSoC 2026 Post-Mortem** — write a retrospective blog post
- [ ] **Hacktoberfest Participation** — tag eligible issues for Hacktoberfest
- [ ] **v1.0.0 Release** — publish a formal GitHub Release with changelog

---

## How to Get Involved

All Phase 1 issues are tagged `NSOC'26` and are available on the [Issues](https://github.com/KanavCode/smart-campus-utility-hub/issues) page.  
Beginner tasks are additionally labelled `good first issue`.

See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.
