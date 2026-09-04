import { Router } from "express";
import type {
  SyncEntityType,
  SyncPullEntity,
  SyncPullResponse,
  SyncPushEntry,
  SyncPushResult,
} from "@field-monitoring/shared";
import { prisma } from "../prisma.js";
import {
  clientRowToPayload,
  clientToRowData,
  siteRowToPayload,
  siteToRowData,
  wellRowToPayload,
  wellToRowData,
  tankRowToPayload,
  tankToRowData,
  treatmentSystemRowToPayload,
  treatmentSystemToRowData,
  treatmentWellRowToPayload,
  treatmentWellToRowData,
  parameterConfigRowToShared,
  parameterConfigToRowData,
  fuelLensVisitRowToPayload,
  fuelLensVisitToRowData,
  sveSystemVisitRowToPayload,
  sveSystemVisitToRowData,
  bioVentingSystemVisitRowToPayload,
  bioVentingSystemVisitToRowData,
  groundwaterWellRowToPayload,
  groundwaterWellToRowData,
  groundwaterVisitRowToPayload,
  groundwaterVisitToRowData,
} from "./mapping.js";

interface SyncableRow {
  id: string;
  version: number;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface EntityHandler {
  toPayload: (row: SyncableRow) => unknown;
  toRowData: (payload: unknown) => Record<string, unknown>;
  findUnique: (id: string) => Promise<SyncableRow | null>;
  create: (data: Record<string, unknown>) => Promise<SyncableRow>;
  update: (id: string, data: Record<string, unknown>) => Promise<SyncableRow>;
  softDelete: (id: string) => Promise<SyncableRow>;
}

const tankInclude = { wells: { select: { id: true } } } as const;
const treatmentSystemInclude = { parameters: true } as const;

const handlers: Record<SyncEntityType, EntityHandler> = {
  client: {
    toPayload: (row) => clientRowToPayload(row as Parameters<typeof clientRowToPayload>[0]),
    toRowData: (payload) => clientToRowData(payload as Parameters<typeof clientToRowData>[0]),
    findUnique: (id) => prisma.client.findUnique({ where: { id } }),
    create: (data) => prisma.client.create({ data: data as Parameters<typeof prisma.client.create>[0]["data"] }),
    update: (id, data) =>
      prisma.client.update({
        where: { id },
        data: { ...data, version: { increment: 1 } } as Parameters<typeof prisma.client.update>[0]["data"],
      }),
    softDelete: (id) => prisma.client.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } }),
  },
  site: {
    toPayload: (row) => siteRowToPayload(row as Parameters<typeof siteRowToPayload>[0]),
    toRowData: (payload) => siteToRowData(payload as Parameters<typeof siteToRowData>[0]),
    findUnique: (id) => prisma.site.findUnique({ where: { id } }),
    create: (data) => prisma.site.create({ data: data as Parameters<typeof prisma.site.create>[0]["data"] }),
    update: (id, data) =>
      prisma.site.update({ where: { id }, data: { ...data, version: { increment: 1 } } as Parameters<typeof prisma.site.update>[0]["data"] }),
    softDelete: (id) => prisma.site.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } }),
  },
  well: {
    toPayload: (row) => wellRowToPayload(row as Parameters<typeof wellRowToPayload>[0]),
    toRowData: (payload) => wellToRowData(payload as Parameters<typeof wellToRowData>[0]),
    findUnique: (id) => prisma.well.findUnique({ where: { id } }),
    create: (data) => prisma.well.create({ data: data as Parameters<typeof prisma.well.create>[0]["data"] }),
    update: (id, data) =>
      prisma.well.update({ where: { id }, data: { ...data, version: { increment: 1 } } as Parameters<typeof prisma.well.update>[0]["data"] }),
    softDelete: (id) => prisma.well.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } }),
  },
  tank: {
    toPayload: (row) => tankRowToPayload(row as Parameters<typeof tankRowToPayload>[0]),
    toRowData: (payload) => tankToRowData(payload as Parameters<typeof tankToRowData>[0]),
    findUnique: (id) => prisma.tank.findUnique({ where: { id }, include: tankInclude }),
    create: (data) => prisma.tank.create({ data: data as Parameters<typeof prisma.tank.create>[0]["data"], include: tankInclude }),
    update: (id, data) =>
      prisma.tank.update({
        where: { id },
        data: { ...data, version: { increment: 1 } } as Parameters<typeof prisma.tank.update>[0]["data"],
        include: tankInclude,
      }),
    softDelete: (id) =>
      prisma.tank.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } }, include: tankInclude }),
  },
  treatmentSystem: {
    toPayload: (row) => treatmentSystemRowToPayload(row as Parameters<typeof treatmentSystemRowToPayload>[0]),
    toRowData: (payload) => treatmentSystemToRowData(payload as Parameters<typeof treatmentSystemToRowData>[0]),
    findUnique: (id) => prisma.treatmentSystem.findUnique({ where: { id }, include: treatmentSystemInclude }),
    create: (data) =>
      prisma.treatmentSystem.create({
        data: data as Parameters<typeof prisma.treatmentSystem.create>[0]["data"],
        include: treatmentSystemInclude,
      }),
    update: (id, data) =>
      prisma.treatmentSystem.update({
        where: { id },
        data: { ...data, version: { increment: 1 } } as Parameters<typeof prisma.treatmentSystem.update>[0]["data"],
        include: treatmentSystemInclude,
      }),
    softDelete: (id) =>
      prisma.treatmentSystem.update({
        where: { id },
        data: { deletedAt: new Date(), version: { increment: 1 } },
        include: treatmentSystemInclude,
      }),
  },
  treatmentWell: {
    toPayload: (row) => treatmentWellRowToPayload(row as Parameters<typeof treatmentWellRowToPayload>[0]),
    toRowData: (payload) => treatmentWellToRowData(payload as Parameters<typeof treatmentWellToRowData>[0]),
    findUnique: (id) => prisma.treatmentWell.findUnique({ where: { id } }),
    create: (data) => prisma.treatmentWell.create({ data: data as Parameters<typeof prisma.treatmentWell.create>[0]["data"] }),
    update: (id, data) =>
      prisma.treatmentWell.update({
        where: { id },
        data: { ...data, version: { increment: 1 } } as Parameters<typeof prisma.treatmentWell.update>[0]["data"],
      }),
    softDelete: (id) => prisma.treatmentWell.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } }),
  },
  parameterConfig: {
    toPayload: (row) => parameterConfigRowToShared(row as Parameters<typeof parameterConfigRowToShared>[0]),
    toRowData: (payload) => parameterConfigToRowData(payload as Parameters<typeof parameterConfigToRowData>[0]),
    findUnique: (id) => prisma.parameterConfig.findUnique({ where: { id } }),
    create: (data) =>
      prisma.parameterConfig.create({ data: data as Parameters<typeof prisma.parameterConfig.create>[0]["data"] }),
    update: (id, data) =>
      prisma.parameterConfig.update({
        where: { id },
        data: { ...data, version: { increment: 1 } } as Parameters<typeof prisma.parameterConfig.update>[0]["data"],
      }),
    softDelete: (id) =>
      prisma.parameterConfig.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } }),
  },
  fuelLensVisit: {
    toPayload: (row) => fuelLensVisitRowToPayload(row as Parameters<typeof fuelLensVisitRowToPayload>[0]),
    toRowData: (payload) => fuelLensVisitToRowData(payload as Parameters<typeof fuelLensVisitToRowData>[0]),
    findUnique: (id) => prisma.fuelLensVisit.findUnique({ where: { id } }),
    create: (data) =>
      prisma.fuelLensVisit.create({ data: data as Parameters<typeof prisma.fuelLensVisit.create>[0]["data"] }),
    update: (id, data) =>
      prisma.fuelLensVisit.update({
        where: { id },
        data: { ...data, version: { increment: 1 } } as Parameters<typeof prisma.fuelLensVisit.update>[0]["data"],
      }),
    softDelete: (id) =>
      prisma.fuelLensVisit.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } }),
  },
  sveSystemVisit: {
    toPayload: (row) => sveSystemVisitRowToPayload(row as Parameters<typeof sveSystemVisitRowToPayload>[0]),
    toRowData: (payload) => sveSystemVisitToRowData(payload as Parameters<typeof sveSystemVisitToRowData>[0]),
    findUnique: (id) => prisma.sveSystemVisit.findUnique({ where: { id } }),
    create: (data) =>
      prisma.sveSystemVisit.create({ data: data as Parameters<typeof prisma.sveSystemVisit.create>[0]["data"] }),
    update: (id, data) =>
      prisma.sveSystemVisit.update({
        where: { id },
        data: { ...data, version: { increment: 1 } } as Parameters<typeof prisma.sveSystemVisit.update>[0]["data"],
      }),
    softDelete: (id) =>
      prisma.sveSystemVisit.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } }),
  },
  bioVentingSystemVisit: {
    toPayload: (row) =>
      bioVentingSystemVisitRowToPayload(row as Parameters<typeof bioVentingSystemVisitRowToPayload>[0]),
    toRowData: (payload) =>
      bioVentingSystemVisitToRowData(payload as Parameters<typeof bioVentingSystemVisitToRowData>[0]),
    findUnique: (id) => prisma.bioVentingSystemVisit.findUnique({ where: { id } }),
    create: (data) =>
      prisma.bioVentingSystemVisit.create({
        data: data as Parameters<typeof prisma.bioVentingSystemVisit.create>[0]["data"],
      }),
    update: (id, data) =>
      prisma.bioVentingSystemVisit.update({
        where: { id },
        data: { ...data, version: { increment: 1 } } as Parameters<typeof prisma.bioVentingSystemVisit.update>[0]["data"],
      }),
    softDelete: (id) =>
      prisma.bioVentingSystemVisit.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } }),
  },
  groundwaterWell: {
    toPayload: (row) => groundwaterWellRowToPayload(row as Parameters<typeof groundwaterWellRowToPayload>[0]),
    toRowData: (payload) => groundwaterWellToRowData(payload as Parameters<typeof groundwaterWellToRowData>[0]),
    findUnique: (id) => prisma.groundwaterWell.findUnique({ where: { id } }),
    create: (data) =>
      prisma.groundwaterWell.create({ data: data as Parameters<typeof prisma.groundwaterWell.create>[0]["data"] }),
    update: (id, data) =>
      prisma.groundwaterWell.update({
        where: { id },
        data: { ...data, version: { increment: 1 } } as Parameters<typeof prisma.groundwaterWell.update>[0]["data"],
      }),
    softDelete: (id) =>
      prisma.groundwaterWell.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } }),
  },
  groundwaterVisit: {
    toPayload: (row) => groundwaterVisitRowToPayload(row as Parameters<typeof groundwaterVisitRowToPayload>[0]),
    toRowData: (payload) => groundwaterVisitToRowData(payload as Parameters<typeof groundwaterVisitToRowData>[0]),
    findUnique: (id) => prisma.groundwaterVisit.findUnique({ where: { id } }),
    create: (data) =>
      prisma.groundwaterVisit.create({ data: data as Parameters<typeof prisma.groundwaterVisit.create>[0]["data"] }),
    update: (id, data) =>
      prisma.groundwaterVisit.update({
        where: { id },
        data: { ...data, version: { increment: 1 } } as Parameters<typeof prisma.groundwaterVisit.update>[0]["data"],
      }),
    softDelete: (id) =>
      prisma.groundwaterVisit.update({ where: { id }, data: { deletedAt: new Date(), version: { increment: 1 } } }),
  },
};

function isPrismaUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === "P2002";
}

async function processEntry(entry: SyncPushEntry): Promise<SyncPushResult> {
  const handler = handlers[entry.entityType];
  if (!handler) {
    return { entityType: entry.entityType, entityId: entry.entityId, status: "error", message: "unknown entityType" };
  }

  try {
    if (entry.operation === "create") {
      const data = handler.toRowData(entry.payload);
      const row = await handler.create(data);
      return {
        entityType: entry.entityType,
        entityId: entry.entityId,
        status: "applied",
        version: row.version,
        updatedAt: row.updatedAt.toISOString(),
      };
    }

    const existing = await handler.findUnique(entry.entityId);
    if (!existing || existing.deletedAt) {
      return { entityType: entry.entityType, entityId: entry.entityId, status: "error", message: "entity not found" };
    }

    if (existing.version !== entry.baseVersion) {
      return {
        entityType: entry.entityType,
        entityId: entry.entityId,
        status: "conflict",
        version: existing.version,
        updatedAt: existing.updatedAt.toISOString(),
        serverPayload: handler.toPayload(existing),
      };
    }

    if (entry.operation === "update") {
      const { id: _id, ...data } = handler.toRowData(entry.payload);
      const row = await handler.update(entry.entityId, data);
      return {
        entityType: entry.entityType,
        entityId: entry.entityId,
        status: "applied",
        version: row.version,
        updatedAt: row.updatedAt.toISOString(),
      };
    }

    const row = await handler.softDelete(entry.entityId);
    return {
      entityType: entry.entityType,
      entityId: entry.entityId,
      status: "applied",
      version: row.version,
      updatedAt: row.updatedAt.toISOString(),
    };
  } catch (err) {
    if (isPrismaUniqueViolation(err)) {
      const existing = await handler.findUnique(entry.entityId);
      return {
        entityType: entry.entityType,
        entityId: entry.entityId,
        status: "conflict",
        version: existing?.version,
        updatedAt: existing?.updatedAt.toISOString(),
        serverPayload: existing ? handler.toPayload(existing) : undefined,
        message: "entity already exists",
      };
    }
    return {
      entityType: entry.entityType,
      entityId: entry.entityId,
      status: "error",
      message: err instanceof Error ? err.message : "unknown error",
    };
  }
}

function toPullEntity(entityType: SyncEntityType, row: SyncableRow, toPayload: (row: SyncableRow) => unknown): SyncPullEntity {
  return {
    entityType,
    entityId: row.id,
    version: row.version,
    updatedAt: row.updatedAt.toISOString(),
    deleted: !!row.deletedAt,
    payload: row.deletedAt ? null : toPayload(row),
  };
}

export const syncRouter = Router();

syncRouter.post("/sync/push", async (req, res) => {
  const entries = Array.isArray(req.body?.entries) ? (req.body.entries as SyncPushEntry[]) : [];
  const results: SyncPushResult[] = [];
  // Sequential on purpose: entries in one batch may touch the same row
  // (e.g. an update following a create), and version checks must see
  // each other's effects in order.
  for (const entry of entries) {
    results.push(await processEntry(entry));
  }
  res.json({ results });
});

syncRouter.get("/sync/pull", async (req, res) => {
  const sinceParam = req.query.since;
  const since = typeof sinceParam === "string" && sinceParam.length > 0 ? new Date(sinceParam) : undefined;
  const updatedAtFilter = since ? { updatedAt: { gt: since } } : {};
  const serverTime = new Date();

  const [
    clients,
    sites,
    wells,
    tanks,
    treatmentSystems,
    treatmentWells,
    parameterConfigs,
    fuelLensVisits,
    sveSystemVisits,
    bioVentingSystemVisits,
    groundwaterWells,
    groundwaterVisits,
  ] = await Promise.all([
    prisma.client.findMany({ where: updatedAtFilter }),
    prisma.site.findMany({ where: updatedAtFilter }),
    prisma.well.findMany({ where: updatedAtFilter }),
    prisma.tank.findMany({ where: updatedAtFilter, include: tankInclude }),
    prisma.treatmentSystem.findMany({ where: updatedAtFilter, include: treatmentSystemInclude }),
    prisma.treatmentWell.findMany({ where: updatedAtFilter }),
    prisma.parameterConfig.findMany({ where: updatedAtFilter }),
    prisma.fuelLensVisit.findMany({ where: updatedAtFilter }),
    prisma.sveSystemVisit.findMany({ where: updatedAtFilter }),
    prisma.bioVentingSystemVisit.findMany({ where: updatedAtFilter }),
    prisma.groundwaterWell.findMany({ where: updatedAtFilter }),
    prisma.groundwaterVisit.findMany({ where: updatedAtFilter }),
  ]);

  const entities: SyncPullEntity[] = [
    ...clients.map((row) => toPullEntity("client", row, handlers.client.toPayload)),
    ...sites.map((row) => toPullEntity("site", row, handlers.site.toPayload)),
    ...wells.map((row) => toPullEntity("well", row, handlers.well.toPayload)),
    ...tanks.map((row) => toPullEntity("tank", row, handlers.tank.toPayload)),
    ...treatmentSystems.map((row) => toPullEntity("treatmentSystem", row, handlers.treatmentSystem.toPayload)),
    ...treatmentWells.map((row) => toPullEntity("treatmentWell", row, handlers.treatmentWell.toPayload)),
    ...parameterConfigs.map((row) => toPullEntity("parameterConfig", row, handlers.parameterConfig.toPayload)),
    ...fuelLensVisits.map((row) => toPullEntity("fuelLensVisit", row, handlers.fuelLensVisit.toPayload)),
    ...sveSystemVisits.map((row) => toPullEntity("sveSystemVisit", row, handlers.sveSystemVisit.toPayload)),
    ...bioVentingSystemVisits.map((row) =>
      toPullEntity("bioVentingSystemVisit", row, handlers.bioVentingSystemVisit.toPayload),
    ),
    ...groundwaterWells.map((row) => toPullEntity("groundwaterWell", row, handlers.groundwaterWell.toPayload)),
    ...groundwaterVisits.map((row) => toPullEntity("groundwaterVisit", row, handlers.groundwaterVisit.toPayload)),
  ];

  const response: SyncPullResponse = { serverTime: serverTime.toISOString(), entities };
  res.json(response);
});
