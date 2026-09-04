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
