import type { Table } from "dexie";
import type {
  SyncEntityType,
  SyncOperation,
  SyncPullResponse,
  SyncPushEntry,
  SyncPushResult,
} from "@field-monitoring/shared";
import { db } from "./db";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";
const LAST_PULLED_AT_KEY = "fieldMonitoring:lastPulledAt";

function tableFor(entityType: SyncEntityType): Table<{ id: string }, string> {
  switch (entityType) {
    case "client":
      return db.clients as unknown as Table<{ id: string }, string>;
    case "site":
      return db.sites as unknown as Table<{ id: string }, string>;
    case "well":
      return db.wells as unknown as Table<{ id: string }, string>;
    case "tank":
      return db.tanks as unknown as Table<{ id: string }, string>;
    case "treatmentSystem":
      return db.treatmentSystems as unknown as Table<{ id: string }, string>;
    case "treatmentWell":
      return db.treatmentWells as unknown as Table<{ id: string }, string>;
    case "parameterConfig":
      return db.parameterConfigs as unknown as Table<{ id: string }, string>;
    case "fuelLensVisit":
      return db.fuelLensVisits as unknown as Table<{ id: string }, string>;
    case "sveSystemVisit":
      return db.sveSystemVisits as unknown as Table<{ id: string }, string>;
    case "bioVentingSystemVisit":
      return db.bioVentingSystemVisits as unknown as Table<{ id: string }, string>;
    case "groundwaterWell":
      return db.groundwaterWells as unknown as Table<{ id: string }, string>;
    case "groundwaterVisit":
      return db.groundwaterVisits as unknown as Table<{ id: string }, string>;
  }
}

function metaKey(entityType: SyncEntityType, entityId: string): string {
  return `${entityType}:${entityId}`;
}

/**
 * Applies a local write optimistically (domain table) and queues it in
 * the outbox for the next sync round. `baseVersion` is read from the
 * local sync-meta cache — null means "not yet known to the server",
 * which the push endpoint requires for "create".
 *
 * Coalesces with an already-pending outbox entry for the same entity
 * instead of adding a second one. Without this, editing an entity twice
 * before its first sync round-trip (e.g. create, then fix a typo, then
 * sync) would queue a "create" and an "update" together; the update's
 * baseVersion is captured as null (nothing confirmed by the server yet),
 * so it would come back a spurious conflict against the version the
 * create itself had just been assigned in the same push batch.
 */
export async function enqueueChange(
  entityType: SyncEntityType,
  operation: SyncOperation,
  entity: { id: string },
): Promise<void> {
  const table = tableFor(entityType);
  const meta = await db.syncMeta.get(metaKey(entityType, entity.id));
  const baseVersion = meta?.version ?? null;

  await db.transaction("rw", table, db.outbox, async () => {
    if (operation === "delete") {
      await table.delete(entity.id);
    } else {
      await table.put(entity);
    }

    const existingPending = await db.outbox
      .where("entityId")
      .equals(entity.id)
      .filter((e) => e.entityType === entityType && e.status === "pending")
      .first();

    if (existingPending?.id !== undefined) {
      if (existingPending.operation === "create" && operation === "delete") {
        // Never reached the server — nothing to tell it.
        await db.outbox.delete(existingPending.id);
        return;
      }
      await db.outbox.update(existingPending.id, {
        operation: existingPending.operation === "create" ? "create" : operation,
        payload: operation === "delete" ? undefined : entity,
        createdAt: new Date().toISOString(),
      });
      return;
    }

    await db.outbox.add({
      entityType,
      entityId: entity.id,
      operation,
      payload: operation === "delete" ? undefined : entity,
      baseVersion,
      createdAt: new Date().toISOString(),
      status: "pending",
    });
  });
}

export interface PushSummary {
  applied: number;
  conflicts: number;
  errors: number;
}

/** Sends every pending outbox entry to the server and applies the results locally. */
export async function pushPending(): Promise<PushSummary> {
  const pending = await db.outbox.where("status").equals("pending").toArray();
  if (pending.length === 0) {
    return { applied: 0, conflicts: 0, errors: 0 };
  }

  const entries: SyncPushEntry[] = pending.map((entry) => ({
    entityType: entry.entityType,
    entityId: entry.entityId,
    operation: entry.operation,
    baseVersion: entry.baseVersion,
    payload: entry.payload,
  }));

  const res = await fetch(`${API_BASE}/sync/push`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entries }),
  });
  if (!res.ok) {
    throw new Error(`sync push failed: HTTP ${res.status}`);
  }
  const { results } = (await res.json()) as { results: SyncPushResult[] };

  const summary: PushSummary = { applied: 0, conflicts: 0, errors: 0 };

  // Matched by position, not by (entityType, entityId): the server
  // processes `entries` in the order sent and returns one result per
  // entry in that same order, so this stays correct even if `pending`
  // somehow held more than one entry for the same entity.
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const outboxEntry = pending[i];
    if (!outboxEntry?.id) continue;

    if (result.status === "applied") {
      summary.applied += 1;
      await db.transaction("rw", db.outbox, db.syncMeta, async () => {
        await db.outbox.delete(outboxEntry.id as number);
        await db.syncMeta.put({
          key: metaKey(result.entityType, result.entityId),
          entityType: result.entityType,
          entityId: result.entityId,
          version: result.version ?? 1,
          updatedAt: result.updatedAt ?? new Date().toISOString(),
          deleted: outboxEntry.operation === "delete",
        });
      });
    } else if (result.status === "conflict") {
      summary.conflicts += 1;
      await db.outbox.update(outboxEntry.id, {
        status: "conflict",
        message: result.message ?? "הערך עודכן בשרת מאז — יש לבדוק ולפתור את הקונפליקט",
      });
    } else {
      summary.errors += 1;
      await db.outbox.update(outboxEntry.id, { status: "error", message: result.message ?? "שגיאה לא ידועה" });
    }
  }

  return summary;
}

/** Fetches entities changed on the server since the last pull and applies them locally. */
export async function pullUpdates(): Promise<{ pulled: number }> {
  const since = localStorage.getItem(LAST_PULLED_AT_KEY);
  const url = new URL("/sync/pull", API_BASE);
  if (since) url.searchParams.set("since", since);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`sync pull failed: HTTP ${res.status}`);
  }
  const { serverTime, entities } = (await res.json()) as SyncPullResponse;

  for (const entity of entities) {
    const table = tableFor(entity.entityType);
    await db.transaction("rw", table, db.syncMeta, async () => {
      if (entity.deleted) {
        await table.delete(entity.entityId);
      } else {
        await table.put(entity.payload as { id: string });
      }
      await db.syncMeta.put({
        key: metaKey(entity.entityType, entity.entityId),
        entityType: entity.entityType,
        entityId: entity.entityId,
        version: entity.version,
        updatedAt: entity.updatedAt,
        deleted: entity.deleted,
      });
    });
  }

  localStorage.setItem(LAST_PULLED_AT_KEY, serverTime);
  return { pulled: entities.length };
}

export interface SyncSummary extends PushSummary {
  pulled: number;
}

/** Push local changes, then pull remote ones. Call on demand or when connectivity returns. */
export async function runSync(): Promise<SyncSummary> {
  const pushSummary = await pushPending();
  const pullSummary = await pullUpdates();
  return { ...pushSummary, ...pullSummary };
}
