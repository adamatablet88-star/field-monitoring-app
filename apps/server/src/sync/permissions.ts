import type { SyncEntityType, SyncOperation } from "@field-monitoring/shared";
import type { AuthTokenPayload } from "../auth/jwt.js";

const ADMIN_ONLY_ENTITY_TYPES = new Set<SyncEntityType>([
  "client",
  "site",
  "tank",
  "treatmentSystem",
  "parameterConfig",
  "frequencySetting",
  "regulatoryReport",
  "scheduledSpecialTest",
]);
const WELL_ENTITY_TYPES = new Set<SyncEntityType>(["well", "treatmentWell", "groundwaterWell"]);
export const VISIT_ENTITY_TYPES = new Set<SyncEntityType>([
  "fuelLensVisit",
  "sveSystemVisit",
  "bioVentingSystemVisit",
  "groundwaterVisit",
]);
/**
 * A technician can report a well/system as active or inactive from a real
 * visit finding, same as an admin can override it manually — the
 * `source` field records which (stamped server-side, see router.ts's
 * stampSource) — per docs/business-logic.md 5.2. Free create/update for
 * both roles; nobody deletes a status record (an update supersedes it).
 */
const TECHNICIAN_WRITABLE_ENTITY_TYPES = new Set<SyncEntityType>(["activeStatus"]);

export interface OwnedRow {
  createdBy?: string | null;
  createdAt?: Date;
}

export interface PermissionResult {
  allowed: boolean;
  message?: string;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

/**
 * RBAC per docs/architecture.md's role table: admin has full structural
 * control (builds/edits sites, wells and systems; edits any historical
 * data); a technician fills visits and can only update an existing
 * well's status (never create/delete one), and may only edit or delete
 * a visit they created themselves, the same day it was created.
 */
export function checkPermission(
  entityType: SyncEntityType,
  operation: SyncOperation,
  user: AuthTokenPayload,
  existing: OwnedRow | null,
): PermissionResult {
  if (user.role === "admin") return { allowed: true };

  if (ADMIN_ONLY_ENTITY_TYPES.has(entityType)) {
    return { allowed: false, message: "פעולה זו מוגבלת למנהל בלבד" };
  }

  if (WELL_ENTITY_TYPES.has(entityType)) {
    if (operation !== "update") {
      return { allowed: false, message: "יצירה ומחיקה של קידוחים מוגבלות למנהל בלבד" };
    }
    return { allowed: true };
  }

  if (TECHNICIAN_WRITABLE_ENTITY_TYPES.has(entityType)) {
    if (operation === "delete") {
      return { allowed: false, message: "מחיקה מוגבלת למנהל בלבד" };
    }
    return { allowed: true };
  }

  if (VISIT_ENTITY_TYPES.has(entityType)) {
    if (operation === "create") return { allowed: true };
    if (!existing?.createdBy || existing.createdBy !== user.sub) {
      return { allowed: false, message: "ניתן לערוך רק ביקורים שיצרת בעצמך" };
    }
    if (!existing.createdAt || !isSameCalendarDay(existing.createdAt, new Date())) {
      return { allowed: false, message: "ניתן לערוך ביקור רק באותו היום שבו נוצר" };
    }
    return { allowed: true };
  }

  return { allowed: false, message: "סוג ישות לא מוכר" };
}
