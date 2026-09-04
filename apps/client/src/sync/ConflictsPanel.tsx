import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { db, type OutboxEntry } from "../db";
import { resolveConflictKeepMine, resolveConflictKeepServer, discardConflict, pushPending } from "../sync";
import { ENTITY_TYPE_LABELS, OPERATION_LABELS } from "./entityLabels";
import { diffPayloads } from "./diff";

/**
 * Full conflict-resolution UI (roadmap step 8). Detection already existed
 * (step 2, optimistic-concurrency version check on push); this is the
 * "compare and choose/merge" interface docs/architecture.md requires
 * before any conflicting write is allowed to land — no silent overwrite.
 */
export function ConflictsPanel() {
  const [conflicts, setConflicts] = useState<OutboxEntry[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = liveQuery(() =>
      db.outbox.where("status").equals("conflict").toArray(),
    ).subscribe({
      next: setConflicts,
      error: (err) => console.error("conflicts liveQuery failed", err),
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleKeepMine(id: number) {
    setBusyId(id);
    setError(null);
    try {
      await resolveConflictKeepMine(id);
      await pushPending();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בסנכרון מחדש");
    } finally {
      setBusyId(null);
    }
  }

  async function handleKeepServer(id: number) {
    setBusyId(id);
    setError(null);
    try {
      await resolveConflictKeepServer(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בעדכון המסד המקומי");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDiscard(id: number) {
    setBusyId(id);
    setError(null);
    try {
      await discardConflict(id);
    } finally {
      setBusyId(null);
    }
  }

  if (conflicts.length === 0) {
    return <p className="conflicts-empty">אין קונפליקטים ממתינים לפתרון.</p>;
  }

  return (
    <div className="conflicts-panel">
      {error && <p className="sync-error">{error}</p>}
      {conflicts.map((entry) => {
        const hasServerData = entry.serverPayload !== undefined && entry.serverPayload !== null;
        const rows = hasServerData ? diffPayloads(entry.payload, entry.serverPayload) : [];
        const busy = busyId === entry.id;

        return (
          <div key={entry.id} className="conflict-card">
            <h3>
              {ENTITY_TYPE_LABELS[entry.entityType] ?? entry.entityType} · {OPERATION_LABELS[entry.operation]}
            </h3>
            {entry.message && <p className="conflict-message">{entry.message}</p>}

            {hasServerData ? (
              <table className="conflict-diff">
                <thead>
                  <tr>
                    <th>שדה</th>
                    <th>הגרסה שלי (במכשיר)</th>
                    <th>הגרסה בשרת</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key} className={row.changed ? "diff-changed" : undefined}>
                      <td>{row.key}</td>
                      <td>{row.local}</td>
                      <td>{row.server}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>אין נתוני שרת להשוואה (התנגשות ביצירה) — יש ליישב ידנית ואז למחוק מהתור.</p>
            )}

            <div className="conflict-actions">
              {hasServerData && (
                <>
                  <button type="button" disabled={busy} onClick={() => handleKeepMine(entry.id as number)}>
                    השתמש בגרסה שלי (דורס את השרת)
                  </button>
                  <button type="button" disabled={busy} onClick={() => handleKeepServer(entry.id as number)}>
                    השתמש בגרסת השרת (מבטל את השינוי שלי)
                  </button>
                </>
              )}
              <button type="button" disabled={busy} onClick={() => handleDiscard(entry.id as number)}>
                מחק מהתור בלי לשמור
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
