import Dexie, { type EntityTable } from "dexie";
import type {
  Client,
  Site,
  Well,
  Tank,
  TreatmentSystem,
  TreatmentWell,
} from "@field-monitoring/shared";

/**
 * A pending local write, queued until the next sync round (outbox
 * pattern) — see docs/architecture.md "Offline-First" / "Sync". The sync
 * loop itself (roadmap step 2) is not implemented yet; this table only
 * reserves the shape so writes can start queuing as soon as forms exist.
 */
export interface OutboxEntry {
  id?: number;
  entityType: "site" | "well" | "tank" | "treatmentSystem" | "treatmentWell";
  entityId: string;
  operation: "create" | "update" | "delete";
  payload: unknown;
  createdAt: string;
  status: "pending" | "synced" | "conflict";
}

class FieldMonitoringDB extends Dexie {
  clients!: EntityTable<Client, "id">;
  sites!: EntityTable<Site, "id">;
  wells!: EntityTable<Well, "id">;
  tanks!: EntityTable<Tank, "id">;
  treatmentSystems!: EntityTable<TreatmentSystem, "id">;
  treatmentWells!: EntityTable<TreatmentWell, "id">;
  outbox!: EntityTable<OutboxEntry, "id">;

  constructor() {
    super("field-monitoring-app");
    this.version(1).stores({
      clients: "id, name",
      sites: "id, clientId, name",
      wells: "id, siteId, code, recoveryMethod, tankId",
      tanks: "id, siteId",
      treatmentSystems: "id, siteId, systemType",
      treatmentWells: "id, systemId, code, wellType",
      outbox: "++id, entityType, entityId, status, createdAt",
    });
  }
}

export const db = new FieldMonitoringDB();
