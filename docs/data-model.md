# מודל הנתונים

מודל זה משלב את כל ההחלטות ממסמך ההנחיות, מסמך סיכום התכנון, וסבב
ההבהרות הנוסף (תעודת זהות מלאה לקידוח, `wellType` אחיד, סף קריטי גנרי,
הבדל `systemLabel`/`systemType`).

## 1. ישויות-על

```
Client (חברת דלק) ──< Site ──< Well (עדשת דלק)
                        │  ├──< Tank (מיכל משותף, many-to-one מ-Well)
                        │  └──< GroundwaterWell (ניטור מי תהום, עצמאי ברמת האתר)
                        └──< TreatmentSystem (SVE / Bio-venting)
                                └──< TreatmentWell (wellType: treatment|monitoring|groundwater)
```

`GroundwaterWell` (סעיף 9.4) נוסף כישות עצמאית ברמת האתר בסבב המימוש —
אתר יכול להריץ תוכנית דיגום מי תהום גם בלי SVE/Bio-venting. קידוח תחת
מערכת טיפול עם `wellType === "groundwater"` ממשיך להתקיים במודל לקידוחי
השפעה תחת מערכת ספציפית, אך אינו מקושר למסך הטופס בשלב זה.

## 2. תעודת זהות פיזית משותפת לקידוח

לכל קידוח — הן קידוח עדשת דלק עצמאי והן קידוח תחת מערכת טיפול — יש
"תעודת זהות" פיזית קבועה שאינה משתנה בין ביקורים (בניגוד לאמצעי הפינוי
או לקונפיג הטיפול, שמתעדכנים מהשטח):

```ts
interface WellIdentity {
  id: string;
  code: string;               // שם/מספר הקידוח, למשל "S-1"
  x: number;
  y: number;
  z: number;                  // גובה/רום — נשמר בנפרד מ-X ו-Y
  manhole: {
    material: "concrete" | "iron";   // שוחה: בטון / ברזל
    size: string;                    // מידה חופשית, למשל '70 ס"מ' או '10 אינץ׳'
  };
  wellDepth: number;           // עומק קידוח (מ')
  wellDiameter: number;        // קוטר קידוח
  screenInterval: {
    from: number;               // עומק התחלת מקטע מחורץ (מ')
    to: number;                 // עומק סיום מקטע מחורץ (מ')
  };
}
```

## 3. אתר (Site)

```ts
interface Site {
  id: string;
  clientId: string;            // לקוח (חברת דלק)
  name: string;
  location: { lat: number; lng: number } | string;
  protocolTypes: Array<"fuelLens" | "SVE" | "bioVenting" | "groundwater">;
  // אתר "משולב" יכול להכיל כמה סוגי פרוטוקול במקביל
}
```

## 4. קידוח עדשת דלק (Well)

```ts
type RecoveryMethod = "none" | "passive_skimmer" | "absorbent" | "active_skimmer";

interface Well extends WellIdentity {
  siteId: string;
  recoveryMethod: RecoveryMethod;
  tankId?: string;              // רלוונטי רק כש-recoveryMethod === "active_skimmer"
}
```

## 5. מיכל איסוף משותף (Tank)

```ts
interface Tank {
  id: string;
  siteId: string;
  label: string;                // למשל "NW-2 + A"
  wellIds: string[];             // מיפוי many-to-one: כמה קידוחים לאותו מיכל
}
```

## 6. מערכת טיפול (TreatmentSystem)

```ts
type SystemType = "SVE" | "bioVenting";

interface TreatmentSystem {
  id: string;
  siteId: string;
  systemType: SystemType;
  // ההבדל בין SVE ל-Bio-venting הוא רק באופן הצגת/ולידציית השדה, לא במודל:
  //   SVE         -> ערך קבוע-מבנה: "300 CFM" / "600 CFM" (גודל מערכת)
  //   bioVenting  -> שם חופשי, למשל "מערכת המלאכה" (ללא פורמט CFM)
  systemLabel: string;
  parameters: ParameterConfig[];  // מנוע קונפיגורציה גמיש, ראו סעיף 8
}
```

טופס/ולידציית `systemLabel` מוצגים אחרת ב-UI לפי `systemType`
(placeholder ותווית שדה שונים), אך בשכבת הנתונים זהו שדה טקסט יחיד בשני
המקרים.

## 7. קידוח תחת מערכת טיפול (TreatmentWell)

קידוחים תחת SVE/Bio-venting **אינם** מחולקים לקבוצות נפרדות במבנה
הנתונים — טבלה אחודה אחת לכל מערכת, עם שדה `wellType`:

```ts
type TreatmentWellType = "treatment" | "monitoring" | "groundwater";

interface TreatmentWell extends WellIdentity {
  systemId: string;
  wellType: TreatmentWellType;
  // treatment   — קידוח טיפול (מחובר לסעפת/לשאיבה)
  // monitoring  — קידוח ניטור (למשל מהתקנת פיילוט)
  // groundwater — קידוח ניטור מי תהום להערכת השפעה
  //               (מקטע מחורץ בתווך הבלתי רווי, מעל פני המים)
}
```

## 8. מנוע קונפיגורציה פרמטרי גמיש

משותף ל-SVE, ל-Bio-venting (ברמת מערכת ופר-נקודת ניטור), ומרחיב את
הרעיון גם לסף קריטי גנרי (לא רק PID):

```ts
type CriticalDirection = "none" | "above" | "below";

interface ParameterConfig {
  id: string;
  systemId: string;              // סונכרן כישות עצמאית משלו — ראו סעיף 9
  label: string;                 // שם המד
  unit: string;                  // יחידת מידה
  minValue: number | null;       // טווח תקין — להצגת הקשר בלבד (Soft Warning)
  maxValue: number | null;
  required: boolean;
  order: number;                 // סדר תצוגה

  // סף קריטי גנרי — נפרד לגמרי מהטווח התקין הרגיל:
  criticalDirection: CriticalDirection;
  criticalValue: number | null;
  criticalMessage: string;       // הטקסט שמוצג בבאנר הקריטי (לא הודעה גנרית)
}
```

חציית סף קריטי מציגה **באנר קריטי קבוע** עם `criticalMessage` הספציפי
לאותו פרמטר. "PID אחרי טיפול מעל 50 ppm" הוא **מופע ברירת מחדל** של
המנגנון הזה —
`{ criticalDirection: "above", criticalValue: 50, criticalMessage: "יש להתקשר מיידית למפקח" }`
— ולא חוק קשיח נפרד בקוד, כדי שכל מד עתידי (לא רק PID) יוכל לקבל סף
קריטי משלו ללא שינוי קוד.

## 9. רשומות ביקור (Visit records)

כל ביקור נשמר כרשומה נפרדת פר-פרוטוקול, מקושרת לקידוח/מערכת ולתאריך.

### 9.1 ביקור עדשת דלק (`FuelLensVisit`)

```ts
type NotMeasuredReason = "valve_closed" | "access_blocked" | "equipment_fault" | "other";
type EvacuationMethod = "skimmer" | "bailer" | "external_pump" | "other";

interface FuelLensVisit {
  id: string;
  wellId: string;
  visitDate: string;
  waterDepth: number | null;         // מ' מראש הקידוח (TOC)
  productDepth: number | null;       // עומק מוצר צף
  lensThickness: number | null;      // מחושב חי: waterDepth - productDepth
  notMeasured: { flag: boolean; reason: NotMeasuredReason | null };
  wellBottomDepth?: number;          // נמדד רק מדי פעם

  // רלוונטי לפי recoveryMethod של הקידוח:
  skimmerCheck?: {
    found: "empty" | "fuel_only" | "fuel_and_water";
    fuelAmount?: number;
    waterAmount?: number;
    autoSuggestedReason?: "not_calibrated" | "level_below_skimmer"; // כשעדשה קיימת + סקימר ריק
    recalibrated: boolean;
  };
  absorbentCheck?: { condition: string; replaced: boolean };

  evacuations: Array<{ method: EvacuationMethod; liters: number }>; // רשימה, אפס-או-יותר

  tankReading?: {                    // רלוונטי לסקימר אקטיבי בלבד
    currentVolume: number;
    emptiedSincePrevious: boolean;   // מתאפס בכל "רוקן=כן"
  };

  photos?: string[];
}
```

### 9.2 ביקור מערכת SVE

```ts
type SveVisitType = "small" | "large" | "baseline";

interface SveSystemVisit {
  id: string;
  systemId: string;
  visitDate: string;
  visitType: SveVisitType;           // טיפול קטן / גדול / Baseline

  statusOnArrival: "running" | "off";
  startupAttempt?: { succeeded: boolean; faultFlagged: boolean }; // דגל בממשק בלבד, ללא ערוץ התרעה פעיל בשלב זה

  operatingHours?: number;
  catalystTemp?: { inlet: number; internal: number; outlet: number };

  manifold: Array<{ wellId: string; openPercent: number }>; // "הכל ללא שינוי" ממלא מהביקור הקודם

  vacuumOverall: number;             // מאוחסן כערך שלילי; הטכנאי מזין חיובי, המרה אוטומטית
  flowOverall: number;
  vacuumMoistureSeparator: number;

  vcv: 1 | 2 | 3 | 4 | 5;            // 1=אטמוספרה בלבד, 5=קידוחים בלבד
  catalyticConverterInlet?: { pressure: number; temp: number }; // רק בחלק מהמערכות

  pidBeforeConverter: number;
  pidAfterConverter: number;         // ולידציה: criticalDirection="above", criticalValue=50 (ברירת מחדל)
  efficiencyPercent: number;         // מחושב אוטומטית

  to15?: { done: boolean; date: string; canisterNumber: string; sampleTime: string }; // ללא תוצאה מספרית
}

interface SveWellVisit {              // רק בטיפול גדול, לכל TreatmentWell מסוג "treatment"
  id: string;
  systemVisitId: string;
  treatmentWellId: string;
  vacuum?: { value: number; notMeasured?: { flag: boolean; reason: NotMeasuredReason } };
  pid?: { value: number; notMeasured?: { flag: boolean; reason: NotMeasuredReason } };
  waterDepth?: { value: number; notMeasured?: { flag: boolean; reason: NotMeasuredReason } };
  productDepth?: { value: number; notMeasured?: { flag: boolean; reason: NotMeasuredReason } };
  bottomDepth?: { value: number; notMeasured?: { flag: boolean; reason: NotMeasuredReason } };
  // כל השדות לא-חובה לפי שיקול דעת הטכנאי, באותה מדיניות "לא נמדד + סיבה"
}
```

### 9.3 ביקור מערכת Bio-venting

```ts
interface BioVentingSystemVisit {
  id: string;
  systemId: string;
  visitDate: string;

  statusOnArrival: "working" | "not_working";
  filterStatus: "checked_ok" | "cleaned_now" | "recommend_replace"; // recommend_replace -> דגל למנהל, הצגה בלבד

  vacuumIntakeLine: number;
  flowOverall: number;
  pressureOverall: number;

  wells: Array<{ wellId: string; openPercent: number }>; // בד"כ 100%, "הכל ללא שינוי"
  dilutionValvePercent: number;      // המקבילה של VCV, אך באחוזים

  annualOxygenTest?: { done: boolean; date: string }; // ללא נתוני זמן-אמת מפורטים
}

interface MonitoringPointReading {
  id: string;
  systemVisitId: string;
  pointCode: string;                 // למשל "S-1"
  depths: Array<{                    // מספר עומקים משתנה פר-נקודה, קונפיג גמיש
    depth: number;
    o2: number;
    co2: number;
    ch4: number;
    pid: number;
    vacuum: number;
  }>;
}
```

### 9.4 דיגום מי תהום (`GroundwaterVisit`)

```ts
interface GroundwaterWell extends WellIdentity {
  siteId: string;                    // עצמאי ברמת האתר — לא תחת מערכת טיפול
}

interface WellCondition {
  capIntegrity: "ok" | "not_ok";
  casingIntegrity: "ok" | "not_ok";
}

interface StabilizationReading {
  sequence: number;                  // שורה בלוג
  temp: number;                      // נרשם, ללא קריטריון ייצוב
  ph: number;                        // קריטריון: ± 0.1 יחידות
  redox: number;                     // ± 10 mV
  ec: number;                        // מוליכות, ± 3%
  turbidity: number;                 // ± 10% (כשעכירות מעל 10 NTU)
  dissolvedOxygen: number;           // ± 0.3 מ"ג/ל
}

interface GroundwaterVisit {
  id: string;
  wellId: string;                    // GroundwaterWell.id
  visitDate: string;
  condition: WellCondition;
  waterDepth: number;
  productLens?: { present: boolean; thickness: number };

  wellVolume: number;                // מחושב אוטומטית מעומק וקוטר הקידוח
  suggestedSamplingDepth: number;    // ברירת מחדל: מפלס מים + 1 מ', ניתן לעריכה ידנית

  stabilizationLog: StabilizationReading[]; // כלל ייצוב: 3 קריאות רצופות בטווח לכל הפרמטרים בעלי קריטריון

  labTests: string[];                // VOC, מתכות, TPH, PFAS, אניונים... — נבחר בכל ביקור, לא רשימה קבועה
  // כלי הדיגום/קיבוע לכל בדיקה נגזר אוטומטית מ-labTests (טבלת מיפוי קבועה, לא קלט)

  photos?: string[];                 // פני הבאר, הקידוח/מתחם, מדבקה, פרופיל נוזל בתחילה/סוף, כלי הדיגום
}
```

## 10. ניהול תדירויות ומעקב רגולטורי

ממומש (roadmap שלב 9). `FrequencyValue` הוא קבוצה סגורה (לא טקסט חופשי) —
כדי שמסך "מה נדרש החודש" יוכל לחשב תאריך יעד במקום לפרש מחרוזת עברית:

```ts
type FrequencyValue = "monthly" | "quarterly" | "semiannual" | "annual";

interface FrequencySetting {
  id: string;
  scope: { siteId: string } | { systemId: string };
  defaultFrequency: FrequencyValue;  // ברירת מחדל שנתית לפי חוזה, ניתנת לעדכון תוך כדי השנה
  currentFrequency: FrequencyValue;
  history: Array<{ changedBy: string; changedAt: string; reason: string; previousValue: FrequencyValue }>; // Audit Trail
}

interface ActiveStatus {
  id: string;
  scope: { siteId: string } | { systemId: string };
  active: boolean;
  source: "technician" | "admin";    // מקור הסימון
  reason: string;
}

interface RegulatoryReport {
  id: string;
  siteId: string;
  type: "fuel_lens" | "treatment_systems";  // רבעוני / חצי-שנתי בהתאמה
  period: string;
  status: "not_started" | "in_progress" | "submitted";
}

interface ScheduledSpecialTest {
  id: string;
  scope: { systemId: string };
  testType: "TO-15" | "annual_oxygen_consumption";
  frequency: "quarterly" | "semiannual" | "annual"; // TO-15: רבעוני ב-SVE, שנתי ב-BV; מבחן חמצן: שנתי ב-BV בלבד
}
```

## 11. הרשאות

```ts
type Role = "admin" | "technician";

interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: Role;
}
```

ממומש ואכוף בפועל (roadmap שלב 7): `PublicUser` (ללא `passwordHash`)
הוא מה שחוזר מ-`POST /auth/login` ומ-`GET /auth/users` —
`packages/shared/src/auth.ts`. אכיפת ה-RBAC בפועל
(`apps/server/src/sync/permissions.ts`) מבוססת על `createdBy`/
`createdAt` שנוספו לארבע טבלאות הביקור בשרת בלבד (כמו `version`/
`updatedAt`/`deletedAt` — לא בטיפוסים המשותפים), נקבעים תמיד מהמשתמש
המאומת בזמן היצירה ולא מגוף הבקשה.

## 12. מדיניות ולידציה — סיכום גורף

| עיקרון | החלטה |
|---|---|
| חומרת ולידציה | Soft Warning בלבד — לעולם לא חוסם שמירה בשטח |
| שדה "לא נמדד" | טוגל + סיבה מרשימה סגורה |
| שדות מחושבים | תצוגה חיה (Live) תוך כדי הקלדה |
| וואקום (SVE/BV) | מאוחסן כערך שלילי; הטכנאי מזין גודל חיובי; המרה אוטומטית |
| סף קריטי (כולל PID) | מנגנון גנרי פר-פרמטר (`criticalDirection`/`criticalValue`/`criticalMessage`), באנר קריטי קבוע |
| סטייה מהביקור הקודם | טווח קבוע פר-שדה (לא אחוז גלובלי אחיד) |
| הקשר היסטורי | לצד כל שדה מספרי — תמצית טקסטואלית: מינ׳/מקס׳/ממוצע 6 חודשים אחרונים |
