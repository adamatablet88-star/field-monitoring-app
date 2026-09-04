/**
 * Physical identity fields shared by every well, whether it stands alone
 * (fuel lens monitoring) or sits under a treatment system. These fields
 * are fixed at construction time and do not change between visits — see
 * docs/data-model.md section 2.
 */
export interface WellIdentity {
  id: string;
  code: string;
  x: number;
  y: number;
  z: number;
  manhole: {
    material: "concrete" | "iron";
    size: string;
  };
  wellDepth: number;
  wellDiameter: number;
  screenInterval: {
    from: number;
    to: number;
  };
}
