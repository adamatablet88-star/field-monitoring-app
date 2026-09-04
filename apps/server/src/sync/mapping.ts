import type {
  Client as ClientRow,
  Site as SiteRow,
  Well as WellRow,
  Tank as TankRow,
  TreatmentSystem as TreatmentSystemRow,
  TreatmentWell as TreatmentWellRow,
  ParameterConfig as ParameterConfigRow,
  FuelLensVisit as FuelLensVisitRow,
} from "@prisma/client";
import type {
  Client,
  Site,
  Well,
  Tank,
  TreatmentSystem,
  TreatmentWell,
  ParameterConfig,
  FuelLensVisit,
} from "@field-monitoring/shared";

// Row -> shared-type payload (what the client sees over the wire).

export function clientRowToPayload(row: ClientRow): Client {
  return { id: row.id, name: row.name };
}

export function siteRowToPayload(row: SiteRow): Site {
  return {
    id: row.id,
    clientId: row.clientId,
    name: row.name,
    location: row.location as Site["location"],
    protocolTypes: row.protocolTypes as Site["protocolTypes"],
  };
}

export function wellRowToPayload(row: WellRow): Well {
  return {
    id: row.id,
    siteId: row.siteId,
    code: row.code,
    x: row.x,
    y: row.y,
    z: row.z,
    manhole: { material: row.manholeMaterial as Well["manhole"]["material"], size: row.manholeSize },
    wellDepth: row.wellDepth,
    wellDiameter: row.wellDiameter,
    screenInterval: { from: row.screenFrom, to: row.screenTo },
    recoveryMethod: row.recoveryMethod as Well["recoveryMethod"],
    tankId: row.tankId ?? undefined,
  };
}

export function tankRowToPayload(row: TankRow & { wells?: { id: string }[] }): Tank {
  return {
    id: row.id,
    siteId: row.siteId,
    label: row.label,
    wellIds: (row.wells ?? []).map((w) => w.id),
  };
}

export function parameterConfigRowToShared(row: ParameterConfigRow): ParameterConfig {
  return {
    id: row.id,
    systemId: row.systemId,
    label: row.label,
    unit: row.unit,
    minValue: row.minValue,
    maxValue: row.maxValue,
    required: row.required,
    order: row.order,
    criticalDirection: row.criticalDirection as ParameterConfig["criticalDirection"],
    criticalValue: row.criticalValue,
    criticalMessage: row.criticalMessage,
  };
}

export function treatmentSystemRowToPayload(
  row: TreatmentSystemRow & { parameters?: ParameterConfigRow[] },
): TreatmentSystem {
  return {
    id: row.id,
    siteId: row.siteId,
    systemType: row.systemType as TreatmentSystem["systemType"],
    systemLabel: row.systemLabel,
    parameters: (row.parameters ?? []).map(parameterConfigRowToShared),
  };
}

export function treatmentWellRowToPayload(row: TreatmentWellRow): TreatmentWell {
  return {
    id: row.id,
    systemId: row.systemId,
    code: row.code,
    x: row.x,
    y: row.y,
    z: row.z,
    manhole: { material: row.manholeMaterial as TreatmentWell["manhole"]["material"], size: row.manholeSize },
    wellDepth: row.wellDepth,
    wellDiameter: row.wellDiameter,
    screenInterval: { from: row.screenFrom, to: row.screenTo },
    wellType: row.wellType as TreatmentWell["wellType"],
  };
}

// FuelLensVisit stores its full shape in the `data` JSON column (see
// docs/data-model.md section 9) — id/wellId/visitDate columns exist for
// indexing/relations, but `data` is the single source of truth for the
// payload, so there's nothing to reassemble here.
export function fuelLensVisitRowToPayload(row: FuelLensVisitRow): FuelLensVisit {
  return row.data as unknown as FuelLensVisit;
}

// Shared-type payload -> Prisma scalar column data (for create/update).

export function clientToRowData(payload: Client) {
  return { id: payload.id, name: payload.name };
}

export function siteToRowData(payload: Site) {
  return {
    id: payload.id,
    clientId: payload.clientId,
    name: payload.name,
    location: payload.location as object,
    protocolTypes: payload.protocolTypes,
  };
}

export function wellToRowData(payload: Well) {
  return {
    id: payload.id,
    siteId: payload.siteId,
    code: payload.code,
    x: payload.x,
    y: payload.y,
    z: payload.z,
    manholeMaterial: payload.manhole.material,
    manholeSize: payload.manhole.size,
    wellDepth: payload.wellDepth,
    wellDiameter: payload.wellDiameter,
    screenFrom: payload.screenInterval.from,
    screenTo: payload.screenInterval.to,
    recoveryMethod: payload.recoveryMethod,
    tankId: payload.tankId ?? null,
  };
}

export function tankToRowData(payload: Tank) {
  return {
    id: payload.id,
    siteId: payload.siteId,
    label: payload.label,
    // wellIds is derived from Well.tankId, not stored on Tank itself.
  };
}

export function treatmentSystemToRowData(payload: TreatmentSystem) {
  return {
    id: payload.id,
    siteId: payload.siteId,
    systemType: payload.systemType,
    systemLabel: payload.systemLabel,
    // parameters sync as their own entity (see parameterConfigToRowData) —
    // this row's scalar columns don't carry them.
  };
}

export function parameterConfigToRowData(payload: ParameterConfig) {
  return {
    id: payload.id,
    systemId: payload.systemId,
    label: payload.label,
    unit: payload.unit,
    minValue: payload.minValue,
    maxValue: payload.maxValue,
    required: payload.required,
    order: payload.order,
    criticalDirection: payload.criticalDirection,
    criticalValue: payload.criticalValue,
    criticalMessage: payload.criticalMessage,
  };
}

export function treatmentWellToRowData(payload: TreatmentWell) {
  return {
    id: payload.id,
    systemId: payload.systemId,
    code: payload.code,
    x: payload.x,
    y: payload.y,
    z: payload.z,
    manholeMaterial: payload.manhole.material,
    manholeSize: payload.manhole.size,
    wellDepth: payload.wellDepth,
    wellDiameter: payload.wellDiameter,
    screenFrom: payload.screenInterval.from,
    screenTo: payload.screenInterval.to,
    wellType: payload.wellType,
  };
}

export function fuelLensVisitToRowData(payload: FuelLensVisit) {
  return {
    id: payload.id,
    wellId: payload.wellId,
    visitDate: new Date(payload.visitDate),
    data: payload as unknown as object,
  };
}
