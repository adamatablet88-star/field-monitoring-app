import { useState } from "react";
import type { FrequencySetting, FrequencyValue, TreatmentSystem } from "@field-monitoring/shared";
import { FREQUENCY_LABELS } from "@field-monitoring/shared";
import { db } from "../db";
import { newId, useLocalCollection } from "./useLocalCollection";
import { getStoredUser } from "../auth/authStore";
import { scopeEquals, siteScope, systemScope } from "./scope";

interface ScopeRow {
  key: string;
  label: string;
  scope: ReturnType<typeof siteScope>;
}

interface FrequencySettingsPanelProps {
  siteId: string;
}

export function FrequencySettingsPanel({ siteId }: FrequencySettingsPanelProps) {
  const { items: allSettings, save } = useLocalCollection<FrequencySetting>(db.frequencySettings, "frequencySetting");
  const { items: allSystems } = useLocalCollection<TreatmentSystem>(db.treatmentSystems, "treatmentSystem");
  const systems = allSystems.filter((s) => s.siteId === siteId);

  const rows: ScopeRow[] = [
    { key: "site", label: "האתר (עדשת דלק)", scope: siteScope(siteId) },
    ...systems.map((s) => ({ key: s.id, label: `מערכת: [${s.systemType}] ${s.systemLabel}`, scope: systemScope(s.id) })),
  ];

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newValue, setNewValue] = useState<FrequencyValue>("annual");
  const [reason, setReason] = useState("");

  function startEdit(key: string, current: FrequencyValue | null) {
    setEditingKey(key);
    setNewValue(current ?? "annual");
    setReason("");
  }

  async function handleSubmit(e: React.FormEvent, row: ScopeRow, existing: FrequencySetting | null) {
    e.preventDefault();
    const user = getStoredUser();
    if (!existing) {
      await save({ id: newId(), scope: row.scope, defaultFrequency: newValue, currentFrequency: newValue, history: [] });
    } else {
      if (!reason.trim()) return;
      await save({
        ...existing,
        currentFrequency: newValue,
        history: [
          ...existing.history,
          {
            changedBy: user?.username ?? "לא ידוע",
            changedAt: new Date().toISOString(),
            reason: reason.trim(),
            previousValue: existing.currentFrequency,
          },
        ],
      });
    }
    setEditingKey(null);
  }

  return (
    <section className="panel">
      <h2>תדירויות ניטור</h2>
      <ul className="entity-list">
        {rows.map((row) => {
          const existing = allSettings.find((s) => scopeEquals(s.scope, row.scope)) ?? null;
          return (
            <li key={row.key} className="stacked-item">
              <div className="entity-row static">
                <strong>{row.label}</strong> —{" "}
                {existing ? FREQUENCY_LABELS[existing.currentFrequency] : "לא הוגדר (ברירת מחדל: שנתי)"}
              </div>

              {existing && existing.history.length > 0 && (
                <details>
                  <summary>היסטוריית שינויים ({existing.history.length})</summary>
                  <ul className="history-list">
                    {existing.history
                      .slice()
                      .reverse()
                      .map((h, i) => (
                        <li key={i}>
                          {new Date(h.changedAt).toLocaleDateString("he-IL")} — {h.changedBy}: מ-
                          {FREQUENCY_LABELS[h.previousValue]} · סיבה: {h.reason}
                        </li>
                      ))}
                  </ul>
                </details>
              )}

              {editingKey === row.key ? (
                <form
                  onSubmit={(e) => handleSubmit(e, row, existing)}
                  className="inline-form"
                >
                  <label>
                    תדירות חדשה
                    <select value={newValue} onChange={(e) => setNewValue(e.target.value as FrequencyValue)}>
                      {(Object.keys(FREQUENCY_LABELS) as FrequencyValue[]).map((f) => (
                        <option key={f} value={f}>
                          {FREQUENCY_LABELS[f]}
                        </option>
                      ))}
                    </select>
                  </label>
                  {existing && (
                    <label>
                      סיבת השינוי
                      <input value={reason} onChange={(e) => setReason(e.target.value)} required />
                    </label>
                  )}
                  <button type="submit">שמור</button>
                  <button type="button" onClick={() => setEditingKey(null)}>
                    ביטול
                  </button>
                </form>
              ) : (
                <button type="button" onClick={() => startEdit(row.key, existing?.currentFrequency ?? null)}>
                  {existing ? "שנה תדירות" : "הגדר תדירות"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
