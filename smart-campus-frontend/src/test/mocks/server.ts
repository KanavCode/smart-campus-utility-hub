/**
 * MSW Node Server
 *
 * Creates the MSW server instance for use in Vitest (Node/jsdom environment).
 * Uses `setupServer` from `msw/node` — NOT the browser service worker.
 *
 * Usage: imported by src/test/setup.ts which wires it into Vitest lifecycle hooks.
 * Individual tests can call `server.use(...)` to override handlers per-test.
 */

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * The MSW server pre-loaded with all default request handlers.
 * Lifecycle management (listen / reset / close) is handled in setup.ts.
 */
export const server = setupServer(...handlers);
