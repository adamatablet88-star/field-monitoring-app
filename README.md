# אפליקציית ניטור שטח — ייעוץ סביבתי

אפליקציה לאיסוף נתוני שטח עבור ייעוץ סביבתי: ניטור עדשת דלק, מערכות טיפול
(SVE / Bio-venting) ודיגום מי תהום.

## מבנה המאגר

Monorepo מבוסס npm workspaces:

```
packages/shared   מקור האמת היחיד למודל הנתונים (TypeScript), משותף ל-client ול-server
apps/server        Node.js + TypeScript + Express + Prisma (PostgreSQL)
apps/client        React + TypeScript + Vite, PWA, מסד מקומי (IndexedDB) דרך Dexie.js
```

### הרצה מקומית

```bash
npm install
npm run build:shared        # חובה לפני הרצת client/server — הם תלויים ב-dist הבנוי

# server
cp apps/server/.env.example apps/server/.env   # ולהגדיר DATABASE_URL אמיתי
cd apps/server && npx prisma migrate dev && cd ../..
npm run dev:server

# client (בטרמינל נפרד)
cp apps/client/.env.example apps/client/.env   # ברירת המחדל כבר מצביעה ל-localhost:3001
npm run dev:client
```

השרת חושף `/health` ו-`/sync/push` + `/sync/pull` (סנכרון בסיסי מול
IndexedDB בלקוח — ראו `docs/architecture.md`). הלקוח כולל שני טאבים:
"טפסי שטח" (כרגע: ביקורי עדשת דלק) ו-"הקמת אתר" (לקוחות/אתרים/קידוחים/
מיכלים/מערכות טיפול/פרמטרים). אין עדיין התחברות אמיתית — ראו
`docs/roadmap.md`.

## מסמכי תכנון

| מסמך | תוכן |
|---|---|
| [docs/architecture.md](docs/architecture.md) | עקרונות ארכיטקטוניים, מחסנית טכנולוגית, Offline-first, סנכרון והרשאות |
| [docs/data-model.md](docs/data-model.md) | הישויות המרכזיות ומבנה הנתונים המלא (TypeScript) |
| [docs/business-logic.md](docs/business-logic.md) | לוגיקה עסקית, זרימות עבודה ומדיניות ולידציה לכל מודול |
| [docs/roadmap.md](docs/roadmap.md) | מה קיים היום, מה עדיין לא נבנה, וסדר הפיתוח המומלץ |

## מקורות

התכנון מבוסס על שלושה מסמכי מקור:

1. **מסמך הנחיות פיתוח לקלוד קוד** — מסמך ההנחיות המקורי (כולל סעיף 7,
   "תוספת הבהרות", שנוסף בסבב הבהרות).
2. **מסמך סיכום תכנון (Team Summary)** — ריכוז ההחלטות המפורט מהצוות.
3. סבב הבהרות נוסף: תעודת זהות מלאה לקידוח (Z, שוחה, מקטע מחורץ), מבנה
   `wellType` אחיד לקידוחים תחת מערכת טיפול, מנגנון סף קריטי גנרי,
   וההבחנה בין שם מערכת ב-SVE לעומת Bio-venting.

## סטטוס

שלבים 1–4 ב-roadmap הושלמו: שלד הפרויקט, סנכרון בסיסי (outbox + push/
pull עם זיהוי קונפליקטים מבוסס גרסאות), מסך הקמת אתר מלא (לקוחות,
אתרים, קידוחי עדשת דלק, מיכלים, מערכות טיפול ומנוע הפרמטרים הגמיש), וטופס
שטח מלא לניטור עדשת דלק (חישוב עובי עדשה חי, "לא נמדד", תת-טפסים לפי
אמצעי הפינוי כולל ההצעה האוטומטית לסקימר פאסיבי, פינוי דלק, וניווט "הבא"
בין קידוחים). כל הכתיבה — גם הקמת אתר וגם ביקורי שטח — עוברת דרך אותו
מנגנון סנכרון offline-first. נבדק מקצה-לקצה בדפדפן אמיתי מול Postgres
אמיתי; תוך כדי הבדיקה נמצא ותוקן באג אמיתי בתשתית הסנכרון (ראו
`docs/roadmap.md`). השלב הבא הוא טופסי SVE ו-Bio-venting.
