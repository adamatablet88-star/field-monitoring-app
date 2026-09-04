import type { SyncEntityType, SyncOperation } from "@field-monitoring/shared";

export const ENTITY_TYPE_LABELS: Record<SyncEntityType, string> = {
  client: "לקוח",
  site: "אתר",
  well: "קידוח (עדשת דלק)",
  tank: "מיכל",
  treatmentSystem: "מערכת טיפול",
  treatmentWell: "קידוח במערכת טיפול",
  parameterConfig: "פרמטר",
  fuelLensVisit: "ביקור עדשת דלק",
  sveSystemVisit: "ביקור SVE",
  bioVentingSystemVisit: "ביקור Bio-venting",
  groundwaterWell: "קידוח ניטור מי תהום",
  groundwaterVisit: "ביקור דיגום מי תהום",
};

export const OPERATION_LABELS: Record<SyncOperation, string> = {
  create: "יצירה",
  update: "עדכון",
  delete: "מחיקה",
};
