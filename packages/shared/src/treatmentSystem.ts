import type { WellIdentity } from "./identity.js";

export type SystemType = "SVE" | "bioVenting";
export type CriticalDirection = "none" | "above" | "below";

/**
 * Generic dynamic parameter configuration engine, shared by SVE and
 * Bio-venting systems. In addition to the normal soft-warning range, each
 * parameter can carry its own critical-threshold layer — PID > 50ppm after
 * treatment is the default instance of this mechanism, not a hardcoded
 * rule. See docs/data-model.md section 8.
 *
 * Synced as its own entity (see packages/shared/src/sync.ts) so an admin
 * can edit one parameter without touching the whole TreatmentSystem —
 * hence the systemId back-reference, mirroring TreatmentWell.
 */
export interface ParameterConfig {
  id: string;
  systemId: string;
  label: string;
  unit: string;
  minValue: number | null;
  maxValue: number | null;
  required: boolean;
  order: number;

  criticalDirection: CriticalDirection;
  criticalValue: number | null;
  criticalMessage: string;
}

export interface TreatmentSystem {
  id: string;
  siteId: string;
  systemType: SystemType;
  /**
   * For SVE this is a system-size value like "300 CFM" / "600 CFM"; for
   * Bio-venting it's a free-form system name (e.g. "מערכת המלאכה"). The
   * data model keeps a single text field — only the form/validation
   * differ by systemType.
   */
  systemLabel: string;
  parameters: ParameterConfig[];
}

export type TreatmentWellType = "treatment" | "monitoring" | "groundwater";

/**
 * Wells under a treatment system are NOT split into separate tables —
 * one unified table per system, discriminated by wellType.
 *   treatment   — connected to the manifold/extraction
 *   monitoring  — monitoring well (e.g. from a pilot installation)
 *   groundwater — groundwater monitoring well for impact assessment
 *                 (screened interval in the unsaturated zone, above the water table)
 */
export interface TreatmentWell extends WellIdentity {
  systemId: string;
  wellType: TreatmentWellType;
}
