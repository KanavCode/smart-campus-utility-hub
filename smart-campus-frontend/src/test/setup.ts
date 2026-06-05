import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { server } from './mocks/server';

// ─────────────────────────────────────────────────────────────────────────────
// MSW Server Lifecycle
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Start the MSW intercept server before any test in the suite runs.
 *
 * onUnhandledRequest: 'warn' — logs a warning when a component fires a request
 * that has no matching handler, helping catch missing mocks without hard-failing.
 * Switch to 'error' once all routes are covered to enforce strict coverage.
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

/**
 * After each individual test, reset all handlers back to the defaults
 * defined in handlers.ts. This prevents per-test overrides (server.use(...))
 * from leaking into subsequent tests.
 */
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

/**
 * Shut down the MSW server cleanly after the entire test suite finishes.
 */
afterAll(() => {
  server.close();
});
