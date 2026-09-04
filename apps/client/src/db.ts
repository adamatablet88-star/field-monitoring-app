import Dexie, { type EntityTable } from "dexie";
import type {
  Client,
  Site,
  Well,
  Tank,
  TreatmentSystem,
  TreatmentWell,
  ParameterConfig,
  SyncEntityType,
  SyncOperation,
} from "@field-monitoring/shared";

/**
 * A pending local write, queued until the next sync round (outbox
 * pattern) — see docs/architecture.md "Offline-First" / "Sync". Consumed
 * by src/sync.ts.
 */
export interface OutboxEntry {
  id?: number;
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  /** Omitted for "delete". */
  payload?: unknown;
  /** The server version this change was based on; null for "create". */
  baseVersion: number | null;
  createdAt: string;
  status: "pending" | "conflict" | "error";
  message?: string;
}

/**
 * Server-assigned sync bookkeeping for one local entity. Kept separate
 * from the domain tables (sites, wells, ...) so those stay a pure mirror
 * of the shared domain types — same split as version/updatedAt/deletedAt
 * living outside the shared types on the server's Prisma rows.
 */
export interface SyncMetaRecord {
  key: string; // `${entityType}:${entityId}`
  entityType: SyncEntityType;
  entityId: string;
  version: number;
  updatedAt: string;
  deleted: boolean;
}

class FieldMonitoringDB extends Dexie {
  clients!: EntityTable<Client, "id">;
  sites!: EntityTable<Site, "id">;
  wells!: EntityTable<Well, "id">;
  tanks!: EntityTable<Tank, "id">;
  treatmentSystems!: EntityTable<TreatmentSystem, "id">;
  treatmentWells!: EntityTable<TreatmentWell, "id">;
  parameterConfigs!: EntityTable<ParameterConfig, "id">;
  outbox!: EntityTable<OutboxEntry, "id">;
  syncMeta!: EntityTable<SyncMetaRecord, "key">;

  constructor() {
    super("field-monitoring-app");
    this.version(1).stores({
      clients: "id, name",
      sites: "id, clientId, name",
      wells: "id, siteId, code, recoveryMethod, tankId",
      tanks: "id, siteId",
      treatmentSystems: "id, siteId, systemType",
      treatmentWells: "id, systemId, code, wellType",
      parameterConfigs: "id, systemId, order",
      outbox: "++id, entityType, entityId, status, createdAt",
      syncMeta: "key, entityType, entityId",
    });
  }
}

export const db = new FieldMonitoringDB();
