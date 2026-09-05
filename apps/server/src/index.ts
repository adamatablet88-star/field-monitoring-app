import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { syncRouter } from "./sync/router.js";
import { authRouter } from "./auth/router.js";
import { seedAdminIfConfigured } from "./seedAdmin.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Optional single-service deploy mode (e.g. Render's free tier, see
// render.yaml): if a client build sits alongside this one, serve it from
// the same origin (apps/client/src/apiBase.ts falls back to
// window.location.origin) — no second service, no cross-origin URL to
// get right. Skipped entirely when absent, so local dev (client served
// separately by Vite) is unaffected.
//
// Mounted as plain static-file serving *before* the API routers: it only
// responds when the request path matches an actual built file (e.g.
// /assets/*) and otherwise calls next(), so it can't shadow /auth/* or
// /sync/*. The reverse order matters too — syncRouter.use(requireAuth)
// runs unconditionally for every request that reaches syncRouter (a
// router-level `.use()` isn't scoped to its own routes), so mounting the
// SPA fallback below *before* the API routers would have it swallow
// every request (including a stray one that shouldn't 401) before auth
// even gets a say; mounting the fallback last, after both routers, is
// what keeps a real API 401/404 from being masked by index.html.
const clientDistPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");
const hasClientBuild = fs.existsSync(clientDistPath);
if (hasClientBuild) {
  app.use(express.static(clientDistPath));
}

app.use(authRouter);
app.use(syncRouter);

if (hasClientBuild) {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

const port = process.env.PORT ? Number(process.env.PORT) : 3001;

seedAdminIfConfigured()
  .catch((err) => console.error("admin auto-seed failed:", err))
  .finally(() => {
    app.listen(port, () => {
      console.log(`server listening on port ${port}`);
    });
  });
