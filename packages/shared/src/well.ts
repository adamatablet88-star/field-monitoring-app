import type { WellIdentity } from "./identity.js";

export type RecoveryMethod = "none" | "passive_skimmer" | "absorbent" | "active_skimmer";

/** A fuel-lens monitoring well, standalone (not under a treatment system). */
export interface Well extends WellIdentity {
  siteId: string;
  recoveryMethod: RecoveryMethod;
  /** Only meaningful when recoveryMethod === "active_skimmer". */
  tankId?: string;
}

/** A shared collection tank fed by an active skimmer, many-to-one from wells. */
export interface Tank {
  id: string;
  siteId: string;
  label: string;
  wellIds: string[];
}

/**
 * A standalone groundwater-monitoring well, scoped to a site rather than
 * a treatment system — a site can run a groundwater sampling program
 * (docs/business-logic.md section 4) independently of whether it also
 * has an SVE/Bio-venting system.
 */
export interface GroundwaterWell extends WellIdentity {
  siteId: string;
}
