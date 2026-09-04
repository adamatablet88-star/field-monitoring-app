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
IndexedDB בלקוח — ראו `docs/architecture.md`). אין עדיין מסך הקמת אתר,
טפסי שטח, או התחברות אמיתית — ראו `docs/roadmap.md`.

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

שלבים 1–2 ב-roadmap הושלמו: שלד הפרויקט (מונורפו, טיפוסים משותפים, שרת
Express+Prisma, לקוח React+Vite עם IndexedDB) **וסנכרון בסיסי בין הלקוח
לשרת** — כתיבה אופטימית + תור (`outbox`), `POST /sync/push` ו-
`GET /sync/pull` עם זיהוי קונפליקטים מבוסס גרסאות (ללא ממשק פתרון
קונפליקטים מלא עדיין). נבדק מקצה-לקצה מול Postgres ובדפדפן אמיתיים.
השלב הבא (ראו [roadmap](docs/roadmap.md)) הוא מסך הקמת אתר/קידוחים/
מערכות (Admin).
