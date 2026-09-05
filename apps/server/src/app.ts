import cors from "cors";
import express, { type Express } from "express";
import { syncRouter } from "./sync/router.js";
import { authRouter } from "./auth/router.js";

/**
 * The API alone — no .listen(), no static-file serving, no seeding.
 * Reused two ways: apps/server/src/index.ts adds static-serving/seeding
 * on top of this and calls .listen() (local dev, Render's combined
 * deploy — see render.yaml); netlify/functions/api.ts wraps this
 * directly with serverless-http instead, since on Netlify the client is
 * its own separately-hosted static site, not served by this app.
 *
 * `mountBefore`, when given, is called after the core middleware but
 * *before* authRouter/syncRouter are mounted — the only place a caller
 * can safely insert something like static-file serving. syncRouter's
 * `.use(requireAuth)` is a router-level middleware with no path
 * restriction, so it runs for every request that reaches it regardless
 * of whether any of its own routes match; anything mounted on `app`
 * *after* these two routers would never be reached for a request that
 * doesn't carry a valid token, static assets included.
 */
export function createApp(mountBefore?: (app: Express) => void): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  mountBefore?.(app);

  app.use(authRouter);
  app.use(syncRouter);

  return app;
}
