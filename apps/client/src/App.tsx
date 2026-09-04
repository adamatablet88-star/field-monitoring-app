import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { db } from "./db";
import { runSync, type SyncSummary } from "./sync";
import { AdminApp } from "./admin/AdminApp";
import { FieldApp } from "./field/FieldApp";
import "./App.css";

type MainTab = "field" | "admin";

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [conflictCount, setConflictCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<SyncSummary | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>("field");

  useEffect(() => {
    db.open()
      .then(() => setDbReady(true))
      .catch((err) => console.error("failed to open local database", err));
  }, []);

  useEffect(() => {
    const subscription = liveQuery(() => db.outbox.toArray()).subscribe({
      next: (entries) => {
        setPendingCount(entries.filter((e) => e.status === "pending").length);
        setConflictCount(entries.filter((e) => e.status === "conflict").length);
      },
      error: (err) => console.error("outbox liveQuery failed", err),
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSyncNow() {
    setSyncing(true);
    setSyncError(null);
    try {
      const summary = await runSync();
      setLastSync(summary);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "שגיאה לא ידועה בסנכרון");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <main dir="rtl">
      <h1>אפליקציית ניטור שטח</h1>
      <p>שלד הפרויקט — ניטור עדשת דלק, מערכות SVE / Bio-venting ודיגום מי תהום.</p>
      <p>
        מסד נתונים מקומי (IndexedDB):{" "}
        <strong>{dbReady ? "מוכן" : "בטעינה..."}</strong>
      </p>

      <section className="sync-status">
        <h2>סנכרון</h2>
        <p>
          שינויים ממתינים לסנכרון: <strong>{pendingCount}</strong>
          {conflictCount > 0 && (
            <>
              {" · "}
              <strong className="conflict">קונפליקטים לפתרון: {conflictCount}</strong>
            </>
          )}
        </p>
        <button type="button" onClick={handleSyncNow} disabled={syncing}>
          {syncing ? "מסנכרן..." : "סנכרן עכשיו"}
        </button>
        {lastSync && (
          <p className="sync-summary">
            עודכן: {lastSync.applied} הצליחו · {lastSync.conflicts} קונפליקטים · {lastSync.errors} שגיאות · {lastSync.pulled} התקבלו מהשרת
          </p>
        )}
        {syncError && <p className="sync-error">שגיאת סנכרון: {syncError}</p>}
      </section>

      <p className="hint">
        טפסי SVE, Bio-venting ודיגום מי תהום עדיין לא מומשו — ראו{" "}
        <code>docs/roadmap.md</code> בשורש המאגר לסדר הפיתוח המתוכנן.
      </p>

      <nav className="tab-bar main-tab-bar">
        <button type="button" className={mainTab === "field" ? "active" : ""} onClick={() => setMainTab("field")}>
          טפסי שטח
        </button>
        <button type="button" className={mainTab === "admin" ? "active" : ""} onClick={() => setMainTab("admin")}>
          הקמת אתר
        </button>
      </nav>

      {mainTab === "field" ? <FieldApp /> : <AdminApp />}
    </main>
  );
}

export default App;
