// CommonJS on purpose, not the ESM used everywhere else in this repo:
// Netlify's classic-function bundler (esbuild) produces a CJS-format
// bundle regardless of the entry file's own syntax, and Node picks the
// module system for that *output* file by walking up from wherever the
// bundler actually places it — which, depending on the build context,
// can land under a directory whose nearest package.json declares
// "type": "module" (as apps/server's does). An .mjs entry hit exactly
// that mismatch during local testing ("module is not defined in ES
// module scope"). A .cjs entry sidesteps the ambiguity entirely: Node
// always treats it as CommonJS, independent of any ancestor
// package.json — verified locally via `netlify functions:serve`.
//
// esbuild's bundler resolves and inlines everything below regardless of
// whether it's require()'d or import()'ed, so requiring the ESM
// TypeScript sources here (same ".js"-specifier-for-a-.ts-file
// convention used throughout the rest of the server) is safe.
const serverlessHttp = require("serverless-http");
const { createApp } = require("../../apps/server/src/app.js");
const { seedAdminIfConfigured } = require("../../apps/server/src/seedAdmin.js");

const app = createApp();
const serverlessHandler = serverlessHttp(app);

// Runs at most once per warm container — seedAdminIfConfigured is itself
// idempotent (no-op once the admin user exists), this just avoids an
// extra DB round-trip on every single request.
let seeded = false;

exports.handler = async (event, context) => {
  if (!seeded) {
    seeded = true;
    await seedAdminIfConfigured().catch((err) => console.error("admin auto-seed failed:", err));
  }
  return serverlessHandler(event, context);
};
