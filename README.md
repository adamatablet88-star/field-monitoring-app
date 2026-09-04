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
cp apps/server/.env.example apps/server/.env   # להגדיר DATABASE_URL אמיתי, JWT_SECRET, ופרטי מנהל ראשוני
cd apps/server && npx prisma migrate dev && npm run seed && cd ../..
npm run dev:server

# client (בטרמינל נפרד)
cp apps/client/.env.example apps/client/.env   # ברירת המחדל כבר מצביעה ל-localhost:3001
npm run dev:client
```

השרת חושף `/health`, `/auth/login` + `/auth/users`, ו-`/sync/push` +
`/sync/pull` (מוגן אימות, עם אכיפת RBAC — ראו `docs/architecture.md`).
הלקוח חוסם מאחורי מסך התחברות; לאחר כניסה יש שני טאבים: "טפסי שטח"
(עדשת דלק, SVE, Bio-venting, דיגום מי תהום — בחירת אתר, ובאתר "משולב"
גם בחירת פרוטוקול) ו-"הקמת אתר" (מנהל בלבד — לקוחות/אתרים/קידוחים/
מיכלים/מערכות טיפול/פרמטרים/קידוחי ניטור מי תהום/משתמשים). `npm run seed`
(בתוך `apps/server`) יוצר את חשבון המנהל הראשון לפי `SEED_ADMIN_USERNAME`/
`SEED_ADMIN_PASSWORD` ב-`.env`.

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

שלבים 1–7 ב-roadmap הושלמו: שלד הפרויקט, סנכרון בסיסי (outbox + push/
pull עם זיהוי קונפליקטים מבוסס גרסאות), מסך הקמת אתר מלא, כל ארבעת
מודולי טפסי השטח (עדשת דלק, SVE, Bio-venting, דיגום מי תהום — כולל מנוע
פרמטרים גמיש עם באנר סף קריטי אוטומטי), **והתחברות אמיתית עם אכיפת RBAC
בצד השרת**: מנהל בונה מבנה אתרים ומנהל משתמשים, טכנאי ממלא ביקורים
ומעדכן קידוחים קיימים אך עורך רק ביקורים שהוא עצמו יצר באותו יום — נאכף
בשרת (`apps/server/src/sync/permissions.ts`), לא רק ב-UI. כל הכתיבה
עוברת דרך אותו מנגנון סנכרון offline-first. נבדק מקצה-לקצה (curl ישיר
לכל תרחישי ההרשאה + דפדפן אמיתי מלא) מול Postgres אמיתי בכל שלב; תוך
כדי הבדיקות נמצאו ותוקנו באג sync אמיתי ובאג UX (תוויות שדות מתנגשות) —
ראו `docs/roadmap.md`. השלב הבא הוא מנגנון פתרון קונפליקטים מלא.
