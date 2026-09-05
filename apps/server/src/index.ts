import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { createApp } from "./app.js";
import { seedAdminIfConfigured } from "./seedAdmin.js";

// Optional single-service deploy mode (e.g. Render's free tier, see
// render.yaml): if a client build sits alongside this one, serve it from
// the same origin (apps/client/src/apiBase.ts falls back to
// window.location.origin) — no second service, no cross-origin URL to
// get right. Skipped entirely when absent, so local dev (client served
// separately by Vite) is unaffected.
const clientDistPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");
const hasClientBuild = fs.existsSync(clientDistPath);

const app = createApp((app) => {
  if (hasClientBuild) {
    app.use(express.static(clientDistPath));
  }
});

// SPA fallback, mounted last (after authRouter/syncRouter inside
// createApp) so it can't shadow a real API route like GET /sync/pull —
// see createApp's own comment for why the ordering matters.
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
