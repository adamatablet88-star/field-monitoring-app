import Dexie, { type EntityTable } from "dexie";
import type {
  Client,
  Site,
  Well,
  Tank,
  TreatmentSystem,
  TreatmentWell,
  ParameterConfig,
  FuelLensVisit,
  SveSystemVisit,
  BioVentingSystemVisit,
  GroundwaterWell,
  GroundwaterVisit,
  FrequencySetting,
  ActiveStatus,
  RegulatoryReport,
  ScheduledSpecialTest,
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
  /**
   * Captured from the push result when status is "conflict" — the
   * server's current state at the time of the conflict, so the
   * conflict-resolution UI (roadmap step 8) can show a local-vs-server
   * comparison without a network round-trip. Undefined for a create
   * conflict where the server has no comparable row (see
   * apps/server/src/sync/router.ts's unique-violation branch).
   */
  serverPayload?: unknown;
  serverVersion?: number;
  serverUpdatedAt?: string;
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
  fuelLensVisits!: EntityTable<FuelLensVisit, "id">;
  sveSystemVisits!: EntityTable<SveSystemVisit, "id">;
  bioVentingSystemVisits!: EntityTable<BioVentingSystemVisit, "id">;
  groundwaterWells!: EntityTable<GroundwaterWell, "id">;
  groundwaterVisits!: EntityTable<GroundwaterVisit, "id">;
  frequencySettings!: EntityTable<FrequencySetting, "id">;
  activeStatuses!: EntityTable<ActiveStatus, "id">;
  regulatoryReports!: EntityTable<RegulatoryReport, "id">;
  scheduledSpecialTests!: EntityTable<ScheduledSpecialTest, "id">;
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
      fuelLensVisits: "id, wellId, visitDate",
      sveSystemVisits: "id, systemId, visitDate",
      bioVentingSystemVisits: "id, systemId, visitDate",
      groundwaterWells: "id, siteId",
      groundwaterVisits: "id, wellId, visitDate",
      outbox: "++id, entityType, entityId, status, createdAt",
      syncMeta: "key, entityType, entityId",
    });
    // FrequencySetting/ActiveStatus/ScheduledSpecialTest are keyed by a
    // union scope ({siteId} or {systemId}, see FrequencyScope in
    // packages/shared/src/admin.ts) — not indexable as a single Dexie
    // column, so these are filtered client-side same as every other
    // scoped local collection (e.g. wells-by-site in FieldApp).
    this.version(2).stores({
      frequencySettings: "id",
      activeStatuses: "id",
      regulatoryReports: "id, siteId, type",
      scheduledSpecialTests: "id",
    });
  }
}

export const db = new FieldMonitoringDB();
