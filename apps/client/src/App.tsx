import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import type { PublicUser } from "@field-monitoring/shared";
import { db } from "./db";
import { runSync, type SyncSummary } from "./sync";
import { AdminApp } from "./admin/AdminApp";
import { FieldApp } from "./field/FieldApp";
import { ConflictsPanel } from "./sync/ConflictsPanel";
import { LoginForm } from "./auth/LoginForm";
import { getStoredUser, clearAuth } from "./auth/authStore";
import "./App.css";

type MainTab = "field" | "admin";

function App() {
  const [user, setUser] = useState<PublicUser | null>(() => getStoredUser());
  const [dbReady, setDbReady] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [conflictCount, setConflictCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<SyncSummary | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>("field");
  const [conflictsOpen, setConflictsOpen] = useState(false);

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

  function handleLogout() {
    clearAuth();
    setUser(null);
  }

  if (!user) {
    return <LoginForm onLogin={setUser} />;
  }

  return (
    <main dir="rtl">
      <div className="user-bar">
        <span>
          מחובר/ת כ-<strong>{user.username}</strong> ({user.role === "admin" ? "מנהל" : "טכנאי שטח"})
        </span>
        <button type="button" onClick={handleLogout}>
          התנתק
        </button>
      </div>

      <h1>אפליקציית ניטור שטח</h1>
      <p>ניטור עדשת דלק, מערכות SVE / Bio-venting ודיגום מי תהום.</p>
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
        {(conflictCount > 0 || conflictsOpen) && (
          <button type="button" onClick={() => setConflictsOpen((open) => !open)}>
            {conflictsOpen ? "הסתר קונפליקטים" : "פתרון קונפליקטים"}
          </button>
        )}
        {lastSync && (
          <p className="sync-summary">
            עודכן: {lastSync.applied} הצליחו · {lastSync.conflicts} קונפליקטים · {lastSync.errors} שגיאות · {lastSync.pulled} התקבלו מהשרת
          </p>
        )}
        {syncError && <p className="sync-error">שגיאת סנכרון: {syncError}</p>}
        {conflictsOpen && <ConflictsPanel />}
      </section>

      <nav className="tab-bar main-tab-bar">
        <button type="button" className={mainTab === "field" ? "active" : ""} onClick={() => setMainTab("field")}>
          טפסי שטח
        </button>
        {user.role === "admin" && (
          <button type="button" className={mainTab === "admin" ? "active" : ""} onClick={() => setMainTab("admin")}>
            הקמת אתר
          </button>
        )}
      </nav>

      {mainTab === "admin" && user.role === "admin" ? <AdminApp /> : <FieldApp />}
    </main>
  );
}

export default App;
