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
  frequencySetting: "הגדרת תדירות",
  activeStatus: "סטטוס פעיל/לא-פעיל",
  regulatoryReport: "דוח רגולטורי",
  scheduledSpecialTest: "בדיקה מיוחדת מתוזמנת",
};

export const OPERATION_LABELS: Record<SyncOperation, string> = {
  create: "יצירה",
  update: "עדכון",
  delete: "מחיקה",
};
