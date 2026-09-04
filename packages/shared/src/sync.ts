/**
 * Basic offline-first sync contract (roadmap step 2). Conflict is
 * *detected* here via optimistic-concurrency version numbers and
 * surfaced to the user — automatic merge/resolution is a later step
 * (roadmap step 8), per docs/architecture.md.
 */
export type SyncEntityType = "site" | "well" | "tank" | "treatmentSystem" | "treatmentWell";
export type SyncOperation = "create" | "update" | "delete";

export interface SyncPushEntry {
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  /** The version this change was based on; null for "create". */
  baseVersion: number | null;
  /** Omitted for "delete". */
  payload?: unknown;
}

export type SyncPushStatus = "applied" | "conflict" | "error";

export interface SyncPushResult {
  entityType: SyncEntityType;
  entityId: string;
  status: SyncPushStatus;
  /** Present when applied. */
  version?: number;
  updatedAt?: string;
  /** Present on conflict: the current server-side state, for the user to compare against. */
  serverPayload?: unknown;
  message?: string;
}

export interface SyncPullEntity {
  entityType: SyncEntityType;
  entityId: string;
  version: number;
  updatedAt: string;
  deleted: boolean;
  payload: unknown;
}

export interface SyncPullResponse {
  serverTime: string;
  entities: SyncPullEntity[];
}
