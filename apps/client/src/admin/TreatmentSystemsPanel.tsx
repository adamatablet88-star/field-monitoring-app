import { useState } from "react";
import type { SystemType, TreatmentSystem } from "@field-monitoring/shared";
import { db } from "../db";
import { newId, useLocalCollection } from "./useLocalCollection";

const CFM_PATTERN = /^\d+\s*CFM$/i;

interface TreatmentSystemsPanelProps {
  siteId: string;
  selectedSystemId: string | null;
  onSelect: (systemId: string) => void;
}

export function TreatmentSystemsPanel({ siteId, selectedSystemId, onSelect }: TreatmentSystemsPanelProps) {
  const { items: allSystems, save, remove } = useLocalCollection<TreatmentSystem>(db.treatmentSystems, "treatmentSystem");
  const systems = allSystems.filter((s) => s.siteId === siteId);

  const [showForm, setShowForm] = useState(false);
  const [systemType, setSystemType] = useState<SystemType>("SVE");
  const [systemLabel, setSystemLabel] = useState("");

  const labelValid = systemType === "SVE" ? CFM_PATTERN.test(systemLabel.trim()) : systemLabel.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!labelValid) return;
    await save({ id: newId(), siteId, systemType, systemLabel: systemLabel.trim(), parameters: [] });
    setSystemLabel("");
    setShowForm(false);
  }

  return (
    <section className="panel">
      <h2>מערכות טיפול (SVE / Bio-venting)</h2>
      <ul className="entity-list">
        {systems.map((system) => (
          <li key={system.id}>
            <button
              type="button"
              className={system.id === selectedSystemId ? "entity-row selected" : "entity-row"}
              onClick={() => onSelect(system.id)}
            >
              [{system.systemType}] {system.systemLabel}
            </button>
            <button type="button" className="danger-link" onClick={() => remove(system)}>
              מחק
            </button>
          </li>
        ))}
        {systems.length === 0 && <li className="empty-hint">אין עדיין מערכות טיפול באתר זה</li>}
      </ul>

      {showForm ? (
        <form onSubmit={handleSubmit} className="inline-form stacked">
          <label>
            סוג מערכת
            <select
              value={systemType}
              onChange={(e) => {
                setSystemType(e.target.value as SystemType);
                setSystemLabel("");
              }}
            >
              <option value="SVE">SVE</option>
              <option value="bioVenting">Bio-venting</option>
            </select>
          </label>
          <label>
            {systemType === "SVE" ? "גודל מערכת" : "שם מערכת"}
            <input
              value={systemLabel}
              onChange={(e) => setSystemLabel(e.target.value)}
              placeholder={systemType === "SVE" ? "300 CFM" : "מערכת המלאכה"}
              required
            />
          </label>
          {systemType === "SVE" && !labelValid && systemLabel.length > 0 && (
            <p className="field-error">פורמט מצופה: מספר ואחריו CFM, למשל "300 CFM"</p>
          )}
          <div>
            <button type="submit" disabled={!labelValid}>
              שמור
            </button>
            <button type="button" onClick={() => setShowForm(false)}>
              ביטול
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setShowForm(true)}>
          + מערכת חדשה
        </button>
      )}
    </section>
  );
}
