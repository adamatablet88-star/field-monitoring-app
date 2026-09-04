/**
 * Single source of truth for the app's domain types, mirroring
 * docs/data-model.md. Shared between the client (Dexie local schema) and
 * the server (API contracts, persistence layer).
 */
export * from "./identity.js";
export * from "./site.js";
export * from "./well.js";
export * from "./treatmentSystem.js";
export * from "./visits.js";
export * from "./admin.js";
export * from "./user.js";
export * from "./sync.js";
export * from "./auth.js";
