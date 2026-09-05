/**
 * Resolution order:
 * 1. VITE_API_BASE_URL, when explicitly set at build time (two separate
 *    deployments — client and server on different origins).
 * 2. In dev (`vite dev`), the local server's default port — client and
 *    server run as two separate processes.
 * 3. Otherwise, the page's own origin — the single-service deploy mode
 *    (see render.yaml / apps/server/src/index.ts, which serves the built
 *    client alongside the API from the same process). Resolved at
 *    runtime in the browser, not baked in at build time, so it's correct
 *    regardless of what URL the host actually assigns.
 */
const explicit = import.meta.env.VITE_API_BASE_URL;
export const API_BASE: string =
  explicit && explicit.length > 0 ? explicit : import.meta.env.DEV ? "http://localhost:3001" : window.location.origin;
